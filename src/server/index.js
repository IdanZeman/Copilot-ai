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
