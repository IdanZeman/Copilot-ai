import 'dotenv/config';
import { generateTShirtDesignPrompt, generateImageWithDallE, translateWithChatGPT } from '../../ai-prompt-generator.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateDesign(eventType, description, designType) {
    try {
        // Prepare design data
        const designData = {
            eventType: eventType,
            description: description
        };

        // Generate the prompt using the existing function
        const prompt = await generateTShirtDesignPrompt(designData, { 
            isBackDesign: designType === 'back' 
        });

        // Generate image using DALL-E
        const imageResult = await generateImageWithDallE(prompt, {
            width: 1024,
            height: 1024,
            model: "dall-e-3",
            quality: "standard"
        });

        return {
            imageUrl: imageResult.url,
            prompt: prompt,
            revisedPrompt: imageResult.revisedPrompt
        };
    } catch (error) {
        console.error('OpenAI generation error:', error);
        throw new Error('Failed to generate design');
    }
}

async function improveDesign(designHistory, improvementFeedback) {
    try {
        // Translate feedback to English if needed
        const translatedFeedback = await translateWithChatGPT(improvementFeedback);
        
        // Create improved prompt based on feedback
        const improvedPromptData = {
            eventType: designHistory.eventType || 'general',
            description: `${designHistory.description}. Improvements: ${translatedFeedback}`,
            previousPrompt: designHistory.prompt
        };
        
        // Generate improved prompt
        const improvedPrompt = await generateTShirtDesignPrompt(improvedPromptData, {
            isBackDesign: designHistory.designType === 'back'
        });
        
        // Generate new image with improved prompt
        const imageResult = await generateImageWithDallE(improvedPrompt, {
            width: 1024,
            height: 1024,
            model: "dall-e-3",
            quality: "standard"
        });
        
        return {
            imageUrl: imageResult.url,
            prompt: improvedPrompt,
            revisedPrompt: imageResult.revisedPrompt,
            feedback: translatedFeedback
        };
    } catch (error) {
        console.error('OpenAI improvement error:', error);
        throw new Error('Failed to improve design');
    }
}

export {
    generateDesign,
    improveDesign
};
