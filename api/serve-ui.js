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

    // --- VERCEL FILE TRACING FIX ---
    // These static references force Vercel's NFT (Node File Trace) to include 
    // these specific files in the serverless function bundle.
    // We don't use these variables, but the static analysis sees them.
    const _trace_index = path.join(process.cwd(), 'index.html');
    const _trace_admin = path.join(process.cwd(), 'admin.html');
    const _trace_public_index = path.join(process.cwd(), 'public', 'index.html');
    const _trace_public_admin = path.join(process.cwd(), 'public', 'admin.html');

    // Robust path finding: Check root, public folder, and relative path
    let filePath;
    const candidates = [
        path.join(process.cwd(), filename),           // Root (Standard Vercel)
        path.join(process.cwd(), 'public', filename), // Public (Build Output)
        path.resolve(__dirname, '..', filename)       // Relative Fallback
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            filePath = p;
            break;
        }
    }

    if (!filePath) {
        console.error(`[serve-ui] Error: Could not find ${filename}. Checked locations:`, candidates);
        return res.status(500).send('Internal Server Error: UI template not found in deployment bundle.');
    }

    try {
        let html = fs.readFileSync(filePath, 'utf8');
        
        // 1. Generate a random nonce
        const nonce = crypto.randomBytes(16).toString('base64');

        // Prepare injected script
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
                        html = html.replace(
                            /<meta\s+name="description"\s+content="[^"]*">/,
                            `<meta name="description" content="${config.metaDescription.replace(/"/g, '&quot;')}"`
                        );
                    }
                    if (config.faviconUrl) {
                        html = html.replace(/<link\s+rel="icon"[^>]*>/g, '');
                        html = html.replace('</head>', `<link rel="icon" href="${config.faviconUrl}"></head>`);
                    }
                }

                if (adSnap.exists) {
                    const ads = adSnap.data();
                    injectedScript += `<script>window.AD_CONFIG = ${JSON.stringify(ads)};</script>`;
                }

            } catch (e) {
                console.error("Failed to load global config:", e.message);
            }
        }

        // Inject the config scripts BEFORE nonce replacement
        html = html.replace('</head>', `${injectedScript}</head>`);

        // 2. Inject nonce into ALL script tags
        const updatedHtml = html.replace(/<script/g, `<script nonce="${nonce}"`);

        // 3. Set Content-Security-Policy Header
        res.setHeader(
            'Content-Security-Policy', 
            `default-src 'self' https:; script-src 'self' 'nonce-${nonce}' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' https: data:; connect-src 'self' https:;`
        );
        
        res.setHeader('Cache-Control', 'public, max-age=0');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Type', 'text/html');
        
        res.send(updatedHtml);

    } catch (error) {
        console.error('Error serving UI:', error);
        res.status(500).send('Internal Server Error: Unable to load application UI.');
    }
}
