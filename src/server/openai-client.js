import 'dotenv/config';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper function to generate T-shirt design prompts
async function generateTShirtDesignPrompt(data, options = {}) {
    const { eventType, description } = data;
    const { isBackDesign = false } = options;
    
    const position = isBackDesign ? 'גב' : 'חזית';
    
    const prompt = `עיצוב חולצה עבור ${eventType}: ${description}. 
    עיצוב ל${position} החולצה. 
    עיצוב מינימליסטי, נקי וברור. 
    צבעים מותאמים לאירוע. 
    ללא טקסט בעברית או אנגלית.`;
    
    return prompt;
}

// Helper function to generate image with DALL-E
async function generateImageWithDallE(prompt, options = {}) {
    const { width = 512, height = 512, model = "dall-e-3", quality = "standard" } = options;
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            n: 1,
            size: `${width}x${height}`,
            quality: quality,
        }),
    });

    if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status}`);
    }

    const data = await response.json();
    return {
        url: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt || prompt
    };
}

// Helper function to translate with ChatGPT
async function translateWithChatGPT(text) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful translator. Translate the following Hebrew text to English for AI image generation."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            max_tokens: 150,
            temperature: 0.3,
        }),
    });

    if (!response.ok) {
        throw new Error(`ChatGPT API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

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
