const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Default placeholder image for testing without API key
const PLACEHOLDER_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSIyNTYiIHk9IjI1NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5UZXN0IERlc2lnbjwvdGV4dD48L3N2Zz4=';

/**
 * Handles the translation of Hebrew text using ChatGPT
 * @param {string} hebrewText - The text to translate
 * @returns {Promise<string>} - The translated English text
 */
async function translateWithChatGPT(hebrewText) {
    // If no API key, return a mock translation for testing
    if (!OPENAI_API_KEY) {
        console.log('No API key found - returning mock translation');
        // Basic Hebrew to English mapping for testing
        const mockTranslations = {
            'יום הולדת': 'Birthday celebration',
            'חתונה': 'Wedding',
            'בר מצווה': 'Bar Mitzvah',
            'בת מצווה': 'Bat Mitzvah',
            'מסיבת רווקים': 'Bachelor party',
            'מסיבת רווקות': 'Bachelorette party',
            'אירוע חברה': 'Company event',
            'טיול שנתי': 'Annual trip',
            'גיבוש צוות': 'Team building'
        };
        
        return mockTranslations[hebrewText] || 'Test Event';
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Using a more cost-effective model for translation
                messages: [
                    {
                        "role": "system",
                        "content": "You are a professional translator from Hebrew to English. Translate directly and concisely."
                    },
                    {
                        "role": "user",
                        "content": `Translate to English: "${hebrewText}"`
                    }
                ],
                temperature: 0.3, // Lower temperature for more consistent translations
                max_tokens: 100  // Reduced token limit for translations
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const translation = data.choices[0].message.content.trim();
        return translation;

    } catch (error) {
        console.error('Translation error:', error);
        throw new Error(`Failed to translate text: ${error.message}`);
    }
}

/**
 * Style modifiers to enhance AI image generation
 */
const styleModifiers = [
    "minimalist design",
    "high contrast black and white",
    "suitable for screen printing",
    "clean lines and shapes",
    "bold graphic design",
    "t-shirt artwork",
    "vector style illustration"
];

/**
 * Generates an AI prompt for t-shirt design based on event type and description
 * @param {Object} designData - The design input data
 * @param {string} designData.eventType - Type of event in Hebrew
 * @param {string} designData.description - T-shirt description in Hebrew
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.isBackDesign=false] - Whether this is for back design
 * @returns {Promise<string>} - English prompt for AI image generation
 */
async function generateTShirtDesignPrompt(designData, options = {}) {
    const {eventType, description} = designData;
    const {isBackDesign = false} = options;

    // Translate both event type and description using ChatGPT
    const [translatedEventType, translatedDescription] = await Promise.all([
        translateWithChatGPT(eventType),
        description ? translateWithChatGPT(description) : Promise.resolve("")
    ]);

    // Create base prompt
    let prompt = `Create a ${isBackDesign ? 'back' : 'front'} t-shirt design with the following characteristics:\n`;
    prompt += `Theme: ${translatedEventType}\n`;
    prompt += `Style: ${styleModifiers.join(', ')}\n`;
    
    // Add translated description context
    if (translatedDescription) {
        prompt += `Additional context: ${translatedDescription}\n`;
    }

    // Add technical requirements
    prompt += `\nTechnical requirements:
- Must be black and white only
- High contrast for screen printing
- Clean, professional design
- No text (text will be added separately)
- Suitable for ${isBackDesign ? 'back' : 'front'} of t-shirt`;

    return prompt;
}

/**
 * Enhances the design prompt with specific style elements
 * @param {string} basePrompt - The initial prompt
 * @param {Object} stylePreferences - User's style preferences
 * @returns {string} - Enhanced prompt
 */
function enhancePromptWithStyle(basePrompt, stylePreferences = {}) {
    const {
        artStyle = 'modern',
        complexity = 'medium',
        emphasis = 'balanced'
    } = stylePreferences;

    const styleAdditions = {
        modern: "modern and contemporary aesthetic",
        traditional: "classic and timeless design",
        artistic: "creative and artistic interpretation",
        simple: "clean and minimalistic approach",
    };

    const complexityGuides = {
        simple: "Keep the design elements minimal and straightforward",
        medium: "Balance simplicity with engaging visual elements",
        complex: "Create an intricate but cohesive design"
    };

    return `${basePrompt}\n\nStyle preferences:
- ${styleAdditions[artStyle] || styleAdditions.modern}
- ${complexityGuides[complexity] || complexityGuides.medium}
- Emphasis on ${emphasis} design elements`;
}

/**
 * Generates an image using DALL-E based on the provided prompt
 * @param {string} prompt - The English prompt for image generation
 * @param {Object} [options] - Additional options for image generation
 * @param {number} [options.width=1024] - Image width (must be 1024 for DALL-E 3)
 * @param {number} [options.height=1024] - Image height (must be 1024 for DALL-E 3)
 * @param {string} [options.model="dall-e-3"] - The model to use
 * @param {string} [options.quality="standard"] - Image quality (standard or hd)
 * @returns {Promise<{url: string, revisedPrompt: string}>} - The generated image URL and the revised prompt
 */
async function generateImageWithDallE(prompt, options = {}) {
    // If no API key, return placeholder image for testing
    if (!OPENAI_API_KEY) {
        console.log('No API key found - returning placeholder image');
        return {
            url: PLACEHOLDER_IMAGE_URL,
            revisedPrompt: `Test prompt: ${prompt}`
        };
    }

    const {
        width = 1024,  // Updated for DALL-E 3 compatibility
        height = 1024, // Updated for DALL-E 3 compatibility
        model = "dall-e-3",
        quality = "standard" // Always use standard quality
    } = options;

    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model,
                prompt,
                n: 1,
                size: `${width}x${height}`,
                quality,
                response_format: "url"
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`DALL-E API error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return {
            url: data.data[0].url,
            revisedPrompt: data.data[0].revised_prompt
        };

    } catch (error) {
        console.error('Image generation error:', error);
        throw new Error(`Failed to generate image: ${error.message}`);
    }
}

/**
 * Complete flow: from Hebrew input to generated image
 * @param {Object} designData - The design input data
 * @param {Object} [options] - Options for both prompt and image generation
 * @returns {Promise<{imageUrl: string, prompt: string, revisedPrompt: string}>}
 */
async function createTShirtDesign(designData, options = {}) {
    try {
        // Generate the base prompt with translations
        let prompt = await generateTShirtDesignPrompt(designData, options);
        
        // Add style enhancements if provided
        if (options.stylePreferences) {
            prompt = enhancePromptWithStyle(prompt, options.stylePreferences);
        }

        // Generate the image
        const { url, revisedPrompt } = await generateImageWithDallE(prompt, {
            model: "dall-e-3",
            quality: options.highQuality ? "hd" : "standard"
        });

        return {
            imageUrl: url,
            prompt,
            revisedPrompt
        };
    } catch (error) {
        console.error('Design creation error:', error);
        throw new Error(`Failed to create design: ${error.message}`);
    }
}

/**
 * Improves an existing design based on user feedback and design history
 * @param {Object} designHistory - The history of the design process
 * @param {string} designHistory.originalPrompt - The initial prompt used
 * @param {string} designHistory.revisedPrompt - The revised prompt from DALL-E
 * @param {string} designHistory.imageUrl - URL of the current design
 * @param {string} improvementFeedback - User's feedback for improvement
 * @param {Object} [options] - Additional options for the improvement
 * @returns {Promise<{imageUrl: string, prompt: string, revisedPrompt: string}>}
 */
async function improveDesign(designHistory, improvementFeedback, options = {}) {
    try {
        // Translate the improvement feedback if it's in Hebrew
        const translatedFeedback = await translateWithChatGPT(improvementFeedback);

        // Create an enhanced prompt that builds upon the previous design
        let improvementPrompt = `Improve the following t-shirt design:\n\n`;
        improvementPrompt += `Original concept: ${designHistory.originalPrompt}\n`;
        improvementPrompt += `Previous iteration: ${designHistory.revisedPrompt}\n`;
        improvementPrompt += `Requested improvements: ${translatedFeedback}\n\n`;
        
        // Add specific instructions to maintain consistency
        improvementPrompt += `Requirements:
- Maintain the core theme and style of the original design
- Incorporate the requested improvements
- Keep the design suitable for t-shirt printing
- Ensure high contrast and clean lines
- Preserve the design's printability`;

        // Add any style preferences from the original design
        if (options.stylePreferences) {
            improvementPrompt = enhancePromptWithStyle(improvementPrompt, options.stylePreferences);
        }

        // Generate the improved image
        const { url, revisedPrompt } = await generateImageWithDallE(improvementPrompt, {
            model: "dall-e-3",
            quality: options.highQuality ? "hd" : "standard"
        });

        return {
            imageUrl: url,
            prompt: improvementPrompt,
            revisedPrompt,
            previousVersion: {
                imageUrl: designHistory.imageUrl,
                prompt: designHistory.originalPrompt,
                revisedPrompt: designHistory.revisedPrompt
            }
        };
    } catch (error) {
        console.error('Design improvement error:', error);
        throw new Error(`Failed to improve design: ${error.message}`);
    }
}

// Export functions for use in other files
export {
    generateTShirtDesignPrompt,
    enhancePromptWithStyle,
    generateImageWithDallE,
    createTShirtDesign,
    improveDesign,
    translateWithChatGPT,
    styleModifiers
};
