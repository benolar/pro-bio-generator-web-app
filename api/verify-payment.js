// Initialize Firebase Admin (safe single-init)
const admin = require('firebase-admin');
const { createClient } = require('@vercel/kv');

// --- Vercel KV Initialization ---
let kv;
if (process.env.BGNRT_KV_REST_API_URL && process.env.BGNRT_KV_REST_API_TOKEN) {
    kv = createClient({
        url: process.env.BGNRT_KV_REST_API_URL,
        token: process.env.BGNRT_KV_REST_API_TOKEN,
    });
} else {
    kv = null;
    console.error('Vercel KV is not configured. OAuth token caching is required and will fail.');
}

// --- Flutterwave OAuth 2.0 Token Management ---
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
        throw new Error('Flutterwave Client ID or Secret is not configured.');
    }

    const response = await fetch(FLUTTERWAVE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'grant_type': 'client_credentials'
        })
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
        console.error('Flutterwave OAuth Error:', data);
        throw new Error('Failed to get Flutterwave auth token.');
    }

    const newToken = {
        access_token: data.access_token,
        // expires_in is in seconds, convert to ms timestamp for comparison
        expires_at: Date.now() + (data.expires_in * 1000)
    };

    await kv.set(OAUTH_TOKEN_KEY, newToken);
    return newToken.access_token;
}

if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
            });
        } catch (e) {
            console.error('Failed to initialize Firebase Admin:', e.message);
        }
    } else {
        console.error('FIREBASE_SERVICE_ACCOUNT not set; Firestore operations will fail.');
    }
}
const db = admin.firestore();

// Local helper to update Firestore status
async function updateProStatusInFirestore(userId, appId, transactionId) {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = db.doc(`artifacts/${appId}/users/${userId}/profile/status`);
    await docRef.set({
        isPro: true,
        proActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        fwTransactionId: transactionId,
        lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp() // Also mark as verified now
    }, { merge: true });
}

// Main handler (uses verifyTransaction flow)
module.exports = async (req, res) => {
    // We expect the transaction ID from the client-side redirect query parameters
    const { tx_ref: txRef, transaction_id } = req.query; // Check both standard params
    const transactionId = transaction_id || txRef;
    
    if (!transactionId) return res.status(400).json({ error: 'transaction_id or tx_ref required' });

    // Check for necessary ENV keys
    const CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;
    if (!CLIENT_ID || !CLIENT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error: Flutterwave credentials missing.' });
    }

    try {
        // 1. Get OAuth token
        const authToken = await getFlutterwaveAuthToken();

        // 2. Verify Transaction with Flutterwave
        const verifyResp = await fetch(`https://api.flutterwave.com/v4/transactions/${transactionId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await verifyResp.json();

        // 3. Check basic success status
        if (data.status !== "success" || data.data?.status !== "successful") {
            return res.status(400).json({ error: 'Transaction not successful or failed verification' });
        }

        // 4. Check amount and currency security (critical)
        const expectedAmount = parseFloat(process.env.FLUTTERWAVE_AMOUNT);
        const expectedCurrency = process.env.FLUTTERWAVE_CURRENCY || 'USD';

        if (parseFloat(data.data.amount) !== expectedAmount || data.data.currency !== expectedCurrency) {
            console.warn(`Security mismatch: Expected ${expectedCurrency} ${expectedAmount}, got ${data.data.currency} ${data.data.amount} for TX ${transactionId}`);
            // Return 400 for security reasons: transaction details don't match product
            return res.status(400).json({ error: 'Transaction amount or currency mismatch' }); 
        }

        // 5. Extract required metadata
        const userId = data.data.meta?.consumer_id;
        const appId = data.data.meta?.consumer_app || 'default-app-id';
        
        if (!userId) {
            console.error('Missing user id in transaction meta for TX:', transactionId);
            return res.status(400).json({ error: 'Missing user id in transaction meta' });
        }

        // 6. Update Pro Status in Firestore
        await updateProStatusInFirestore(userId, appId, transactionId);
        
        return res.status(200).json({ status: 'verified', userId: userId });
        
    } catch (error) {
        console.error('verify-payment error', error);
        return res.status(500).json({ error: error.message || 'Internal error' });
    }
};
