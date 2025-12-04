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
    
    let decoded;
    try {
        decoded = await admin.auth().verifyIdToken(token);
    } catch (error) {
        throw new Error('Invalid token');
    }
    
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
        const status = e.message.includes('Forbidden') ? 403 : 401;
        return res.status(status).json({ error: e.message });
    }

    const { action, uid, bioId, userId } = req.body; 
    const appId = process.env.SECURE_APP_ID || 'default-app-id';

    try {
        switch (action) {
            case 'checkAuth':
                return res.status(200).json({ ok: true });

            case 'getStats': {
                // Parallelize stats gathering for performance
                // FIXED: Simplified path to 'artifacts/{appId}/webhookFailures' to ensure odd number of segments for collection
                const [alertsSnap, listUsersResult, proCountSnap, bioCountSnap] = await Promise.all([
                    db.collection(`artifacts/${appId}/webhookFailures`)
                        .orderBy('createdAt', 'desc')
                        .limit(10)
                        .get(),
                    admin.auth().listUsers(1000), // List up to 1000 users for stats
                    db.collectionGroup('status').where('isPro', '==', true).count().get(),
                    db.collectionGroup('bios').count().get()
                ]);
                
                const logs = alertsSnap.docs.map(d => {
                    const data = d.data();
                    return { 
                        id: d.id, 
                        reason: data.reason, 
                        time: data.createdAt ? data.createdAt.toDate() : new Date() 
                    };
                });

                const userCount = listUsersResult.users.length; 
                const proCount = proCountSnap.data().count;
                const bioCount = bioCountSnap.data().count;
                
                // Calculate Growth Chart Data (Last 7 Days)
                const last7Days = {};
                const today = new Date();
                for(let i=6; i>=0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().split('T')[0];
                    last7Days[key] = 0;
                }

                listUsersResult.users.forEach(u => {
                    if (u.metadata.creationTime) {
                        const date = new Date(u.metadata.creationTime).toISOString().split('T')[0];
                        if (last7Days[date] !== undefined) last7Days[date]++;
                    }
                });

                const chartData = Object.keys(last7Days).map(dateStr => {
                     const parts = dateStr.split('-');
                     return {
                        date: `${parts[1]}/${parts[2]}`, // MM/DD
                        count: last7Days[dateStr]
                     };
                });

                return res.status(200).json({
                    userCount: userCount + (listUsersResult.pageToken ? '+' : ''),
                    proCount: proCount,
                    bioCount: bioCount,
                    logs,
                    chartData
                });
            }

            case 'getUsers': {
                const listUsersResult = await admin.auth().listUsers(100); 
                
                // Parallel Execution: Fetch status for all users concurrently to avoid N+1 latency
                const users = await Promise.all(listUsersResult.users.map(async (u) => {
                    let isPro = false;
                    try {
                         const snap = await db.doc(`artifacts/${appId}/users/${u.uid}/profile/status`).get();
                         if(snap.exists && snap.data().isPro) isPro = true;
                    } catch(e) {
                        // Log error but allow list to proceed
                        console.error(`Status fetch failed for ${u.uid}:`, e.message);
                    }

                    return {
                        uid: u.uid,
                        email: u.email,
                        displayName: u.displayName,
                        photoURL: u.photoURL,
                        lastLogin: u.metadata.lastSignInTime,
                        createdAt: u.metadata.creationTime,
                        disabled: u.disabled,
                        isPro
                    };
                }));
                
                return res.status(200).json({ users });
            }

            case 'getUserDetails': {
                if(!uid) return res.status(400).json({error: "User ID required"});

                const userRecord = await admin.auth().getUser(uid);
                
                // Parallel Fetch: Details, Status, Profile Data, and Bio Count
                const [statusDoc, profileDoc, countSnap] = await Promise.all([
                    db.doc(`artifacts/${appId}/users/${uid}/profile/status`).get(),
                    db.doc(`artifacts/${appId}/users/${uid}/profile/data`).get(),
                    db.collection(`artifacts/${appId}/users/${uid}/bios`).count().get()
                ]);

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
                    status: statusDoc.exists ? statusDoc.data() : null,
                    profile: profileDoc.exists ? profileDoc.data() : null,
                    bioCount: countSnap.data().count
                });
            }

            case 'getRecentBios': {
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

            case 'togglePro': {
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

            case 'toggleDisableUser': {
                if(!uid) return res.status(400).json({error: "UID required"});
                const user = await admin.auth().getUser(uid);
                await admin.auth().updateUser(uid, { disabled: !user.disabled });
                return res.status(200).json({ success: true, newStatus: !user.disabled });
            }

            case 'deleteBio': {
                if(!bioId || !userId) return res.status(400).json({error: "BioID and UserID required"});
                await db.doc(`artifacts/${appId}/users/${userId}/bios/${bioId}`).delete();
                return res.status(200).json({ success: true });
            }

            default:
                return res.status(400).json({ error: `Unknown Action: ${action}` });
        }

    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
