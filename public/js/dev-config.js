// Development configuration for testing without AI costs
import { showDevNotification, showInfoNotification } from './notifications.js';

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

// Show development notification using the imported function
function showDevNotificationInternal(message) {
    if (DEV_CONFIG.SHOW_DEV_NOTIFICATIONS) {
        console.log('🔧 DEV MODE:', message);
        
        // Use the imported showDevNotification
        showDevNotification(message);
    }
}

// Initialize development mode indicator
export function initDevMode() {
    updateDevModeUI();
    
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
        showDevNotificationInternal('מצב פיתוח פעיל - חסכון בעלויות AI');
    }
}

// Toggle development mode
export function toggleDevMode() {
    const currentMode = localStorage.getItem('development-mode') === 'true';
    const newMode = !currentMode;
    
    localStorage.setItem('development-mode', newMode.toString());
    
    // Update UI
    updateDevModeUI();
    
    // Show notification
    if (newMode) {
        showDevNotificationInternal('מצב פיתוח הופעל - קריאות AI חסומות');
    } else {
        showInfoNotification('מצב פיתוח כובה - קריאות AI מופעלות');
    }
    
    // Reload page to apply changes properly
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Update dev mode UI elements
export function updateDevModeUI() {
    const isDevMode = localStorage.getItem('development-mode') === 'true';
    
    // Update button text
    const devModeText = document.getElementById('dev-mode-text');
    if (devModeText) {
        devModeText.textContent = isDevMode ? 'כבה מצב פיתוח' : 'הפעל מצב פיתוח';
    }
    
    // Update indicator visibility
    const devIndicator = document.getElementById('dev-indicator');
    if (devIndicator) {
        devIndicator.style.display = isDevMode ? 'flex' : 'none';
    }
}

// Legacy function name for backward compatibility
export function updateDevModeButtonText() {
    updateDevModeUI();
}
