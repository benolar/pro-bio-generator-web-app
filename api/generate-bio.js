const { GoogleGenAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const { kv } = require('@vercel/kv'); 

// --- 1. FIREBASE ADMIN SDK INITIALIZATION ---

if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!serviceAccountJson) {
            console.error("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
        } else {
            const serviceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
    } catch (e) {
        console.error("Firebase Admin SDK Initialization Error:", e.message);
    }
}
const db = admin.firestore();


// --- 2. CONFIGURATION & UTILITY FUNCTIONS ---

const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
    console.error('FATAL: GEMINI_API_KEY is not set in Vercel Environment Variables.');
    // Exit early or throw an error to prevent further execution without the key
    throw new Error('Server misconfiguration: Gemini API Key missing.'); 
}

const ai = new GoogleGenAI(apiKey);
const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

// Character limits
const CHAR_LIMITS = {
    'short': 160, 'General': 160, 'medium': 300, 'fixed-long': 500, 'custom': null
};

// Input sanitization
const sanitizeInput = (input) => {
    return input ? input.replace(/[<>]/g, '').trim().slice(0, 500) : '';
};

// Vercel KV-based Rate limiting (Uses user ID and IP)
const RATE_LIMIT = { window: 60, max: 10 }; // 10 requests per 60 seconds (per user)
const IP_RATE_LIMIT = { window: 3600, max: 100 }; // 100 requests per 1 hour (per IP)

async function checkRateLimit(userId, ip) {
    const userKey = `rate_limit_user_${userId}`;
    const ipKey = `rate_limit_ip_${ip}`;
    
    const [userCount, ipCount] = await Promise.all([
        kv.get(userKey),
        kv.get(ipKey)
    ]);

    if (userCount && userCount >= RATE_LIMIT.max) {
        throw new Error('User rate limit exceeded. Please try again later.');
    }
    if (ipCount && ipCount >= IP_RATE_LIMIT.max) {
        throw new Error('IP rate limit exceeded. Please try again later.');
    }

    const p = kv.pipeline();
    p.incr(userKey); p.expire(userKey, RATE_LIMIT.window);
    p.incr(ipKey); p.expire(ipKey, IP_RATE_LIMIT.window);

    await p.exec();
}

// EARLY APP ID VALIDATION (Source of Truth)
const TRUSTED_APP_ID = process.env.SECURE_APP_ID;
const effectiveAppId = TRUSTED_APP_ID || 'default-app-id';

// Input validation schema
const validateBioRequest = (body) => {
    const errors = [];
    const maxInputLength = 1000;
    
    if (!body.niche?.trim() || body.niche.length > maxInputLength) {
        errors.push('Invalid niche');
    }
    
    const validTones = ['Professional & Authoritative', 'Witty & Humorous', 'Friendly & Approachable', 'Minimalist & Concise'];
    if (!validTones.includes(body.tone)) {
        errors.push('Invalid tone');
    }

    const validPlatforms = ['General', 'LinkedIn', 'X/Twitter', 'Instagram', 'TikTok', 'Upwork', 'Fiverr', 'Freelancer', 'YouTube'];
    if (!validPlatforms.includes(body.platform)) {
        errors.push('Invalid platform');
    }
    
    const validLengths = ['short', 'medium', 'fixed-long', 'custom'];
    if (!validLengths.includes(body.length)) {
        errors.push('Invalid length');
    }
    
    if (body.length === 'custom') {
        const customLength = parseInt(body.customLength);
        if (isNaN(customLength) || customLength < 300 || customLength > 1000) {
            errors.push('Invalid custom length (must be between 300 and 1000)');
        }
    }
    
    return errors;
};

// Server-side verification of stored fwTransactionId and refresh isPro status
async function verifyStoredTransactionAndRefresh(userId, appId) {
    try {
        const statusDocRef = db.doc(`artifacts/${appId}/users/${userId}/profile/status`);
        const statusSnap = await statusDocRef.get();
        if (!statusSnap.exists) return false;

        const statusData = statusSnap.data();
        const fwTx = statusData?.fwTransactionId;

        const cacheMinutes = parseInt(process.env.PRO_VERIFY_CACHE_MIN, 10) || 10;
        const CACHE_TTL_MS = cacheMinutes * 60 * 1000;
        const now = Date.now();

        const toMillis = (ts) => {
            if (!ts) return null;
            if (typeof ts.toDate === 'function') return ts.toDate().getTime();
            if (typeof ts === 'number') return ts;
            try { return new Date(ts).getTime(); } catch { return null; }
        };

        const lastVerifiedMs = toMillis(statusData.lastVerifiedAt);
        const lastFailedMs = toMillis(statusData.lastVerificationFailedAt);

        // 1. CACHE HIT: If last verification succeeded recently, trust cache
        if (lastVerifiedMs && (now - lastVerifiedMs) < CACHE_TTL_MS) {
            return statusData?.isPro === true;
        }

        // 2. AVOID RE-CHECKING FAILED: If last verification failed recently, avoid re-checking
        if (lastFailedMs && (now - lastFailedMs) < CACHE_TTL_MS) {
            return false;
        }

        // 3. NO TX ID: Fallback if no transaction ID exists
        if (!fwTx) return statusData?.isPro === true;

        // 4. CACHE MISS / EXPIRED: Call Flutterwave verify endpoint
        const verifyResp = await fetch(`https://api.flutterwave.com/v3/transactions/${fwTx}/verify`, {
            headers: { 'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
        });

        if (!verifyResp.ok) {
            await statusDocRef.set({ lastVerificationFailedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
            return false;
        }

        const verifyJson = await verifyResp.json();

        const expectedAmount = parseFloat(process.env.FLUTTERWAVE_AMOUNT);
        const expectedCurrency = process.env.FLUTTERWAVE_CURRENCY || 'USD';

        // Check verification success criteria
        const ok = verifyJson?.status === 'success'
            && verifyJson.data?.status === 'successful'
            && parseFloat(verifyJson.data?.amount) === expectedAmount
            && (verifyJson.data?.currency || expectedCurrency) === expectedCurrency;

        if (ok) {
            await statusDocRef.set({ isPro: true, lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
            return true;
        } else {
            await statusDocRef.set({ isPro: false, revokedAt: admin.firestore.FieldValue.serverTimestamp(), lastVerificationFailedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
            return false;
        }
    } catch (err) {
        console.error('Error verifying stored transaction:', err);
        try {
            const statusDocRef = db.doc(`artifacts/${appId}/users/${userId}/profile/status`);
            await statusDocRef.set({ lastVerificationFailedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        } catch (e) {
             // Swallow secondary errors
        }
        return false;
    }
}

/**
 * Validates the session token from the Authorization header and returns the decoded token.
 * @param {object} req - The Vercel request object.
 * @returns {Promise<object>} The decoded Firebase ID token payload.
 */
async function validateSession(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No session token provided');
    }
    const sessionToken = authHeader.split(' ')[1];
    
    try {
        // Use verifyIdToken for short-lived tokens, which is standard for client auth headers
        const decodedToken = await admin.auth().verifyIdToken(sessionToken);
        return decodedToken;
    } catch (error) {
        // Log the error internally but present a generic error to the client
        console.error('Session validation failed:', error.message);
        throw new Error('Invalid session');
    }
}


// --- 4. MAIN SERVERLESS HANDLER ---

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    if (!process.env.GEMINI_API_KEY || !admin.apps.length) {
        return res.status(503).json({ error: 'Server configuration error: AI or Database service unavailable.' });
    }

    let decodedToken;
    let userId;

    try {
        // 1. SESSION VALIDATION (Authorization)
        decodedToken = await validateSession(req);
        userId = decodedToken.uid; 

        // Extract client body data
        const { niche, tone, goals, length, customLength, platform } = req.body;
        
        // 2. INPUT VALIDATION
        if (!niche || !tone || !length || !platform) {
            return res.status(400).json({ error: 'Missing required parameters (niche, tone, length, platform).' });
        }

        const validationErrors = validateBioRequest(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: 'Validation failed', details: validationErrors });
        }

        // Determine Max Length and Check for Pro Feature Use
        let maxLength = CHAR_LIMITS[length];
        if (length === 'custom' && customLength) {
            maxLength = Math.min(parseInt(customLength, 10), 1000);
        }
        const isProFeatureUsed = (length !== 'short' || platform !== 'General');
        
        // 3. CRITICAL: SERVER-SIDE FEATURE GATE CHECK & FIRST PRO STATUS CHECK (Fast, Direct Firestore Read)
        if (isProFeatureUsed) {
            try {
                const statusDocRef = db.doc(`artifacts/${effectiveAppId}/users/${userId}/profile/status`);
                const doc = await statusDocRef.get();
                const isPro = doc.exists && doc.data().isPro === true;

                if (!isPro) {
                    console.warn(`Non-Pro User ${userId} attempted to access Pro feature: ${length} / ${platform}`);
                    // Return a specific error indicating a paywall block
                    return res.status(403).json({ 
                        error: 'Access Denied: The selected feature requires Pro Mode. Please unlock Pro access.' 
                    });
                }
            } catch (dbError) {
                console.error("Firestore access error during initial Pro check:", dbError);
                // Allow the free feature to proceed in case of a DB error, but block the Pro feature
                if (isProFeatureUsed) {
                return res.status(500).json({ error: 'Internal server error while checking Pro status.' });
                }
            }
        }
        
        // 4. RATE LIMIT CHECK (uses Vercel KV)
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        await checkRateLimit(userId, clientIp);

        // 5. CRITICAL: SECOND PRO STATUS CHECK (Secure, Comprehensive Check)
        if (isProFeatureUsed) {
            // This second check runs the full cache/API verification immediately before the expensive operation.
            const stillPro = await verifyStoredTransactionAndRefresh(userId, effectiveAppId);
            
            if (!stillPro) {
                console.warn(`Pro access denied for user ${userId} using feature: ${length} / ${platform}`);
                return res.status(403).json({ 
                    error: 'Access Denied: The selected feature requires Pro Mode. Please unlock Pro access.' 
                });
            }
        }
        
        // 5. Sanitize and Construct AI Prompt
        const sNiche = sanitizeInput(niche);
        const sTone = sanitizeInput(tone);
        const sGoals = sanitizeInput(goals);
        const sPlatform = sanitizeInput(platform);

        const systemPrompt = `You are a world-class copywriter specializing in creating highly optimized, attention-grabbing bios for professional and social media platforms.
        Your task is to generate five distinct bio options based on the user's input.
        - Style: The tone must be strictly '${sTone}'.
        - Platform: The bio must be optimized for a '${sPlatform}' audience, including appropriate emojis, keywords, and call-to-actions relevant to that platform.
        - Format: Output must be a numbered list (1., 2., 3., 4., 5.). Do NOT include any introductory or concluding text, only the list.
        - Length: Each bio must be concise and strictly adhere to a maximum character count of ${maxLength} characters.`;

        const userQuery = `My niche/role is: ${sNiche}. My key goals/keywords are: ${sGoals}.`;

        const TIMEOUT = 30000;
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI Request timeout')), TIMEOUT)
        );

        const aiPromise = ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            config: { 
                temperature: 0.8, 
                maxOutputTokens: Math.ceil((maxLength || 500) / 4 * 5) + 100 
            }
        });

        // 6. Execute AI Request
        const result = await Promise.race([aiPromise, timeoutPromise]);
        
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: 'AI failed to generate content. Try a simpler niche.' });
        }

        // 7. Success
        res.status(200).json({ text });

    } catch (error) {
        let status = 500;
        if (error.message.includes('Invalid session') || error.message.includes('No session token')) {
            status = 401; // Unauthorized
        } else if (error.message.includes('Rate limit') || error.message.includes('timeout')) {
            status = 429; // Too Many Requests
        } else if (error.message.includes('Validation failed')) {
            status = 400; // Bad Request
        }
        
        console.error(`Request failed for user ${userId || 'unknown'}:`, error.message);
        res.status(status).json({ error: error.message });
    }
};
