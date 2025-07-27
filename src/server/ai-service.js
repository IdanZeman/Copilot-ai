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
    
    try {
        const { eventType, description, designType } = req.body;
        console.log('📊 Extracted data:', { eventType, description, designType });
        
        // Call OpenAI API securely from server
        console.log('🤖 Calling generateDesign function...');
        const design = await generateDesign(eventType, description, designType);
        console.log('✅ Design generated successfully:', design);
        
        res.json({ success: true, design });
    } catch (error) {
        console.error('❌ Design generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate design' 
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
