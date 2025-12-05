import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

    // Resolve path relative to the current working directory (Vercel root)
    const filePath = path.join(process.cwd(), filename);

    try {
        const html = fs.readFileSync(filePath, 'utf8');
        
        // 1. Generate a random nonce
        const nonce = crypto.randomBytes(16).toString('base64');
        
        // 2. Inject nonce into ALL script tags
        const updatedHtml = html.replace(/<script/g, `<script nonce="${nonce}"`);

        // 3. Set Content-Security-Policy Header
        // We include 'unsafe-inline' for style-src to allow the styles in head, 
        // but modern browsers will ignore 'unsafe-inline' for script-src when a nonce is present.
        // Removed 'unsafe-eval' to strictly forbid eval() and string-based timers.
        res.setHeader(
            'Content-Security-Policy', 
            `default-src 'self' https:; script-src 'self' 'nonce-${nonce}' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' https: data:; connect-src 'self' https:;`
        );
        
        res.setHeader('Content-Type', 'text/html');
        res.send(updatedHtml);

    } catch (error) {
        console.error('Error serving UI:', error);
        res.status(500).send('Internal Server Error: Unable to load application UI.');
    }
}
