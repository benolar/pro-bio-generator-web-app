// Vercel Serverless Function: api/get-banks.js
// Fetches the list of supported banks for USSD payments from Flutterwave.

const { createClient } = require('@vercel/kv');

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

const FLUTTERWAVE_TOKEN_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';
const OAUTH_TOKEN_KEY = 'flutterwave_oauth_token';
const BANKS_CACHE_KEY = 'flutterwave_ngn_banks';
const CACHE_TTL_SECONDS = 3600; // Cache for 1 hour

async function getFlutterwaveAuthToken() {
    if (!kv) throw new Error('Vercel KV is required for OAuth token caching.');
    const cachedToken = await kv.get(OAUTH_TOKEN_KEY);
    if (cachedToken && cachedToken.expires_at > Date.now() + 60000) {
        return cachedToken.access_token;
    }
    const CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID;
    const CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;
    if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('Flutterwave Client ID or Secret is not configured.');
    
    const response = await fetch(FLUTTERWAVE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET, 'grant_type': 'client_credentials'
        })
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) throw new Error('Failed to get Flutterwave auth token.');
    
    const newToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in * 1000)
    };
    await kv.set(OAUTH_TOKEN_KEY, newToken);
    return newToken.access_token;
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    if (!kv) {
        return res.status(503).json({ error: 'Server configuration error: Cache service unavailable.' });
    }

    try {
        // Check cache first
        const cachedBanks = await kv.get(BANKS_CACHE_KEY);
        if (cachedBanks) {
            return res.status(200).json(cachedBanks);
        }

        // Fetch from Flutterwave if not in cache
        const authToken = await getFlutterwaveAuthToken();
        const banksResponse = await fetch(`${FLUTTERWAVE_BASE_URL}/banks?country=NG`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!banksResponse.ok) {
            throw new Error(`Failed to fetch banks from Flutterwave: ${banksResponse.statusText}`);
        }

        const data = await banksResponse.json();
        if (data.status !== 'success' || !Array.isArray(data.data)) {
            throw new Error('Invalid response format from Flutterwave banks API.');
        }

        const banks = data.data;

        // Cache the result
        await kv.set(BANKS_CACHE_KEY, banks, { ex: CACHE_TTL_SECONDS });

        res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL_SECONDS}`);
        return res.status(200).json(banks);

    } catch (error) {
        console.error('Get Banks Error:', error.message);
        return res.status(500).json({ error: 'Failed to retrieve bank list.' });
    }
};
