// Development configuration for testing without AI costs
export const DEV_CONFIG = {
    // Set to true to enable development mode (no real AI requests)
    DEVELOPMENT_MODE: localStorage.getItem('development-mode') === 'true',
    
    // Mock response delay in milliseconds (to simulate real API)
    MOCK_DELAY: 2000,
    
    // Mock images for testing - using default t-shirt image
    MOCK_IMAGES: [
        '../images/default-tshirt.png',
        '../images/default-tshirt.png',
        '../images/default-tshirt.png',
        '../images/default-tshirt.png'
    ],
    
    // Mock design descriptions for back designs
    MOCK_BACK_DESIGNS: [
        'עיצוב גב מדומה - דוגמה 1 (מצב פיתוח)',
        'עיצוב גב מדומה - דוגמה 2 (מצב פיתוח)', 
        'עיצוב גב מדומה - דוגמה 3 (מצב פיתוח)',
        'עיצוב גב מדומה - דוגמה 4 (מצב פיתוח)'
    ],
    
    // Development notifications
    SHOW_DEV_NOTIFICATIONS: true,
    
    // Log API calls in development
    LOG_API_CALLS: true
};

// Helper function to check if in development mode
export function isDevelopmentMode() {
    return localStorage.getItem('development-mode') === 'true';
}

// Mock AI response generator
export function generateMockAIResponse(prompt, type = 'design') {
    const randomIndex = Math.floor(Math.random() * DEV_CONFIG.MOCK_IMAGES.length);
    
    if (type === 'design') {
        return {
            success: true,
            images: [
                DEV_CONFIG.MOCK_IMAGES[randomIndex],
                DEV_CONFIG.MOCK_IMAGES[(randomIndex + 1) % DEV_CONFIG.MOCK_IMAGES.length],
                DEV_CONFIG.MOCK_IMAGES[(randomIndex + 2) % DEV_CONFIG.MOCK_IMAGES.length]
            ],
            prompt: prompt,
            timestamp: new Date().toISOString()
        };
    } else if (type === 'back_design') {
        return {
            success: true,
            image: DEV_CONFIG.MOCK_IMAGES[randomIndex],
            description: DEV_CONFIG.MOCK_BACK_DESIGNS[randomIndex],
            prompt: prompt,
            timestamp: new Date().toISOString()
        };
    }
}

// Development logger
export function logAPICall(endpoint, params) {
    if (DEV_CONFIG.LOG_API_CALLS) {
        console.group('🔧 DEV MODE - API Call Blocked');
        console.log('Endpoint:', endpoint);
        console.log('Parameters:', params);
        console.log('Timestamp:', new Date().toLocaleString());
        console.log('💡 Real API call would be made here in production');
        console.groupEnd();
    }
}

// Show development notification
export function showDevNotification(message) {
    if (DEV_CONFIG.SHOW_DEV_NOTIFICATIONS) {
        console.log('🔧 DEV MODE:', message);
        
        // Create visual dev indicator
        const devIndicator = document.createElement('div');
        devIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.3);
        `;
        devIndicator.textContent = '🔧 DEV MODE: ' + message;
        
        document.body.appendChild(devIndicator);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (devIndicator.parentNode) {
                devIndicator.remove();
            }
        }, 3000);
    }
}

// Initialize development mode indicator
export function initDevMode() {
    if (isDevelopmentMode()) {
        // Add permanent dev indicator
        const permIndicator = document.createElement('div');
        permIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 6px 10px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
            z-index: 10001;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.4);
            backdrop-filter: blur(5px);
        `;
        permIndicator.textContent = '🔧 מצב פיתוח';
        permIndicator.title = 'מצב פיתוח פעיל - לא נשלחות בקשות למודל AI';
        
        document.body.appendChild(permIndicator);
        
        console.log('🔧 DEVELOPMENT MODE ENABLED - No real AI requests will be made');
        showDevNotification('מצב פיתוח פעיל - חסכון בעלויות AI');
    }
}
