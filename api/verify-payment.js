// Initialize Firebase Admin (safe single-init)
import admin from 'firebase-admin';

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
export default async function handler(req, res) {
    // We expect the transaction ID from the client-side redirect query parameters
    const { tx_ref: txRef, transaction_id } = req.query; // Check both standard params
    const transactionId = transaction_id || txRef;
    
    if (!transactionId) return res.status(400).json({ error: 'transaction_id or tx_ref required' });

    // Check for necessary ENV keys
    const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!FLUTTERWAVE_SECRET_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Flutterwave Secret Key missing.' });
    }

    try {
        // Verify Transaction with Flutterwave V3 API
        const verifyResp = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
            headers: { Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}` }
        });
        const data = await verifyResp.json();

        // Check basic success status
        if (data.status !== "success" || data.data?.status !== "successful") {
            return res.status(400).json({ error: 'Transaction not successful or failed verification' });
        }

        // Check amount and currency security (critical)
        const expectedAmount = parseFloat(process.env.FLUTTERWAVE_AMOUNT);
        const expectedCurrency = process.env.FLUTTERWAVE_CURRENCY || 'USD';

        if (parseFloat(data.data.amount) !== expectedAmount || data.data.currency !== expectedCurrency) {
            console.warn(`Security mismatch: Expected ${expectedCurrency} ${expectedAmount}, got ${data.data.currency} ${data.data.amount} for TX ${transactionId}`);
            // Return 400 for security reasons: transaction details don't match product
            return res.status(400).json({ error: 'Transaction amount or currency mismatch' }); 
        }

        // Extract required metadata
        const userId = data.data.meta?.consumer_id;
        const appId = data.data.meta?.consumer_app || 'default-app-id';
        
        if (!userId) {
            console.error('Missing user id in transaction meta for TX:', transactionId);
            return res.status(400).json({ error: 'Missing user id in transaction meta' });
        }

        // Update Pro Status in Firestore
        await updateProStatusInFirestore(userId, appId, transactionId);
        
        return res.status(200).json({ status: 'verified', userId: userId });
        
    } catch (error) {
        console.error('verify-payment error', error);
        return res.status(500).json({ error: error.message || 'Internal error' });
    }
}
