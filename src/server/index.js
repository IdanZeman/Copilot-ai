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

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('📍 Origin:', req.get('Origin') || 'No Origin header');
    console.log('🔗 Referer:', req.get('Referer') || 'No Referer header');
    console.log('🌍 User-Agent:', req.get('User-Agent') || 'No User-Agent header');
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Request body keys:', Object.keys(req.body));
    }
    next();
});

// Set Content Security Policy to allow Firebase
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseapp.com; " +
        "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com; " +
        "img-src 'self' data: https:; " +
        "worker-src 'self'; " +
        "child-src 'self'; " +
        "object-src 'none'; " +
        "base-uri 'self';"
    );
    
    // Add Cross-Origin headers for Firebase Auth
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(rootDir, 'public')));

// API Routes
app.use('/api', aiService);

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

app.get('/test-orders', (req, res) => {
    res.sendFile(path.join(rootDir, 'public', 'html', 'test-orders.html'));
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
});
