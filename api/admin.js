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

    const { action, uid } = req.body; // uid destructuring for getUserDetails
    const appId = process.env.SECURE_APP_ID || 'default-app-id';

    try {
        if (action === 'checkAuth') {
            return res.status(200).json({ ok: true });
        }

        if (action === 'getStats') {
            // NOTE: Accurate counts in Firestore are expensive ($). 
            // We will use a lightweight estimation or just list recent activity for this demo.
            
            // 1. Get recent failure logs
            const alertsSnap = await db.collection(`artifacts/${appId}/alerts/webhookFailures`)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            const logs = alertsSnap.docs.map(d => {
                const data = d.data();
                return { 
                    id: d.id, 
                    reason: data.reason, 
                    time: data.createdAt ? data.createdAt.toDate() : new Date() 
                };
            });

            // 2. Count approximate users (List 1000 max from Auth)
            let listUsersResult = await admin.auth().listUsers(1000);
            const userCount = listUsersResult.users.length; 

            // 3. Count Pro (Requires Firestore query)
            const proSnap = await db.collectionGroup('status').where('isPro', '==', true).limit(100).get();
            const proCount = proSnap.size + (proSnap.size === 100 ? '+' : '');

            // 4. Bio count (Estimation)
            // Just returning a placeholder string for now to avoid massive reads on bio collection group
            const bioCount = "Active"; 
            
            return res.status(200).json({
                userCount: userCount + (listUsersResult.pageToken ? '+' : ''),
                proCount: proCount,
                bioCount: bioCount,
                logs
            });
        }

        if (action === 'getUsers') {
            const listUsersResult = await admin.auth().listUsers(100); // Increased limit slightly
            const users = [];
            
            for (const u of listUsersResult.users) {
                let isPro = false;
                try {
                     const snap = await db.doc(`artifacts/${appId}/users/${u.uid}/profile/status`).get();
                     if(snap.exists && snap.data().isPro) isPro = true;
                } catch(e) {}

                users.push({
                    uid: u.uid,
                    email: u.email,
                    displayName: u.displayName,
                    photoURL: u.photoURL,
                    lastLogin: u.metadata.lastSignInTime,
                    createdAt: u.metadata.creationTime,
                    isPro
                });
            }
            return res.status(200).json({ users });
        }

        if (action === 'getUserDetails') {
            if(!uid) return res.status(400).json({error: "User ID required"});

            const userRecord = await admin.auth().getUser(uid);
            
            // Status Data
            const statusDoc = await db.doc(`artifacts/${appId}/users/${uid}/profile/status`).get();
            const statusData = statusDoc.exists ? statusDoc.data() : null;

            // Profile Data (Username etc)
            const profileDoc = await db.doc(`artifacts/${appId}/users/${uid}/profile/data`).get();
            const profileData = profileDoc.exists ? profileDoc.data() : null;

            // Bio Count (Using Aggregation)
            const biosRef = db.collection(`artifacts/${appId}/users/${uid}/bios`);
            const countSnap = await biosRef.count().get();
            const bioCount = countSnap.data().count;

            return res.status(200).json({
                user: {
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    photoURL: userRecord.photoURL,
                    metadata: userRecord.metadata,
                    providerData: userRecord.providerData
                },
                status: statusData,
                profile: profileData,
                bioCount
            });
        }

        if (action === 'getRecentBios') {
            // Collection Group Query: fetch bios from all users
            const snap = await db.collectionGroup('bios')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            const bios = snap.docs.map(d => {
                const pathSegments = d.ref.path.split('/');
                const userId = pathSegments[3]; // rough extraction
                const data = d.data();
                return {
                    id: d.id,
                    userId,
                    bio: data.bio,
                    platform: data.platform,
                    niche: data.niche,
                    tone: data.tone,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
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
