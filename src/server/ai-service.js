import express from 'express';
import { generateDesign, improveDesign } from './openai-client.js';

const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// AI generation endpoints
router.post('/generate-design', async (req, res) => {
    try {
        const { eventType, description, designType } = req.body;
        
        // Call OpenAI API securely from server
        const design = await generateDesign(eventType, description, designType);
        
        res.json({ success: true, design });
    } catch (error) {
        console.error('Design generation error:', error);
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
