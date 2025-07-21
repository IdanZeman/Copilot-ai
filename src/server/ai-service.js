import 'dotenv/config';
import express from 'express';
import { generateDesign, improveDesign } from './openai-client.js';

const router = express.Router();

console.log('AI Service router loaded');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Test endpoint to check if API key is loaded
router.get('/test', (req, res) => {
    console.log('Test endpoint called');
    console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
    console.log('OPENAI_API_KEY length:', OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
    res.json({ 
        success: true, 
        hasApiKey: !!OPENAI_API_KEY,
        keyLength: OPENAI_API_KEY ? OPENAI_API_KEY.length : 0
    });
});

// Proxy endpoint for images to handle CORS issues
router.get('/image-proxy', async (req, res) => {
    console.log('IMAGE PROXY ENDPOINT HIT!', req.query);
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            console.log('No URL provided');
            return res.status(400).json({ error: 'Missing image URL' });
        }
        
        console.log('Proxying image request for:', imageUrl);
        
        const response = await fetch(imageUrl);
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
        res.send(Buffer.from(buffer));
        
    } catch (error) {
        console.error('Image proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

console.log('Routes registered: /test, /image-proxy, /generate-design, /improve-design');

// AI generation endpoints
router.post('/generate-design', async (req, res) => {
    try {
        console.log('Received generate-design request:', req.body);
        const { eventType, description, designType } = req.body;
        
        if (!eventType || !description) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: eventType or description'
            });
        }
        
        console.log('Calling generateDesign with:', { eventType, description, designType });
        // Call OpenAI API securely from server
        const design = await generateDesign(eventType, description, designType);
        console.log('generateDesign result:', design);
        
        res.json({ success: true, design });
    } catch (error) {
        console.error('Design generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to generate design' 
        });
    }
});

router.post('/improve-design', async (req, res) => {
    try {
        const { designHistory, feedback } = req.body;
        
        // Call OpenAI API securely from server
        const improvedDesign = await improveDesign(designHistory, feedback);
        
        res.json({ success: true, design: improvedDesign });
    } catch (error) {
        console.error('Design improvement error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to improve design' 
        });
    }
});

export default router;
