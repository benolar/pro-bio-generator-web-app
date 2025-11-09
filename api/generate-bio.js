
const { GoogleGenAI } = require('@google/genai');
const admin = require('firebase-admin');
const { createClient } = require('@vercel/kv'); 

// --- 1. FIREBASE ADMIN SDK INITIALIZATION ---

if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.error("Firebase Admin SDK Initialization Error:", e.message);
    }
}
const db = admin.firestore();


// --- 2. CONFIGURATION & UTILITY FUNCTIONS ---

let kv;
if (process.env.BGNRT_KV_REST_API_URL && process.env.BGNRT_KV_REST_API_TOKEN) {
    kv = createClient({
        url: process.env.BGNRT_KV_REST_API_URL,
        token: process.env.BGNRT_KV_REST_API_TOKEN,
    });
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

const sanitizeInput = (input) => input ? input.replace(/[<>]/g, '').trim().slice(0, 2000) : '';

const RATE_LIMIT = { window: 60, max: 15 };
const IP_RATE_LIMIT = { window: 3600, max: 150 };

async function checkRateLimit(userId, ip) {
    if (!kv) return; // Rate limiting disabled if KV is not configured
    const userKey = `rate_limit_user_${userId}`;
    const ipKey = `rate_limit_ip_${ip}`;
    const [userCount, ipCount] = await Promise.all([kv.get(userKey), kv.get(ipKey)]);
    if (userCount && userCount >= RATE_LIMIT.max) throw new Error('User rate limit exceeded.');
    if (ipCount && ipCount >= IP_RATE_LIMIT.max) throw new Error('IP rate limit exceeded.');
    const p = kv.pipeline();
    p.incr(userKey); p.expire(userKey, RATE_LIMIT.window);
    p.incr(ipKey); p.expire(ipKey, IP_RATE_LIMIT.window);
    await p.exec();
}

const TRUSTED_APP_ID = process.env.SECURE_APP_ID || 'default-app-id';

function isProFeatureRequested(prompt) {
    const proKeywords = ['linkedin', 'instagram', 'twitter', 'x.com', 'tiktok', 'youtube', 'upwork', 'fiverr', 'freelancer', 'medium', 'long', '500 characters', '300 characters', 'custom length'];
    const lowerCasePrompt = prompt.toLowerCase();
    return proKeywords.some(keyword => lowerCasePrompt.includes(keyword));
}

async function validateSession(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('No session token provided');
    const sessionToken = authHeader.split(' ')[1];
    try {
        return await admin.auth().verifyIdToken(sessionToken);
    } catch (error) {
        console.error('Session validation failed:', error.message);
        throw new Error('Invalid session');
    }
}

async function generateWithRetry(payload, maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await ai.models.generateContent(payload);
            if (!result.text?.trim()) {
                throw new Error("AI returned an empty response.");
            }
            return result;
        } catch (error) {
            lastError = error;
            if (error.message && (error.message.includes('503') || error.message.toLowerCase().includes('unavailable'))) {
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            } else {
                // Don't retry on other errors (like content filters)
                throw error;
            }
        }
    }
    throw lastError;
}


// --- 4. MAIN SERVERLESS HANDLER ---

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    if (!process.env.GEMINI_API_KEY || !admin.apps.length) {
        return res.status(503).json({ error: 'Server configuration error: AI or Database service unavailable.' });
    }

    let userId;
    try {
        const decodedToken = await validateSession(req);
        userId = decodedToken.uid;
        let { prompt, chatId } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({ error: 'Missing or invalid prompt.' });
        }
        
        const needsPro = isProFeatureRequested(prompt);
        if (needsPro) {
            const statusDocRef = db.doc(`artifacts/${TRUSTED_APP_ID}/users/${userId}/profile/status`);
            const doc = await statusDocRef.get();
            if (!doc.exists() || doc.data().isPro !== true) {
                return res.status(403).json({ error: 'This feature requires Pro Access.' });
            }
        }
        
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        await checkRateLimit(userId, clientIp);
        
        const sPrompt = sanitizeInput(prompt);
        const isNewChat = !chatId;
        
        if (isNewChat) {
            const newChatRef = db.collection(`artifacts/${TRUSTED_APP_ID}/users/${userId}/chats`).doc();
            chatId = newChatRef.id;
        }

        const messagesRef = db.collection(`artifacts/${TRUSTED_APP_ID}/users/${userId}/chats/${chatId}/messages`);
        await messagesRef.add({
            role: 'user',
            text: sPrompt,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const systemInstruction = `You are a world-class copywriter specializing in creating highly optimized, attention-grabbing bios for professional and social media platforms. Your task is to generate five distinct bio options based on the user's request.
        - Analyze the user's prompt to infer the desired tone, target platform, length constraints, and key goals.
        - If no length is specified, default to a short bio (around 160 characters).
        - Format: Output must be a numbered list (1., 2., 3., 4., 5.).
        - CRITICAL: Do NOT include any introductory text, concluding text, or any conversational filler. Only output the numbered list of bios.`;
        
        const aiPayload = {
            model: MODEL_NAME,
            contents: sPrompt,
            config: { systemInstruction, temperature: 0.8 }
        };
        
        const result = await generateWithRetry(aiPayload);
        const bioText = result.text;
        
        await messagesRef.add({
            role: 'ai',
            text: bioText,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const chatRef = db.doc(`artifacts/${TRUSTED_APP_ID}/users/${userId}/chats/${chatId}`);
        const chatUpdatePayload = {
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            lastMessage: sPrompt.substring(0, 100)
        };

        if (isNewChat) {
            try {
                const titlePrompt = `Generate a concise, 5-word-or-less title for a chat that starts with this user prompt: "${sPrompt}"`;
                const titleResult = await generateWithRetry({
                    model: MODEL_NAME,
                    contents: titlePrompt,
                    config: { temperature: 0.2 }
                });
                chatUpdatePayload.title = titleResult.text.replace(/["']/g, "").trim();
            } catch (titleError) {
                console.error(`Could not generate title for chat ${chatId}:`, titleError);
                chatUpdatePayload.title = sPrompt.substring(0, 30) + "...";
            }
        }

        await chatRef.set(chatUpdatePayload, { merge: true });

        const responsePayload = { text: bioText };
        if (isNewChat) {
            responsePayload.chatId = chatId;
        }

        res.status(200).json(responsePayload);

    } catch (error) {
        console.error(`Request failed for user ${userId || 'unknown'}:`, error);
        let status = 500;
        let errorMessage = 'An unexpected server error occurred.';
        if (error.message.includes('Invalid session')) { status = 401; errorMessage = 'Your session is invalid.'; }
        else if (error.message.includes('Rate limit')) { status = 429; errorMessage = error.message; }
        else if (error.message.includes('Pro Access')) { status = 403; errorMessage = error.message; }
        else if (error.message) { errorMessage = error.message; }
        
        res.status(status).json({ error: errorMessage });
    }
};
