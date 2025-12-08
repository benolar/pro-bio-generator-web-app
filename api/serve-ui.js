import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';

// Initialize Firebase Admin SDK for fetching global config
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
            });
        } catch (e) {
            console.error('Failed to init Firebase Admin in serve-ui:', e.message);
        }
    }
}

const db = admin.apps.length ? admin.firestore() : null;

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
    const page = req.query.page || 'index';
    
    // Security: Allow only specific files to be served
    const allowedFiles = {
        'index': 'index.html',
        'admin': 'admin.html'
    };

    const filename = allowedFiles[page];
    
    if (!filename) {
        return res.status(404).send('Not Found');
    }

    // Resolve path relative to THIS file (api/serve-ui.js) -> parent directory -> filename
    // This ensures Vercel's NFT (Node File Trace) detects and bundles the HTML files.
    const filePath = path.resolve(__dirname, '..', filename);

    try {
        let html = fs.readFileSync(filePath, 'utf8');
        
        // 1. Generate a random nonce
        const nonce = crypto.randomBytes(16).toString('base64');

        // Prepare injected script (without nonce attribute yet, strictly content)
        // We inject APP_NONCE so client-side scripts (like ad injectors) can use it.
        let injectedScript = `<script>window.APP_NONCE = "${nonce}";</script>`;
        
        // --- DYNAMIC CONFIG INJECTION ---
        // Fetch custom settings only for the main app index
        if (page === 'index' && db) {
            const appId = process.env.SECURE_APP_ID || 'default-app-id';
            try {
                // Parallel fetch for global config and ad config
                const [globalSnap, adSnap] = await Promise.all([
                    db.doc(`artifacts/${appId}/config/global`).get(),
                    db.doc(`artifacts/${appId}/config/ads`).get()
                ]);

                if (globalSnap.exists) {
                    const config = globalSnap.data();
                    
                    if (config.title) {
                        html = html.replace(/<title>.*<\/title>/, `<title>${config.title}</title>`);
                    }
                    if (config.metaDescription) {
                        // Replace existing description meta tag
                        html = html.replace(
                            /<meta\s+name="description"\s+content="[^"]*">/,
                            `<meta name="description" content="${config.metaDescription.replace(/"/g, '&quot;')}"`
                        );
                    }
                    if (config.faviconUrl) {
                        // Replace existing favicon link (remove old ones first to be safe or regex replace)
                        html = html.replace(/<link\s+rel="icon"[^>]*>/g, '');
                        // Inject new one before </head>
                        html = html.replace('</head>', `<link rel="icon" href="${config.faviconUrl}"></head>`);
                    }
                }

                if (adSnap.exists) {
                    const ads = adSnap.data();
                    // Inject ad config securely as a JS object
                    injectedScript += `<script>window.AD_CONFIG = ${JSON.stringify(ads)};</script>`;
                }

            } catch (e) {
                console.error("Failed to load global config:", e.message);
                // Fallback to default file content
            }
        }

        // Inject the config scripts BEFORE nonce replacement so they get the nonce attribute added by the regex
        html = html.replace('</head>', `${injectedScript}</head>`);

        // 2. Inject nonce into ALL script tags (including the ones we just added)
        const updatedHtml = html.replace(/<script/g, `<script nonce="${nonce}"`);

        // 3. Set Content-Security-Policy Header
        // We include 'unsafe-inline' for style-src to allow the styles in head.
        // script-src uses 'nonce-...' which effectively disables 'unsafe-inline' for scripts in modern browsers,
        // so we must ensure all inline scripts (including ads) use the nonce.
        res.setHeader(
            'Content-Security-Policy', 
            `default-src 'self' https:; script-src 'self' 'nonce-${nonce}' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' https: data:; connect-src 'self' https:;`
        );
        
        // Set explicit Cache-Control to avoid default 'must-revalidate' warning
        res.setHeader('Cache-Control', 'public, max-age=0');

        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        res.setHeader('Content-Type', 'text/html');
        res.send(updatedHtml);

    } catch (error) {
        console.error('Error serving UI:', error);
        res.status(500).send('Internal Server Error: Unable to load application UI.');
    }
}
