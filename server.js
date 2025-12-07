import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Import API Handlers
import generateBioHandler from './api/generate-bio.js';
import createCheckoutHandler from './api/create-checkout.js';
import verifyPaymentHandler from './api/verify-payment.js';
import webhookHandler from './api/webhook.js';
import adminHandler from './api/admin.js';

// Initialize Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve Directory Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());

// --- ROUTES ---

// 1. Webhook Route
// IMPORTANT: Must be defined BEFORE express.json() because it handles the raw request stream manually for signature verification.
app.post('/api/webhook', async (req, res) => {
    try {
        await webhookHandler(req, res);
    } catch (error) {
        console.error('Webhook Handler Error:', error);
        if (!res.headersSent) res.status(500).send('Internal Server Error');
    }
});

// 2. Global JSON Parsing for other API routes
app.use(express.json());

// 3. API Endpoints
app.post('/api/generate-bio', async (req, res) => {
    try {
        await generateBioHandler(req, res);
    } catch (error) {
        console.error('Generate Bio Error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/create-checkout', async (req, res) => {
    try {
        await createCheckoutHandler(req, res);
    } catch (error) {
        console.error('Create Checkout Error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/verify-payment', async (req, res) => {
    try {
        await verifyPaymentHandler(req, res);
    } catch (error) {
        console.error('Verify Payment Error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Admin Route
app.post('/api/admin', async (req, res) => {
    try {
        await adminHandler(req, res);
    } catch (error) {
        console.error('Admin API Error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- SERVER-SIDE RENDERING WITH CSP NONCE ---

const serveWithNonce = (res, filePath) => {
    fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) {
            console.error('File read error:', err);
            return res.status(500).send('Internal Server Error');
        }

        // 1. Generate a random nonce
        const nonce = crypto.randomBytes(16).toString('base64');
        
        // 2. Inject nonce into ALL script tags
        // This regex adds nonce="${nonce}" to every <script tag found in the HTML
        const updatedHtml = html.replace(/<script/g, `<script nonce="${nonce}"`);

        // 3. Set Content-Security-Policy Header
        // script-src includes 'self' (for external files) and 'nonce-...' (for inline and nonced external)
        // style-src keeps 'unsafe-inline' as we are not noncing styles in this pass, but it's required for the <style> block in head.
        // Removed 'unsafe-eval' to strictly forbid eval() and string-based timers.
        res.setHeader(
            'Content-Security-Policy', 
            `default-src 'self' https:; script-src 'self' 'nonce-${nonce}' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' https: data:; connect-src 'self' https:;`
        );

        res.send(updatedHtml);
    });
};

// Explicit Routes for HTML files to apply Nonce
app.get('/', (req, res) => serveWithNonce(res, path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => serveWithNonce(res, path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => serveWithNonce(res, path.join(__dirname, 'admin.html')));
app.get('/admin.html', (req, res) => serveWithNonce(res, path.join(__dirname, 'admin.html')));

// --- STATIC FILES ---

// Serve 'public' folder if built
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Serve root files (css, js modules) BUT disable default index serving
// so our custom route above handles '/' and '/index.html'
app.use(express.static(__dirname, { index: false }));

// Fallback for SPA (Single Page Application) behavior
app.get('*', (req, res) => {
    // Check if a file in public exists first (rare case if static middleware missed it)
    const publicIndex = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(publicIndex)) {
        serveWithNonce(res, publicIndex);
    } else {
        // Fallback to root index.html with nonce
        serveWithNonce(res, path.join(__dirname, 'index.html'));
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints ready at /api/...`);
});
