import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import aiService from './ai-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Content Security Policy to allow external images
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "img-src 'self' data: https://oaidalleapiprodscus.blob.core.windows.net https://*.openai.com https://*.blob.core.windows.net; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "connect-src 'self';"
    );
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Simple image proxy route directly on main app
app.get('/image-proxy', async (req, res) => {
    console.log('IMAGE PROXY ENDPOINT HIT!', req.query.url);
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            console.log('No URL provided');
            return res.status(400).json({ error: 'Missing image URL' });
        }
        
        console.log('Proxying image request for:', imageUrl);
        
        const response = await fetch(imageUrl);
        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Set appropriate headers
        res.set({
            'Content-Type': response.headers.get('content-type') || 'image/png',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*'
        });
        
        // Pipe the image data
        const buffer = await response.arrayBuffer();
        console.log('Image buffer size:', buffer.byteLength);
        res.send(Buffer.from(buffer));
        
    } catch (error) {
        console.error('Image proxy error:', error);
        res.status(500).json({ error: 'Failed to proxy image: ' + error.message });
    }
});

// Serve static files from public directory with correct MIME types
const staticOptions = {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (path.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        }
    }
};

// Serve static files directly from public directory
app.use(express.static(path.join(rootDir, 'public'), staticOptions));

// API Routes
console.log('Mounting AI service on /api');
app.use('/api', aiService);
console.log('API routes mounted successfully');

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'public', 'html', 'index.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(rootDir, 'public', 'html', 'order-form.html'));
});

// Also handle /order-form for backward compatibility
app.get('/order-form', (req, res) => {
    res.redirect('/order');
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(rootDir, 'public', 'html', 'my-orders.html'));
});

// Also handle /my-orders for backward compatibility
app.get('/my-orders', (req, res) => {
    res.redirect('/orders');
});

// Handle legacy HTML paths
app.get('/:page.html', (req, res) => {
    const page = req.params.page;
    res.redirect(page === 'index' ? '/' : '/' + page);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Something went wrong!' 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Root directory: ${rootDir}`);
    console.log('TESTING: Server should have the test-image-proxy route now');
});
