// Enhanced notification system with improved readability
export function showNotification(type, title, message = '', duration = 12000) {
    console.log(`Showing ${type} notification:`, title, message);
    
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Define colors for each type with improved contrast
    const styles = {
        success: {
            background: 'linear-gradient(135deg, #1a4a20 0%, #2d5a3d 100%)',
            border: '2px solid #27ae60',
            icon: '✅'
        },
        error: {
            background: 'linear-gradient(135deg, #4a1a1a 0%, #5a2d2d 100%)',
            border: '2px solid #e74c3c',
            icon: '❌'
        },
        warning: {
            background: 'linear-gradient(135deg, #4a3a1a 0%, #5a4a2d 100%)',
            border: '2px solid #f39c12',
            icon: '⚠️'
        },
        info: {
            background: 'linear-gradient(135deg, #1a3a4a 0%, #2d4a5a 100%)',
            border: '2px solid #3498db',
            icon: 'ℹ️'
        }
    };

    const currentStyle = styles[type] || styles.info;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${currentStyle.background};
        color: #ffffff;
        padding: 20px 25px;
        border-radius: 12px;
        border: ${currentStyle.border};
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 6px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        min-width: 280px;
        max-width: 350px;
        max-height: 80vh;
        overflow-y: auto;
        font-family: 'Segoe UI', 'Arial', 'Helvetica', sans-serif;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
        text-align: right;
        direction: rtl;
        backdrop-filter: blur(15px);
        animation: slideIn 0.4s ease-out;
        transition: all 0.3s ease;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    `;

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            .notification:hover {
                transform: translateX(-10px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    // Create notification content with improved typography
    const content = `
        <div style="position: relative;">
            <button style="
                position: absolute;
                top: -5px;
                left: -5px;
                background: rgba(255,255,255,0.2);
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                color: #ffffff;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 10001;
            " 
            onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
            onmouseout="this.style.background='rgba(255,255,255,0.2)'"
            onclick="this.closest('.notification').click()">✕</button>
            
            <div style="display: flex; align-items: flex-start; gap: 12px; padding-right: 10px;">
                <div style="font-size: 24px; line-height: 1; margin-top: 2px;">
                    ${currentStyle.icon}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); color: #ffffff;">
                        ${title}
                    </div>
                    ${message ? `<div style="font-size: 13px; line-height: 1.6; color: #ffffff; text-shadow: 1px 1px 3px rgba(0,0,0,0.7); font-weight: 400;">${message}</div>` : ''}
                </div>
            </div>
        </div>
    `;

    notification.innerHTML = content;

    // Add click to close functionality
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after duration (increased to 12 seconds for better readability)
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);

    return notification;
}

// Specific notification functions with enhanced messaging
export function showSuccessNotification(title, message = '', duration = 12000) {
    return showNotification('success', title, message, duration);
}

export function showErrorNotification(title, message = '', duration = 12000) {
    return showNotification('error', title, message, duration);
}

export function showWarningNotification(message, duration = 12000) {
    return showNotification('warning', 'אזהרה', message, duration);
}

export function showInfoNotification(title, message = '', duration = 12000) {
    return showNotification('info', title, message, duration);
}

// Simple success notification (alias for backward compatibility)
export function showSimpleSuccessNotification(message, duration = 8000) {
    return showNotification('success', 'הצלחה', message, duration);
}

// Special notification for usage limits with enhanced styling
export function showUsageLimitNotification(type, used, limit, timeframe) {
    const icon = type === 'warning' ? '⚠️' : '❌';
    const title = type === 'warning' ? 'התקרבת למגבלה' : 'הגעת למגבלה';
    
    const message = `
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin: 10px 0;">
            <div style="font-size: 16px; margin-bottom: 8px;">
                השתמשת ב-<strong>${used}</strong> מתוך <strong>${limit}</strong> עיצובים ${timeframe}
            </div>
            <div style="font-size: 14px; color: #ecf0f1;">
                ${type === 'warning' ? 
                    `נותרו לך עוד ${limit - used} עיצובים ${timeframe}` :
                    `המתן ${timeframe === 'השעה' ? 'לשעה הבאה' : 'למחר'} כדי להמשיך לעצב`
                }
            </div>
        </div>
    `;

    return showNotification(type, title, message, 12000);
}

// Show login success notification with confetti effect
export function showLoginSuccessNotification(user) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'משתמש';
    
    // Create confetti effect
    createConfettiEffect();
    
    const message = `
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin: 10px 0; text-align: center;">
            <div style="font-size: 18px; margin-bottom: 8px;">
                🎉 ברוך הבא, <strong>${displayName}</strong>!
            </div>
            <div style="font-size: 14px; color: #ecf0f1;">
                התחברת בהצלחה למערכת עיצוב החולצות
            </div>
        </div>
    `;

    return showNotification('success', 'התחברות בוצעה בהצלחה', message, 8000);
}

// Create confetti effect
function createConfettiEffect() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 99999;
    `;
    
    document.body.appendChild(confettiContainer);
    
    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${getRandomColor()};
            left: ${Math.random() * 100}%;
            animation: fall ${3 + Math.random() * 3}s linear forwards;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        confettiContainer.appendChild(confetti);
    }
    
    // Add animation keyframes
    if (!document.querySelector('#confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        if (confettiContainer.parentElement) {
            confettiContainer.remove();
        }
    }, 6000);
}

// Get random color for confetti
function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Development mode notification (orange/yellow theme)
export function showDevNotification(message, duration = 5000) {
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
        font-family: 'Segoe UI', Arial, sans-serif;
    `;
    devIndicator.textContent = '🔧 DEV MODE: ' + message;
    
    document.body.appendChild(devIndicator);
    
    // Remove after duration
    setTimeout(() => {
        if (devIndicator.parentNode) {
            devIndicator.remove();
        }
    }, duration);
    
    return devIndicator;
}
