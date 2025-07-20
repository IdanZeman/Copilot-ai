import 'dotenv/config';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateDesign(eventType, description, designType) {
    try {
        // Implementation moved from ai-prompt-generator.js
        const prompt = await generateTShirtDesignPrompt({ eventType, description }, { 
            isBackDesign: designType === 'back' 
        });
        
        const imageResult = await generateImageWithDallE(prompt, {
            width: 512,
            height: 512,
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
        // Implementation moved from ai-prompt-generator.js
        const translatedFeedback = await translateWithChatGPT(improvementFeedback);
        
        // Rest of the improve design logic...
        
        return {
            // improved design details
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
