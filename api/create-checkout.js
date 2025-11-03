// Vercel Serverless Function: api/create-checkout.js
// This function creates a Flutterwave Payment link.

const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3/payment-links';

// Validate TRUSTED_APP_ID format and presence early
const TRUSTED_APP_ID = process.env.SECURE_APP_ID;
if (!TRUSTED_APP_ID) {
    console.warn('SECURE_APP_ID environment variable is not set — will use default-app-id for Firestore paths');
} else if (!/^[a-zA-Z0-9-_]{3,64}$/.test(TRUSTED_APP_ID)) {
    console.error('Invalid SECURE_APP_ID format. Must be 3-64 characters of [a-zA-Z0-9-_]');
    // Note: Do not throw here if initialization is possible without it, but warn strongly.
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
    const SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
    const AMOUNT = process.env.FLUTTERWAVE_AMOUNT || '2.99'; // Defaulting for safety
    const CURRENCY = process.env.FLUTTERWAVE_CURRENCY || 'USD'; 

    const { userId, originUrl } = req.body;
    
    if (!SECRET_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Flutterwave Key missing.' });
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

        // Parse allowed domains from env (comma-separated). Example: "example.com,*.example.org,localhost"
        const allowedRaw = process.env.ALLOWED_DOMAINS || '';
        const allowedDomains = allowedRaw.split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);

        if (allowedDomains.length === 0) {
            // no whitelist configured: log and skip enforcement (keeps backward compatibility)
            console.warn('ALLOWED_DOMAINS not set — skipping origin domain whitelist check.');
        } else {
            const hostname = url.hostname.toLowerCase();

            const matches = allowedDomains.some(entry => {
                if (entry === hostname) return true;            // exact match
                if (entry === '*') return true;                 // allow any (explicit wildcard)
                if (entry.startsWith('*.')) {
                    // wildcard like *.example.com matches sub.example.com but not example.com
                    const base = entry.slice(2);
                    return hostname === base || hostname.endsWith(`.${base}`);
                }
                // allow entries that include port specification if provided (rare)
                if (entry.includes(':')) {
                    return hostname === entry.split(':')[0];
                }
                return false;
            });

            if (!matches) {
                throw new Error(`Origin domain not allowed: ${url.hostname}`);
            }
        }

        // Enforce HTTPS for non-local hosts (allow http for localhost/127.0.0.1)
        const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
        if (!isLocal && url.protocol !== 'https:') {
            throw new Error('Origin must use https for security.');
        }

        // Add transaction amount validation
        const amount = parseFloat(process.env.FLUTTERWAVE_AMOUNT);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid transaction amount configuration');
        }
    };

    try {
        validateInput(userId, originUrl);

        // Generate a unique transaction reference
        const tx_ref = `BIO-PRO-${Date.now()}-${userId.substring(0, 8)}`;
        
        if (!TRUSTED_APP_ID) {
            console.warn(`Using fallback app ID (default-app-id) for user ${userId} transaction ${tx_ref}`);
        }
        
        // 1. Prepare Flutterwave payload
        const payload = {
            tx_ref: tx_ref,
            amount: AMOUNT,
            currency: CURRENCY,
            redirect_url: `${originUrl}?payment=success&tx_ref=${tx_ref}`, // Added tx_ref for later verification
            customer: {
                email: "anonuser@biogen.com", // Flutterwave requires a placeholder email
                phonenumber: "0000000000",
                name: userId, 
            },
            // The 'meta' field is where we securely store the userId
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

        // 2. Call the Flutterwave API to create the payment link
        const fwResponsePromise = fetch(FLUTTERWAVE_API_URL, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json' 
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
