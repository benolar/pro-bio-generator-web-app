import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { file, type } = req.query;

    // Security: strict allowlist of expected hashed filenames to prevent directory traversal
    // We only allow files that contain our specific hash '9d4e1a'
    if (!file || !file.includes('9d4e1a')) {
        return res.status(404).send('Not Found');
    }

    // Determine Content-Type
    let contentType = 'text/plain';
    if (type === 'js' || file.endsWith('.js')) contentType = 'application/javascript';
    else if (type === 'css' || file.endsWith('.css')) contentType = 'text/css';
    else if (type === 'ico' || file.endsWith('.ico')) contentType = 'image/x-icon';

    // Resolve path: Vercel functions run in root, so we look into 'public'
    // The build script ensures files are copied there.
    const filePath = path.join(process.cwd(), 'public', path.basename(file));

    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            
            // Aggressive Caching for Hashed Files (1 year, immutable)
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('Content-Type', contentType);
            res.setHeader('X-Content-Type-Options', 'nosniff');
            
            res.send(content);
        } else {
            console.error(`Asset not found: ${filePath}`);
            res.status(404).send('Asset Not Found');
        }
    } catch (error) {
        console.error('Error serving asset:', error);
        res.status(500).send('Internal Server Error');
    }
}
