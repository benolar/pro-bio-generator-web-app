import admin from 'firebase-admin';

// Initialize Firebase Admin if not already
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
            });
        } catch (e) {
            console.error('Failed to init Firebase Admin in Admin API:', e.message);
        }
    }
}

const db = admin.firestore();

// Authorization Helper
async function authorize(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
    }
    const token = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Check Email against Allowed List
    const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (!decoded.email || !allowed.includes(decoded.email.toLowerCase())) {
        throw new Error('Forbidden: Not an admin');
    }
    return decoded;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        await authorize(req);
    } catch (e) {
        return res.status(403).json({ error: e.message });
    }

    const { action } = req.body;
    const appId = process.env.SECURE_APP_ID || 'default-app-id';

    try {
        if (action === 'checkAuth') {
            return res.status(200).json({ ok: true });
        }

        if (action === 'getStats') {
            // NOTE: Accurate counts in Firestore are expensive ($). 
            // We will use a lightweight estimation or just list recent activity for this demo.
            // For production, use Distributed Counters or aggregation queries if budget allows.
            
            // 1. Get recent failure logs
            const alertsSnap = await db.collection(`artifacts/${appId}/alerts/webhookFailures`)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            const logs = alertsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // 2. Count approximate users (List 1000 max from Auth)
            // This is "free" compared to Firestore reads for small apps
            let listUsersResult = await admin.auth().listUsers(1000);
            const userCount = listUsersResult.users.length; // Approximate for display

            // 3. Count Pro (Requires Firestore query, cost = 1 read per doc found)
            // We limit this to just checking recent activity or rely on a stored counter if implemented.
            // For now, we return placeholder or do a small query.
            const proSnap = await db.collectionGroup('status').where('isPro', '==', true).limit(100).get();
            const proCount = proSnap.size + (proSnap.size === 100 ? '+' : '');

            // 4. Bio count (Estimation from Collection Group)
            // We won't count all, just say N/A or implement a counter later.
            // Just return "Many" for now to save costs/latency.
            
            return res.status(200).json({
                userCount: userCount + (listUsersResult.pageToken ? '+' : ''),
                proCount: proCount,
                bioCount: "Active",
                logs
            });
        }

        if (action === 'getUsers') {
            const listUsersResult = await admin.auth().listUsers(50);
            const users = [];
            
            // Enrich with Pro status? (N+1 problem, but manageable for 50 users)
            // Better: Get status docs where ID in list.
            // For simplicity in this demo:
            for (const u of listUsersResult.users) {
                let isPro = false;
                try {
                     const snap = await db.doc(`artifacts/${appId}/users/${u.uid}/profile/status`).get();
                     if(snap.exists && snap.data().isPro) isPro = true;
                } catch(e) {}

                users.push({
                    uid: u.uid,
                    email: u.email,
                    lastLogin: u.metadata.lastSignInTime,
                    isPro
                });
            }
            return res.status(200).json({ users });
        }

        if (action === 'getRecentBios') {
            // Collection Group Query: fetch bios from all users
            const snap = await db.collectionGroup('bios')
                .orderBy('timestamp', 'desc')
                .limit(20)
                .get();
            
            const bios = snap.docs.map(d => {
                // Parent of bio is 'bios' collection, parent of that is 'user' doc
                // Path: artifacts/{appId}/users/{userId}/bios/{bioId}
                const pathSegments = d.ref.path.split('/');
                const userId = pathSegments[3]; // rough extraction
                return {
                    id: d.id,
                    userId,
                    ...d.data(),
                    timestamp: d.data().timestamp?.toDate ? d.data().timestamp.toDate() : new Date()
                };
            });
            
            return res.status(200).json({ bios });
        }

        return res.status(400).json({ error: 'Unknown Action' });

    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
