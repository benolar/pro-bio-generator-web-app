// Vercel Serverless Function: api/initiate-payment.js
// Implements the Flutterwave v4 "General Flow" to create a charge.

const admin = require('firebase-admin');
const { createClient } = require('@vercel/kv');

// --- Service Initialization ---
const FLUTTERWAVE_BASE_URL = process.env.FLUTTERWAVE_ENV === 'live'
    ? 'https://f4bexperience.flutterwave.com'
    : 'https://developersandbox-api.flutterwave.com';

let kv;
if (process.env.BGNRT_KV_REST_API_URL && process.env.BGNRT_KV_REST_API_TOKEN) {
    kv = createClient({
        url: process.env.BGNRT_KV_REST_API_URL,
        token: process.env.BGNRT_KV_REST_API_TOKEN,
    });
} else {
    kv = null;
}

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
        });
    } catch (e) {
        console.error("Firebase Admin SDK init failed:", e.message);
    }
}

// --- Flutterwave OAuth Token Management ---
const FLUTTERWAVE_TOKEN_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';
const OAUTH_TOKEN_KEY = 'flutterwave_oauth_token';

async function getFlutterwaveAuthToken() {
    if (!kv) throw new Error('Vercel KV is required for OAuth token caching.');
    const cachedToken = await kv.get(OAUTH_TOKEN_KEY);
    if (cachedToken && cachedToken.expires_at > Date.now() + 60000) {
        return cachedToken.access_token;
    }
    const CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;
    if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('Flutterwave credentials not configured.');
    
    const response = await fetch(FLUTTERWAVE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET, 'grant_type': 'client_credentials'})
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) throw new Error('Failed to get Flutterwave auth token.');
    
    const newToken = { access_token: data.access_token, expires_at: Date.now() + (data.expires_in * 1000) };
    await kv.set(OAUTH_TOKEN_KEY, newToken);
    return newToken.access_token;
}

// --- Session Verification ---
async function validateSession(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('No session token.');
    const sessionToken = authHeader.split(' ')[1];
    return await admin.auth().verifyIdToken(sessionToken);
}

// --- Main Handler ---
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    if (!kv || !admin.apps.length) {
        return res.status(503).json({ error: 'Server configuration error: Required services unavailable.' });
    }

    try {
        const decodedToken = await validateSession(req);
        const { userId, paymentDetails } = req.body;

        if (decodedToken.uid !== userId) {
            return res.status(403).json({ error: 'Forbidden: Token does not match user ID.' });
        }
        if (!paymentDetails || !paymentDetails.type) {
            return res.status(400).json({ error: 'Payment details are required.' });
        }

        const authToken = await getFlutterwaveAuthToken();
        const effectiveAppId = process.env.SECURE_APP_ID || 'default-app-id';
        const reference = `BIO-PRO-${Date.now()}-${userId.substring(0, 8)}`;

        // --- Step 1: Create Customer ---
        const customerResponse = await fetch(`${FLUTTERWAVE_BASE_URL}/customers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `cust-${userId}-${Date.now()}`
            },
            body: JSON.stringify({
                email: decodedToken.email || `${userId}@biogen.app`,
                name: { first: userId.substring(0, 10), last: "User" },
            })
        });
        const customerData = await customerResponse.json();
        if (customerData.status !== 'success') throw new Error(`Customer creation failed: ${customerData.message}`);
        const customerId = customerData.data.id;

        // --- Step 2: Create Payment Method ---
        const paymentMethodPayload = {
            type: paymentDetails.type,
            ...(paymentDetails.type === 'card' && { card: paymentDetails.card }),
            ...(paymentDetails.type === 'ussd' && { ussd: paymentDetails.ussd }),
        };
        const pmResponse = await fetch(`${FLUTTERWAVE_BASE_URL}/payment-methods`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pm-${reference}`
            },
            body: JSON.stringify(paymentMethodPayload)
        });
        const pmData = await pmResponse.json();
        if (pmData.status !== 'success') throw new Error(`Payment method creation failed: ${pmData.message}`);
        const paymentMethodId = pmData.data.id;

        // --- Step 3: Create Charge ---
        const chargePayload = {
            reference: reference,
            amount: process.env.FLUTTERWAVE_AMOUNT || '2.99',
            currency: process.env.FLUTTERWAVE_CURRENCY || 'USD',
            customer_id: customerId,
            payment_method_id: paymentMethodId,
            redirect_url: `${req.headers.origin}?payment=success&tx_ref=${reference}`,
            meta: {
                consumer_id: userId,
                consumer_app: effectiveAppId,
            }
        };

        const chargeResponse = await fetch(`${FLUTTERWAVE_BASE_URL}/charges`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': reference,
                // Scenario key for testing USSD flow on sandbox
                ...(paymentDetails.type === 'ussd' && process.env.FLUTTERWAVE_ENV !== 'live' && {'X-Scenario-Key': 'scenario:auth_ussd&issuer:approved'}),
            },
            body: JSON.stringify(chargePayload)
        });
        const chargeData = await chargeResponse.json();
        if (chargeData.status !== 'success') throw new Error(`Charge creation failed: ${chargeData.message}`);

        // --- Step 4: Return Next Action ---
        res.status(200).json({ next_action: chargeData.data.next_action });

    } catch (error) {
        console.error("Initiate Payment Error:", error);
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
};
