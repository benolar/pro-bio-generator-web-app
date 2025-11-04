// Vercel Serverless Function: api/webhook.js
// This function handles incoming webhooks from Flutterwave for successful payments.

const firebaseAdmin = require('firebase-admin');
const crypto = require('crypto');
const { createClient } = require('@vercel/kv');

// IMPORTANT: Vercel serverless functions need this to read the raw body for signature verification.
export const config = {
    api: {
        bodyParser: false,
    },
};

let admin; // Initialized Firebase Admin SDK 
let db;    // Firestore instance
const WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
const FALLBACK_APP_ID = 'default-app-id';

// --- Vercel KV Initialization (for OAuth token) ---
let kv;
if (process.env.BGNRT_KV_REST_API_URL && process.env.BGNRT_KV_REST_API_TOKEN) {
    kv = createClient({
        url: process.env.BGNRT_KV_REST_API_URL,
        token: process.env.BGNRT_KV_REST_API_TOKEN,
    });
} else {
    kv = null;
    console.error('Vercel KV is not configured. OAuth token caching for API verification will fail.');
}

// --- Flutterwave OAuth 2.0 Token Management (for verification call) ---
const FLUTTERWAVE_TOKEN_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';
const OAUTH_TOKEN_KEY = 'flutterwave_oauth_token';

async function getFlutterwaveAuthToken() {
    if (!kv) throw new Error('Vercel KV is required for OAuth token caching.');

    const cachedToken = await kv.get(OAUTH_TOKEN_KEY);
    // Refresh if token is missing or expires in the next 60 seconds
    if (cachedToken && cachedToken.expires_at > Date.now() + 60000) {
        return cachedToken.access_token;
    }

    const CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Flutterwave Client ID or Secret is not configured for token refresh.');
    }

    const response = await fetch(FLUTTERWAVE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET, 'grant_type': 'client_credentials'
        })
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
        console.error('Flutterwave OAuth Error in Webhook:', data);
        throw new Error('Failed to get Flutterwave auth token for verification.');
    }

    const newToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in * 1000)
    };
    await kv.set(OAUTH_TOKEN_KEY, newToken);
    return newToken.access_token;
}


try {
    // --- START: SECURE FIREBASE ADMIN INITIALIZATION ---
    if (!firebaseAdmin.apps.length) {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.error("FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
            throw new Error("Admin SDK setup failed.");
        }
        
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        admin = firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount)
        });
    } else {
        admin = firebaseAdmin.app();
    }
    db = admin.firestore();
    // --- END: SECURE FIREBASE ADMIN INITIALIZATION ---

} catch (e) {
    console.error("Firebase Admin SDK setup failed:", e.message);
}

// Final function to update the user's status after successful payment
async function updateProStatusInFirestore(userId, appId, transactionId) {
    
    if (!db || !admin) {
        throw new Error("Firebase Admin SDK not fully initialized or credentials are missing.");
    }

    const docRef = db.doc(`artifacts/${appId}/users/${userId}/profile/status`);

    await docRef.set({
        isPro: true,
        proActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        fwTransactionId: transactionId 
    }, { merge: true });
    
    console.log(`Successfully updated Firestore for user ${userId} in app ${appId}.`);
}

// Add timestamp validation
const validateWebhookTimestamp = (timestamp) => {
    const now = Date.now();
    const webhookTime = new Date(timestamp).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return Math.abs(now - webhookTime) < fiveMinutes;
};

// Lightweight alerting: record webhook failures into Firestore to aid monitoring
async function recordWebhookFailure(appId, transactionId, reason) {
    try {
        if (!db) {
            console.warn('Cannot record webhook failure; Firestore not initialized.');
            return;
        }
        const alertRef = db.doc(`artifacts/${appId}/alerts/webhookFailures/${transactionId || `unknown-${Date.now()}`}`);
        await alertRef.set({
            reason: reason?.toString?.() || 'unknown',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error('Failed to record webhook failure:', e);
    }
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    if (!db || !admin || !kv) {
        console.error('A required service (Firebase/KV) is not ready. Returning 500 for webhook retry.');
        return res.status(500).send('Server service connection failed.');
    }
    
    let appId = FALLBACK_APP_ID; 

    try {
        const bodyBuffer = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
        });

        const signature = req.headers['flutterwave-signature'];

        if (!WEBHOOK_SECRET) {
            console.error('FLUTTERWAVE_WEBHOOK_SECRET is not set. Webhook cannot be verified.');
            await recordWebhookFailure(FALLBACK_APP_ID, null, 'webhook-secret-missing');
            return res.status(401).send('Unauthorized: Server configuration error.');
        }

        const hash = crypto.createHmac('sha256', WEBHOOK_SECRET).update(bodyBuffer).digest('base64');
        
        if (hash !== signature) {
            console.error('⚠️ Flutterwave webhook signature mismatch.');
            await recordWebhookFailure(FALLBACK_APP_ID, null, 'signature-mismatch');
            return res.status(401).send('Invalid signature');
        }

        const event = JSON.parse(bodyBuffer.toString('utf8'));
        const { event: eventType, data: transactionData } = event;

        if (!transactionData || !transactionData.id) {
            console.error('Malformed webhook payload: missing transaction data/id.');
            return res.status(400).send('Bad Request');
        }

        if (transactionData.created_at && !validateWebhookTimestamp(transactionData.created_at)) {
            console.error('Webhook timestamp validation failed');
            return res.status(400).send('Invalid webhook timestamp');
        }

        const transactionId = transactionData.id;
        appId = transactionData.meta?.consumer_app || FALLBACK_APP_ID;

        const processedDocRef = db.doc(`artifacts/${appId}/webhooks/processed/${transactionId}`);
        const processedDoc = await processedDocRef.get();
        if (processedDoc.exists) {
            return res.status(200).json({ status: 'Already processed' });
        }

        if (eventType === 'charge.completed' || eventType === 'transfer.completed') {
            
            // --- CRITICAL: Verify transaction with API before giving value ---
            const authToken = await getFlutterwaveAuthToken();
            const verifyResp = await fetch(`https://api.flutterwave.com/v4/transactions/${transactionId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const verifyData = await verifyResp.json();

            if (verifyData.status !== "success" || verifyData.data?.status !== "successful") {
                await recordWebhookFailure(appId, transactionId, 'API verification failed: Transaction not successful');
                return res.status(400).send('Transaction not successful upon API verification');
            }

            const expectedAmount = parseFloat(process.env.FLUTTERWAVE_AMOUNT);
            const expectedCurrency = process.env.FLUTTERWAVE_CURRENCY || 'USD';
            
            if (parseFloat(verifyData.data.amount) !== expectedAmount || verifyData.data.currency !== expectedCurrency) {
                console.warn(`Webhook Security Mismatch: Expected ${expectedCurrency} ${expectedAmount}, got ${verifyData.data.currency} ${verifyData.data.amount} for TX ${transactionId}`);
                await recordWebhookFailure(appId, transactionId, 'API verification failed: Amount/currency mismatch');
                return res.status(400).send('Transaction amount or currency mismatch');
            }
            // --- END: Verification ---

            const userId = transactionData.meta?.consumer_id;
            if (!userId) {
                console.error('Flutterwave event missing userId in meta.', transactionId);
                await recordWebhookFailure(appId, transactionId, 'missing-userid-in-meta');
                return res.status(400).send('Missing userId in metadata');
            }

            await updateProStatusInFirestore(userId, appId, transactionId);

            await processedDocRef.set({
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
                userId,
                transactionId
            }, { merge: true });

        } else {
            console.log(`Unhandled Flutterwave event type ${eventType}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Flutterwave Webhook Processing Error:', error);
        try { await recordWebhookFailure(appId, null, error.message || error); } catch (e) {}
        return res.status(500).send('Failed to process webhook');
    }
}
