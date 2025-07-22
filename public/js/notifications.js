// Beautiful notification system

let notificationContainer = null;

// Initialize notification container
function initNotificationContainer() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
    }
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

// Play success sound (optional - silent if unavailable)
function playSuccessSound() {
    try {
        // Create a simple success sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a sequence of pleasant tones
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            // Set volume and timing
            gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + index * 0.1 + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + index * 0.1 + 0.3);
            
            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
        });
    } catch (error) {
        // Silently fail if audio is not supported or blocked
        console.log('Success sound not available');
    }
}


// Show success notification for login
export function showLoginSuccessNotification(user) {
    initNotificationContainer();
    
    const displayName = user.displayName || user.email?.split('@')[0] || 'משתמש';
    const userEmail = user.email || '';
    const userPhoto = user.photoURL;
    
    // Create confetti effect
    createConfettiEffect();
    
    // Play success sound (optional)
    playSuccessSound();
    
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.pointerEvents = 'auto';
    
    const photoHtml = userPhoto ? '<img src="' + userPhoto + '" alt="User Avatar" class="notification-avatar">' : '';
    
    notification.innerHTML = 
        '<button class="notification-close" onclick="this.parentElement.remove()">' +
            '<i class="fas fa-times"></i>' +
        '</button>' +
        
        '<div class="notification-header">' +
            '<div class="notification-icon">' +
                '<i class="fas fa-check"></i>' +
            '</div>' +
            photoHtml +
            '<div class="notification-content">' +
                '<h3>ברוך הבא, ' + displayName + '! 🎉</h3>' +
                '<p>התחברת בהצלחה למערכת עיצוב החולצות</p>' +
            '</div>' +
        '</div>' +
        
        '<div class="notification-actions">' +
            '<button class="notification-btn primary" onclick="startDesigning()">' +
                '<i class="fas fa-magic"></i> התחל לעצב עכשיו' +
            '</button>' +
            '<button class="notification-btn" onclick="this.parentElement.parentElement.remove()">' +
                '<i class="fas fa-eye"></i> סגור' +
            '</button>' +
        '</div>';
    
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 10 seconds (longer for better UX)
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 400);
        }
    }, 10000);
    
    return notification;
}

// Show general success notification
export function showSuccessNotification(title, message, actions = []) {
    initNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.pointerEvents = 'auto';
    
    let actionsHtml = '';
    if (actions.length > 0) {
        actionsHtml = '<div class="notification-actions">';
        actions.forEach(action => {
            actionsHtml += '<button class="notification-btn ' + (action.primary ? 'primary' : '') + '" onclick="' + action.onclick + '">';
            actionsHtml += (action.icon ? '<i class="' + action.icon + '"></i>' : '') + ' ' + action.text;
            actionsHtml += '</button>';
        });
        actionsHtml += '</div>';
    }
    
    notification.innerHTML = 
        '<button class="notification-close" onclick="this.parentElement.remove()">' +
            '<i class="fas fa-times"></i>' +
        '</button>' +
        
        '<div class="notification-header">' +
            '<div class="notification-icon">' +
                '<i class="fas fa-check"></i>' +
            '</div>' +
            '<div class="notification-content">' +
                '<h3>' + title + '</h3>' +
                '<p>' + message + '</p>' +
            '</div>' +
        '</div>' +
        
        actionsHtml;
    
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 6 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 400);
        }
    }, 6000);
    
    return notification;
}

// Show error notification
export function showErrorNotification(title, message) {
    initNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
    notification.style.pointerEvents = 'auto';
    
    notification.innerHTML = 
        '<button class="notification-close" onclick="this.parentElement.remove()">' +
            '<i class="fas fa-times"></i>' +
        '</button>' +
        
        '<div class="notification-header">' +
            '<div class="notification-icon">' +
                '<i class="fas fa-exclamation-triangle"></i>' +
            '</div>' +
            '<div class="notification-content">' +
                '<h3>' + title + '</h3>' +
                '<p>' + message + '</p>' +
            '</div>' +
        '</div>' +
        
        '<div class="notification-actions">' +
            '<button class="notification-btn" onclick="this.parentElement.parentElement.remove()">' +
                '<i class="fas fa-times"></i> סגור' +
            '</button>' +
        '</div>';
    
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 400);
        }
    }, 5000);
    
    return notification;
}

// Show warning notification (for validation errors)
export function showWarningNotification(message) {
    initNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
    notification.style.pointerEvents = 'auto';
    
    notification.innerHTML = 
        '<button class="notification-close" onclick="this.parentElement.remove()">' +
            '<i class="fas fa-times"></i>' +
        '</button>' +
        
        '<div class="notification-header">' +
            '<div class="notification-icon">' +
                '<i class="fas fa-exclamation-circle"></i>' +
            '</div>' +
            '<div class="notification-content">' +
                '<h3>שים לב</h3>' +
                '<p>' + message + '</p>' +
            '</div>' +
        '</div>';
    
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 400);
        }
    }, 4000);
    
    return notification;
}

// Show simple success notification
export function showSimpleSuccessNotification(message) {
    initNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
    notification.style.pointerEvents = 'auto';
    
    notification.innerHTML = 
        '<button class="notification-close" onclick="this.parentElement.remove()">' +
            '<i class="fas fa-times"></i>' +
        '</button>' +
        
        '<div class="notification-header">' +
            '<div class="notification-icon">' +
                '<i class="fas fa-check-circle"></i>' +
            '</div>' +
            '<div class="notification-content">' +
                '<h3>מעולה!</h3>' +
                '<p>' + message + '</p>' +
            '</div>' +
        '</div>';
    
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 400);
        }
    }, 3000);
    
    return notification;
}

// Show info notification (blue)
export function showInfoNotification(title, message) {
    initNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
    notification.style.pointerEvents = 'auto';
    
    notification.innerHTML = 
        '<button class="notification-close" onclick="this.parentElement.remove()">' +
            '<i class="fas fa-times"></i>' +
        '</button>' +
        
        '<div class="notification-header">' +
            '<div class="notification-icon">' +
                '<i class="fas fa-info-circle"></i>' +
            '</div>' +
            '<div class="notification-content">' +
                '<h3>' + title + '</h3>' +
                '<p>' + message + '</p>' +
            '</div>' +
        '</div>';
    
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 400);
        }
    }, 4000);
    
    return notification;
}

// Helper function for "start designing" button
window.startDesigning = function() {
    // Remove notification
    const notification = document.querySelector('.success-notification');
    if (notification) {
        notification.remove();
    }
    
    // If we're not on the order page, navigate there
    if (!window.location.pathname.includes('/order') && !window.location.pathname.includes('order-form.html')) {
        window.location.href = '/order';
    } else {
        // If already on order page, scroll to form and highlight first step
        const firstStep = document.getElementById('step1');
        if (firstStep) {
            firstStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a gentle highlight effect
            firstStep.style.animation = 'pulse 2s ease-in-out';
            setTimeout(() => {
                firstStep.style.animation = '';
            }, 2000);
        }
    }
};

// Add pulse animation to CSS dynamically
const style = document.createElement('style');
style.textContent = 
    '@keyframes pulse {' +
        '0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }' +
        '50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(102, 126, 234, 0.1); }' +
        '100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }' +
    '}';
document.head.appendChild(style);
