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

    const { action, uid, bioId, userId } = req.body; 
    const appId = process.env.SECURE_APP_ID || 'default-app-id';

    try {
        if (action === 'checkAuth') {
            return res.status(200).json({ ok: true });
        }

        if (action === 'getStats') {
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

            // 2. Count approximate users & Aggregate Growth Data (Last 7 Days)
            let listUsersResult = await admin.auth().listUsers(1000);
            const userCount = listUsersResult.users.length; 
            
            // Calculate growth chart data
            const last7Days = {};
            const today = new Date();
            for(let i=6; i>=0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                last7Days[d.toLocaleDateString()] = 0;
            }

            listUsersResult.users.forEach(u => {
                const date = new Date(u.metadata.creationTime).toLocaleDateString();
                if (last7Days[date] !== undefined) last7Days[date]++;
            });

            const chartData = Object.keys(last7Days).map(date => ({
                date: date.split('/')[0] + '/' + date.split('/')[1], // Simple MM/DD
                count: last7Days[date]
            }));

            // 3. Count Pro (Requires Firestore query)
            const proSnap = await db.collectionGroup('status').where('isPro', '==', true).limit(100).get();
            const proCount = proSnap.size + (proSnap.size === 100 ? '+' : '');

            // 4. Bio count (Estimation)
            const bioCount = "Active"; 
            
            return res.status(200).json({
                userCount: userCount + (listUsersResult.pageToken ? '+' : ''),
                proCount: proCount,
                bioCount: bioCount,
                logs,
                chartData
            });
        }

        if (action === 'getUsers') {
            const listUsersResult = await admin.auth().listUsers(100); 
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
                    disabled: u.disabled,
                    isPro
                });
            }
            return res.status(200).json({ users });
        }

        if (action === 'getUserDetails') {
            if(!uid) return res.status(400).json({error: "User ID required"});

            const userRecord = await admin.auth().getUser(uid);
            
            const statusDoc = await db.doc(`artifacts/${appId}/users/${uid}/profile/status`).get();
            const statusData = statusDoc.exists ? statusDoc.data() : null;

            const profileDoc = await db.doc(`artifacts/${appId}/users/${uid}/profile/data`).get();
            const profileData = profileDoc.exists ? profileDoc.data() : null;

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
                    disabled: userRecord.disabled,
                    providerData: userRecord.providerData
                },
                status: statusData,
                profile: profileData,
                bioCount
            });
        }

        if (action === 'getRecentBios') {
            const snap = await db.collectionGroup('bios')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            const bios = snap.docs.map(d => {
                const pathSegments = d.ref.path.split('/');
                const uId = pathSegments[3]; 
                const data = d.data();
                return {
                    id: d.id,
                    userId: uId,
                    bio: data.bio,
                    platform: data.platform,
                    niche: data.niche,
                    tone: data.tone,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
                };
            });
            
            return res.status(200).json({ bios });
        }

        // --- NEW MANAGEMENT ACTIONS ---

        if (action === 'togglePro') {
            if(!uid) return res.status(400).json({error: "UID required"});
            const statusRef = db.doc(`artifacts/${appId}/users/${uid}/profile/status`);
            const doc = await statusRef.get();
            const currentPro = doc.exists ? doc.data().isPro : false;
            
            await statusRef.set({ 
                isPro: !currentPro,
                adminModifiedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            return res.status(200).json({ success: true, newStatus: !currentPro });
        }

        if (action === 'toggleDisableUser') {
            if(!uid) return res.status(400).json({error: "UID required"});
            const user = await admin.auth().getUser(uid);
            await admin.auth().updateUser(uid, { disabled: !user.disabled });
            return res.status(200).json({ success: true, newStatus: !user.disabled });
        }

        if (action === 'deleteBio') {
            if(!bioId || !userId) return res.status(400).json({error: "BioID and UserID required"});
            await db.doc(`artifacts/${appId}/users/${userId}/bios/${bioId}`).delete();
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: 'Unknown Action' });

    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
