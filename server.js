import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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

// --- STATIC FILES ---

// Serve 'public' folder if built, otherwise serve root (for development)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Explicit route for admin.html to ensure clean URL or direct access
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback for SPA (Single Page Application) behavior
app.get('*', (req, res) => {
    // Check if a file in public exists first
    const publicIndex = path.join(__dirname, 'public', 'index.html');
    res.sendFile(publicIndex, (err) => {
        if (err) {
            // Fallback to root index.html
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints ready at /api/...`);
});
