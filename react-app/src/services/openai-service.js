// OpenAI API Configuration and Services
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// OpenAI Service - Handles AI image generation with dev/production modes
import adminService from './admin-service';
class OpenAIService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    
    // Debug logging for API key
    console.log('🔑 OpenAI Service initialized');
    console.log('🔑 API Key exists:', !!this.apiKey);
    console.log('🔑 API Key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('🔑 API Key preview:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'NOT SET');
  }

  /**
   * Check if currently in development mode (including admin override)
   * @returns {boolean}
   */
  isDevMode() {
    // Check new dev mode from navbar first
    const devModeFromNavbar = localStorage.getItem('devMode');
    if (devModeFromNavbar !== null) {
      console.log('🎨 OpenAI Service: Using navbar dev mode:', devModeFromNavbar === 'true');
      return devModeFromNavbar === 'true';
    }

    // Check admin override (legacy)
    const adminOverride = localStorage.getItem('ADMIN_DEV_MODE_OVERRIDE');
    if (adminOverride !== null) {
      console.log('🎨 OpenAI Service: Using admin override:', adminOverride === 'true');
      return adminOverride === 'true';
    }

    // Fall back to environment variable
    const envDevMode = import.meta.env.VITE_DEV_MODE === 'true';
    console.log('🎨 OpenAI Service: Using env VITE_DEV_MODE:', envDevMode, 'Raw value:', import.meta.env.VITE_DEV_MODE);
    return envDevMode;
  }

  async generateImage(prompt, options = {}) {
    const {
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      model = 'dall-e-3'
    } = options;

    // במצב פיתוח - מחזיר תמונת Mock
    if (this.isDevMode()) {
      console.log('🔧 DEV MODE: מחזיר תמונה גנרית במקום קריאה ל-OpenAI');
      console.log('📝 Prompt:', prompt);
      
      // סימולציה של זמן המתנה
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        imageUrl: '/images/default-tshirt.png',
        revisedPrompt: `מצב פיתוח: ${prompt}`,
        devMode: true,
        message: 'זוהי תמונה גנרית - במצב פיתוח'
      };
    }

    // בדיקת API Key
    console.log('🔍 Checking API key...');
    console.log('🔍 this.apiKey:', this.apiKey);
    console.log('🔍 this.apiKey type:', typeof this.apiKey);
    console.log('🔍 this.apiKey === "your_openai_api_key_here":', this.apiKey === 'your_openai_api_key_here');
    console.log('🔍 !this.apiKey:', !this.apiKey);
    
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.error('❌ OpenAI API Key לא הוגדר או אינו תקין');
      console.error('💡 הגדר VITE_OPENAI_API_KEY ב-.env או השתמש במצב פיתוח');
      
      // במקרה של מפתח לא תקין, נחזור למצב פיתוח
      console.log('🔄 עובר למצב פיתוח בגלל מפתח API לא תקין');
      
      return {
        success: true,
        imageUrl: '/images/default-tshirt.png',
        revisedPrompt: prompt,
        devMode: true,
        message: 'מפתח OpenAI לא תקין - עברנו למצב פיתוח'
      };
    }

    try {
      console.log('🎨 יוצר תמונה עם OpenAI API...');
      console.log('📝 Prompt:', prompt);

      const response = await fetch(`${this.baseURL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size,
          quality,
          style,
          response_format: 'url'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error('לא התקבלה תמונה מOpenAI');
      }

      const result = {
        success: true,
        imageUrl: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt || prompt,
        devMode: false
      };

      console.log('✅ תמונה נוצרה בהצלחה:', result.imageUrl);
      return result;

    } catch (error) {
      console.error('❌ שגיאה ביצירת תמונה:', error);
      throw error;
    }
  }

  // יצירת Prompt מותאם לעיצוב חולצות
  createShirtDesignPrompt(description, eventType = '', style = 'graphic') {
    const basePrompts = {
      graphic: 'Create a high-quality graphic design for a t-shirt',
      artistic: 'Create an artistic illustration for a t-shirt',
      minimalist: 'Create a clean, minimalist design for a t-shirt',
      vintage: 'Create a vintage-style design for a t-shirt'
    };

    const eventContext = eventType ? `for a ${eventType} event` : '';
    
    const fullPrompt = `${basePrompts[style] || basePrompts.graphic} ${eventContext}. 
    Design concept: ${description}. 
    Requirements: 
    - High contrast design suitable for t-shirt printing
    - Clear, bold elements that work well on fabric
    - Professional quality suitable for merchandise
    - Avoid text unless specifically requested
    - Focus on visual impact and memorability
    - Style should be appropriate for the event type
    - Design should be centered and well-balanced`;

    return fullPrompt.trim();
  }

  // בדיקת סטטוס השירות
  async checkStatus() {
    if (this.devMode) {
      return { status: 'ok', mode: 'development', message: 'פועל במצב פיתוח' };
    }

    if (!this.apiKey) {
      return { status: 'error', message: 'API Key חסר' };
    }

    try {
      // בדיקה פשוטה של חיבור ל-API
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        return { status: 'ok', mode: 'production', message: 'מחובר לOpenAI API' };
      } else {
        return { status: 'error', message: 'שגיאה בחיבור ל-OpenAI API' };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// יצירת instance יחיד
export const openAIService = new OpenAIService();
export default openAIService;
