import express from 'express';
import { generateDesign, improveDesign } from './openai-client.js';

const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// AI generation endpoints
router.post('/generate-design', async (req, res) => {
    console.log('🚀 === SERVER: /api/generate-design endpoint called ===');
    console.log('📥 Request method:', req.method);
    console.log('📥 Request URL:', req.url);
    console.log('📥 Request headers:', req.headers);
    console.log('📥 Request body:', req.body);
    console.log('🕐 Timestamp:', new Date().toISOString());
    console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('🔑 API Key prefix:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET');
    
    try {
        const { eventType, description, designType } = req.body;
        console.log('📊 Extracted data:', { eventType, description, designType });
        
        // Validate required fields
        if (!description || !designType) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: description and designType' 
            });
        }
        
        // Call OpenAI API securely from server
        console.log('🤖 Calling generateDesign function...');
        const design = await generateDesign(eventType, description, designType);
        console.log('✅ Design generated successfully:', design);
        
        res.json({ success: true, design });
    } catch (error) {
        console.error('❌ === FULL ERROR DETAILS ===');
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error name:', error.name);
        console.error('❌ Request data:', req.body);
        console.error('❌ Environment check:', {
            nodeEnv: process.env.NODE_ENV,
            openaiKeyExists: !!process.env.OPENAI_API_KEY,
            timestamp: new Date().toISOString()
        });
        console.error('❌ === END ERROR DETAILS ===');
        
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate design',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
