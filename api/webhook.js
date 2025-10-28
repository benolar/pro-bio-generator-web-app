// Vercel Serverless Function: api/webhook.js
// This function handles incoming webhooks from Flutterwave for successful payments.

const firebaseAdmin = require('firebase-admin');
const crypto = require('crypto');

// IMPORTANT: Vercel serverless functions need this to read the raw body for signature verification.
export const config = {
    api: {
        bodyParser: false,
    },
};

let admin; // Initialized Firebase Admin SDK 
let db;    // Firestore instance
const FW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;

// Default appId for logging/fallback if webhook fails before body parse
const FALLBACK_APP_ID = 'default-app-id';

try {
    // --- START: SECURE FIREBASE ADMIN INITIALIZATION ---
    if (!firebaseAdmin.apps.length) {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.error("FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
            throw new Error("Admin SDK setup failed.");
        }
        
        // CRITICAL: Parse the JSON string from the environment variable
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
        // Store the Flutterwave transaction ID for audit purposes
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

    // Ensure Admin SDK ready
    if (!db || !admin) {
        console.error('Firebase Admin SDK is not ready. Returning 500 for webhook retry.');
        return res.status(500).send('Database connection failed.');
    }
    
    // Default appId for early failure logging (will be updated after body parse)
    let appId = FALLBACK_APP_ID; 

    try {
        // Read raw body first (required for signature verification)
        const bodyBuffer = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
        });

        // 1) Verify static webhook hash header (if configured)
        const headerHash = req.headers['verif-hash'];
        if (WEBHOOK_HASH && headerHash !== WEBHOOK_HASH) {
            console.error('⚠️ Flutterwave webhook header hash mismatch or missing.');
            await recordWebhookFailure(FALLBACK_APP_ID, null, 'header-hash-mismatch');
            return res.status(401).send('Unauthorized');
        }

        // 2) Verify HMAC signature over raw body (optional stronger check)
        const signatureHeader = req.headers['x-flutterwave-signature'];
        if (FW_SECRET_KEY && signatureHeader) {
            const expected = crypto.createHmac('sha256', FW_SECRET_KEY).update(bodyBuffer).digest('hex');
            if (expected !== signatureHeader) {
                console.error('⚠️ Flutterwave webhook HMAC signature mismatch.');
                await recordWebhookFailure(FALLBACK_APP_ID, null, 'hmac-mismatch');
                return res.status(401).send('Invalid signature');
            }
        }

        // Parse the body AFTER reading raw buffer
        const event = JSON.parse(bodyBuffer.toString('utf8'));
        const { event: eventType, data: transactionData } = event;

        // basic structure checks
        if (!transactionData || !transactionData.id) {
            console.error('Malformed webhook payload: missing transaction data/id.');
            return res.status(400).send('Bad Request');
        }

        // Timestamp validation if present
        if (transactionData.created_at && !validateWebhookTimestamp(transactionData.created_at)) {
            console.error('Webhook timestamp validation failed');
            return res.status(400).send('Invalid webhook timestamp');
        }

        const transactionId = transactionData.id;
        // Update appId with the actual value from meta for accurate logging and Firestore pathing
        appId = transactionData.meta?.consumer_app || FALLBACK_APP_ID;

        // Idempotency: use Firestore document per transaction (safer for serverless)
        const processedDocRef = db.doc(`artifacts/${appId}/webhooks/processed/${transactionId}`);
        const processedDoc = await processedDocRef.get();
        if (processedDoc.exists) {
            // already handled
            return res.status(200).json({ status: 'Already processed' });
        }

        // Only mark processed if everything below succeeds
        if (eventType === 'charge.completed' || eventType === 'transfer.completed') {
            if (transactionData.status !== 'successful') {
                console.log(`Transaction ${transactionId} status not successful.`);
                return res.status(200).json({ received: true });
            }

            const userId = transactionData.meta?.consumer_id;
            if (!userId) {
                console.error('Flutterwave event missing userId in meta.', transactionId);
                return res.status(400).send('Missing userId in metadata');
            }

            // Update user's Pro status
            await updateProStatusInFirestore(userId, appId, transactionId);

            // Mark webhook as processed
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
        // record failure for ops to inspect, using the last known appId
        try { await recordWebhookFailure(appId, null, error.message || error); } catch (e) {}
        return res.status(500).send('Failed to process webhook');
    }
}
