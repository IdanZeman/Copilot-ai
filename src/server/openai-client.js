import 'dotenv/config';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper function to generate T-shirt design prompts
async function generateTShirtDesignPrompt(data, options = {}) {
    const { eventType, description } = data;
    const { isBackDesign = false } = options;
    
    const position = isBackDesign ? 'גב' : 'חזית';
    
    const prompt = `צור איור בשחור לבן בלבד, בסגנון קווי מתאר פשוטים, נקיים וברורים, ללא צבעים או פרטים קטנים. 
    האיור מיועד לשמש כגלופה להדפסה על ${position} של חולצה ל${eventType}. 
    הרקע חייב להיות לבן לגמרי, והאיור כולו בצבע שחור בלבד, ללא הצללות. 
    הסגנון צריך להיות קומיקסי או קריקטוריסטי, עם קווים ברורים שמתאימים להדפסה.
    התוכן של האיור הוא: ${description}`;
    
    return prompt;
}

// Helper function to generate image with DALL-E
async function generateImageWithDallE(prompt, options = {}) {
    const { width = 1024, height = 1024, model = "dall-e-3", quality = "standard" } = options;
    
    // DALL-E-3 only supports specific sizes
    let size;
    if (model === "dall-e-3") {
        // DALL-E-3 supported sizes: 1024x1024, 1792x1024, 1024x1792
        size = "1024x1024"; // Always use square format for t-shirt designs
    } else {
        // DALL-E-2 supports: 256x256, 512x512, 1024x1024
        size = `${width}x${height}`;
    }
    
    console.log('🎨 Generating image with DALL-E:', { model, size, quality });
    
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
            size: size,
            quality: quality,
            response_format: "b64_json",
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DALL-E API error:', response.status, errorText);
        throw new Error(`DALL-E API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ DALL-E image generated successfully');
    return {
        imageData: data.data[0].b64_json,
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
        console.log('🚀 Starting design generation:', { eventType, description, designType });
        
        // Implementation moved from ai-prompt-generator.js
        const prompt = await generateTShirtDesignPrompt({ eventType, description }, { 
            isBackDesign: designType === 'back' 
        });
        
        console.log('📝 Generated prompt:', prompt);
        
        const imageResult = await generateImageWithDallE(prompt, {
            model: "dall-e-3",
            width: 1024,
            height: 1024,
            quality: "standard"
        });

        console.log('✅ Design generation completed successfully');
        return {
            imageData: imageResult.imageData,
            prompt: prompt,
            revisedPrompt: imageResult.revisedPrompt
        };
    } catch (error) {
        console.error('❌ OpenAI generation error:', error);
        console.error('📊 Error details:', {
            message: error.message,
            stack: error.stack,
            eventType,
            description,
            designType
        });
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
