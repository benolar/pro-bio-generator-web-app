const admin = require('firebase-admin');
const { kv } = require('@vercel/kv'); 

// --- 1. FIREBASE ADMIN SDK INITIALIZATION ---

if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!serviceAccountJson) {
            console.error("FIREBASE_SERVICE_ACCOUNT environment variable is not set. Database will be unavailable.");
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
const db = admin.apps.length > 0 ? admin.firestore() : null; // Only get firestore if initialized


// --- 2. CONFIGURATION & UTILITY FUNCTIONS ---

// The SDK is no longer strictly necessary, but we keep the key check
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
    console.error('FATAL: GEMINI_API_KEY is not set in Vercel Environment Variables.');
    throw new Error('Server misconfiguration: Gemini API Key missing.'); 
}

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

// Character limits
const CHAR_LIMITS = {
    'short': 160, 'General': 160, 'medium': 300, 'fixed-long': 500, 'custom': null
};

// JSON Response Schema for Structured Output (Forces Model Consistency)
const BIO_SCHEMA = {
    type: "OBJECT",
    properties: {
        "bios": {
            type: "ARRAY",
            description: "An array containing five distinct bio suggestions.",
            items: {
                type: "STRING",
                description: "A single, optimized bio string, strictly adhering to the character limit."
            }
        }
    },
    required: ["bios"]
};


// Function for exponential backoff and retry mechanism
const fetchWithRetry = async (url, options, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429) { // Too Many Requests
                throw new Error('Rate limit exceeded');
            }
            if (!response.ok) {
                // Treat server errors (5xx) as potentially retryable
                if (response.status >= 500 && i < maxRetries - 1) {
                    throw new Error(`Retryable HTTP error! status: ${response.status}`);
                }
                // For final attempt or client errors (4xx), throw a detailed error
                const errorBody = await response.json().catch(() => ({}));
                const errorMessage = errorBody.error?.message || `HTTP error! status: ${response.status} (attempt ${i + 1}/${maxRetries})`;
                throw new Error(errorMessage);
            }
            return response;
        } catch (error) {
            // Log retry attempts but not as errors unless it's the final failure
            if (error.message.includes('Retryable HTTP error') || error.message.includes('NetworkError')) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
                console.warn(`Attempt ${i + 1} failed. Retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error; // Re-throw non-retryable errors immediately
            }
        }
    }
    throw new Error('All fetch attempts failed.');
};


// Input sanitization
const sanitizeInput = (input) => {
    return input ? input.replace(/[<>]/g, '').trim().slice(0, 500) : '';
};

// Vercel KV-based Rate limiting (Uses user ID and IP)
const RATE_LIMIT = { window: 60, max: 10 }; // 10 requests per 60 seconds (per user)
const IP_RATE_LIMIT = { window: 3600, max: 100 }; // 100 requests per 1 hour (per IP)

async function checkRateLimit(userId, ip) {
    // CRITICAL GUARD: Check if KV is initialized and ready
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.warn('Vercel KV environment variables missing. Rate limiting disabled.');
        return; // Skip rate limiting if KV is not configured
    }

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
    if (!db || !admin.apps.length) {
         console.warn("Skipping verification: Firebase Admin SDK is not ready.");
         return false;
    }
    
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
    if (!db || !admin.apps.length) {
         throw new Error('Server misconfiguration: Firebase Admin SDK is not initialized.');
    }
    
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
    
    // CRITICAL GUARD: Check all external services are configured
    if (!process.env.GEMINI_API_KEY || !admin.apps.length) {
        console.error(`AI Key Present: ${!!process.env.GEMINI_API_KEY}, Admin SDK Ready: ${admin.apps.length > 0}`);
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

        // **UPDATED SYSTEM PROMPT FOR JSON OUTPUT (Simpler)**
        const systemInstruction = `You are a copywriter. Generate five distinct bio options optimized for '${sPlatform}' using a '${sTone}' style. The maximum length for each bio is ${maxLength} characters. Return ONLY a JSON object that matches the provided schema.`;

        const userQuery = `My niche/role is: ${sNiche}. My key goals/keywords are: ${sGoals}.`;
        
        // --- Execute AI Request using direct FETCH and Retry ---

        const payload = {
            contents: [{ role: 'user', parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: { 
                temperature: 0.8, 
                maxOutputTokens: Math.ceil((maxLength || 500) / 4 * 5) + 100,
                responseMimeType: "application/json",
                responseSchema: BIO_SCHEMA
            }
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
        
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        const candidate = result.candidates?.[0];
        const jsonText = candidate?.content?.parts?.[0]?.text;
        const finishReason = candidate?.finishReason;
        const safetyRatings = candidate?.safetyRatings;
        const promptFeedback = result.promptFeedback;

        let generatedBios = null;

        if (jsonText) {
            try {
                const parsedJson = JSON.parse(jsonText);
                generatedBios = parsedJson.bios;
            } catch (parseError) {
                console.error("Failed to parse JSON response from model:", parseError.message);
                // Treat parsing error as a model generation failure
            }
        }

        if (!generatedBios || generatedBios.length === 0) {
            // Log for internal debugging
            console.error("AI Generation failed to return bios array. Finish Reason:", finishReason, "Safety:", safetyRatings, "Prompt Feedback:", promptFeedback); 

            let errorMessage = 'AI failed to generate content. Try a simpler niche or adjust your tone/goals.';
            let reason = finishReason;

            if (promptFeedback && promptFeedback.blockReason) {
                reason = promptFeedback.blockReason;
                errorMessage = 'Your request was blocked by safety filters before generation could start. Please review your input.';
            } else if (finishReason && finishReason.includes('SAFETY')) {
                 errorMessage = 'Content blocked by safety filters. Please adjust your niche or goals to be less sensitive.';
            } else if (finishReason && finishReason.includes('RECITATION')) {
                 errorMessage = 'Content blocked due to data policy (recitation). Try changing your input slightly.';
            } else if (finishReason && finishReason.includes('MAX_TOKENS')) {
                 errorMessage = 'Generation stopped early due to the max token limit. Try a shorter bio length.';
            } else if (!reason) {
                 reason = 'UnknownModelFailure';
                 // Keep the generic message
            }

            console.error(`Returning 422 error with final reason: ${reason}`);
            
            return res.status(422).json({ error: errorMessage, finishReason: reason });
        }

        // 7. Success - Format the list of bios back into a numbered string for the client
        const outputText = generatedBios.map((bio, index) => `${index + 1}. ${bio.trim()}`).join('\n\n');
        res.status(200).json({ text: outputText });

    } catch (error) {
        let status = 500;
        if (error.message.includes('Invalid session') || error.message.includes('No session token')) {
            status = 401; // Unauthorized
        } else if (error.message.includes('Rate limit') || error.message.includes('timeout')) {
            status = 429; // Too Many Requests
        } else if (error.message.includes('Validation failed') || error.message.includes('HTTP error! status: 400')) {
            status = 400; // Bad Request
        }
        
        console.error(`Request failed for user ${userId || 'unknown'}:`, error.message);
        res.status(status).json({ error: error.message });
    }
};
