// Initialize Firebase Admin (safe single-init)
const admin = require('firebase-admin');
const { createClient } = require('@vercel/kv');

// Use environment variable for base URL, defaulting to sandbox for safety
const FLUTTERWAVE_BASE_URL = process.env.FLUTTERWAVE_ENV === 'live'
    ? 'https://f4bexperience.flutterwave.com'
    : 'https://developersandbox-api.flutterwave.com';

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
async function updateProStatusInFirestore(userId, appId, chargeId) {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = db.doc(`artifacts/${appId}/users/${userId}/profile/status`);
    await docRef.set({
        isPro: true,
        proActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        fwTransactionId: chargeId, // Store the canonical Charge ID
        lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp() // Also mark as verified now
    }, { merge: true });
}

// Main handler (uses verifyTransaction flow)
module.exports = async (req, res) => {
    // Client-side redirect sends tx_ref
    const { tx_ref: txRef } = req.query;
    
    if (!txRef) return res.status(400).json({ error: 'tx_ref is required for verification' });

    // Check for necessary ENV keys
    const CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;
    if (!CLIENT_ID || !CLIENT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error: Flutterwave credentials missing.' });
    }

    try {
        // 1. Get OAuth token
        const authToken = await getFlutterwaveAuthToken();

        // 2. NEW: Verify Transaction by querying charges with the reference (txRef)
        const verifyResp = await fetch(`${FLUTTERWAVE_BASE_URL}/charges?reference=${txRef}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await verifyResp.json();

        // Find the charge from the list
        const charge = data?.data?.[0];

        // 3. Check basic success status
        if (data.status !== "success" || !charge || charge.status !== "succeeded") {
            return res.status(400).json({ error: 'Transaction not successful or failed verification' });
        }

        // 4. Check amount and currency security (critical)
        const expectedAmount = parseFloat(process.env.FLUTTERWAVE_AMOUNT);
        const expectedCurrency = process.env.FLUTTERWAVE_CURRENCY || 'USD';

        if (parseFloat(charge.amount) !== expectedAmount || charge.currency !== expectedCurrency) {
            console.warn(`Security mismatch: Expected ${expectedCurrency} ${expectedAmount}, got ${charge.currency} ${charge.amount} for TX_REF ${txRef}`);
            return res.status(400).json({ error: 'Transaction amount or currency mismatch' }); 
        }

        // 5. Extract required metadata
        const userId = charge.meta?.consumer_id;
        const appId = charge.meta?.consumer_app || 'default-app-id';
        const chargeId = charge.id; // The canonical Charge ID
        
        if (!userId || !chargeId) {
            console.error('Missing user_id in meta or charge_id for TX_REF:', txRef);
            return res.status(400).json({ error: 'Missing required transaction metadata' });
        }

        // 6. Update Pro Status in Firestore using the Charge ID
        await updateProStatusInFirestore(userId, appId, chargeId);
        
        return res.status(200).json({ status: 'verified', userId: userId });
        
    } catch (error) {
        console.error('verify-payment error', error);
        return res.status(500).json({ error: error.message || 'Internal error' });
    }
};
