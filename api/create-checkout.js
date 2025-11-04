// Vercel Serverless Function: api/create-checkout.js
// This function creates a Flutterwave Payment link using OAuth 2.0.

const { createClient } = require('@vercel/kv');

const FLUTTERWAVE_API_URL = 'https://f4bexperience.flutterwave.com/v4/hosted-links';

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

    // Cache the new token
    await kv.set(OAUTH_TOKEN_KEY, newToken);
    return newToken.access_token;
}

// Validate TRUSTED_APP_ID format and presence early
const TRUSTED_APP_ID = process.env.SECURE_APP_ID;
if (!TRUSTED_APP_ID) {
    console.warn('SECURE_APP_ID environment variable is not set — will use default-app-id for Firestore paths');
} else if (!/^[a-zA-Z0-9-_]{3,64}$/.test(TRUSTED_APP_ID)) {
    console.error('Invalid SECURE_APP_ID format. Must be 3-64 characters of [a-zA-Z0-9-_]');
}

module.exports = async (req, res) => {
    // Add request timeout
    const TIMEOUT = 30000;
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT)
    );

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Required ENV variables
    const CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;
    const AMOUNT = process.env.FLUTTERWAVE_AMOUNT || '2.99'; // Defaulting for safety
    const CURRENCY = process.env.FLUTTERWAVE_CURRENCY || 'USD'; 

    const { userId, originUrl } = req.body;
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
        return res.status(500).json({ error: 'Server configuration error: Flutterwave credentials missing.' });
    }
    
    if (!userId || !originUrl) {
        return res.status(400).json({ error: 'User ID and client origin URL are required.' });
    }

    // Server uses TRUSTED_APP_ID only; client no longer sends appId.
    const effectiveAppId = TRUSTED_APP_ID || 'default-app-id';

    // Add stronger input validation with domain whitelist + wildcard support
    const validateInput = (userId, originUrl) => {
        if (!userId?.match(/^[A-Za-z0-9_-]{4,128}$/)) {
            throw new Error('Invalid user ID format');
        }

        let url;
        try {
            url = new URL(originUrl);
        } catch {
            throw new Error('Invalid origin URL');
        }

        const allowedRaw = process.env.ALLOWED_DOMAINS || '';
        const allowedDomains = allowedRaw.split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);

        if (allowedDomains.length === 0) {
            console.warn('ALLOWED_DOMAINS not set — skipping origin domain whitelist check.');
        } else {
            const hostname = url.hostname.toLowerCase();
            const matches = allowedDomains.some(entry => {
                if (entry === hostname) return true;
                if (entry === '*') return true;
                if (entry.startsWith('*.')) {
                    const base = entry.slice(2);
                    return hostname === base || hostname.endsWith(`.${base}`);
                }
                if (entry.includes(':')) {
                    return hostname === entry.split(':')[0];
                }
                return false;
            });

            if (!matches) {
                throw new Error(`Origin domain not allowed: ${url.hostname}`);
            }
        }

        const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
        if (!isLocal && url.protocol !== 'https:') {
            throw new Error('Origin must use https for security.');
        }

        const amount = parseFloat(process.env.FLUTTERWAVE_AMOUNT);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid transaction amount configuration');
        }
    };

    try {
        validateInput(userId, originUrl);

        const tx_ref = `BIO-PRO-${Date.now()}-${userId.substring(0, 8)}`;
        
        if (!TRUSTED_APP_ID) {
            console.warn(`Using fallback app ID (default-app-id) for user ${userId} transaction ${tx_ref}`);
        }
        
        const payload = {
            tx_ref: tx_ref,
            amount: AMOUNT,
            currency: CURRENCY,
            redirect_url: `${originUrl}?payment=success&tx_ref=${tx_ref}`,
            customer: {
                email: "anonuser@biogen.com",
                phonenumber: "0000000000",
                name: userId, 
            },
            meta: {
                consumer_id: userId,
                consumer_app: effectiveAppId,
                tx_ref: tx_ref
            },
            customizations: {
                title: "Pro Bio Generator Unlock",
                description: "One-time lifetime Pro access.",
            }
        };

        // 1. Get OAuth token (will be cached)
        const authToken = await getFlutterwaveAuthToken();

        // 2. Call the Flutterwave API to create the payment link
        const fwResponsePromise = fetch(FLUTTERWAVE_API_URL, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': payload.tx_ref,
                'X-Trace-Id': `trace-${Date.now()}-${userId.substring(0, 8)}`
            },
            body: JSON.stringify(payload)
        });

        const fwResponse = await Promise.race([fwResponsePromise, timeoutPromise]);
        
        const data = await fwResponse.json();

        if (data.status !== 'success' || !data.data.link) {
            console.error('Flutterwave API Error:', data);
            throw new Error(data.message || 'Failed to create Flutterwave payment link.');
        }

        // 3. Send the Flutterwave link back to the frontend
        res.status(200).json({ url: data.data.link });

    } catch (error) {
        const errorMessage = error.message || 'Failed to create payment session';
        console.error('Checkout Error:', errorMessage);
        res.status(error.status || 500).json({ error: errorMessage });
    }
}
