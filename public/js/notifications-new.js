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
            background: 'linear-gradient(135deg, #2c5530 0%, #27ae60 100%)',
            border: '1px solid #27ae60',
            icon: '✅'
        },
        error: {
            background: 'linear-gradient(135deg, #5c2626 0%, #e74c3c 100%)',
            border: '1px solid #e74c3c',
            icon: '❌'
        },
        warning: {
            background: 'linear-gradient(135deg, #5c4526 0%, #f39c12 100%)',
            border: '1px solid #f39c12',
            icon: '⚠️'
        },
        info: {
            background: 'linear-gradient(135deg, #2c4a5c 0%, #3498db 100%)',
            border: '1px solid #3498db',
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
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        min-width: 300px;
        max-width: 450px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 15px;
        line-height: 1.5;
        text-align: right;
        direction: rtl;
        backdrop-filter: blur(10px);
        border-radius: 12px;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
        transition: all 0.3s ease;
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
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="font-size: 24px; line-height: 1; margin-top: 2px;">
                ${currentStyle.icon}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                    ${title}
                </div>
                ${message ? `<div style="font-size: 14px; line-height: 1.6; color: #f8f9fa; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${message}</div>` : ''}
                <div style="margin-top: 12px; font-size: 12px; color: #bdc3c7; opacity: 0.8;">
                    לחץ כדי לסגור
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
