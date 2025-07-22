// User menu functionality with usage statistics
import { auth } from './firebase-config.js';
import { showInfoNotification } from './notifications.js';

console.log('User menu loaded successfully');

// User Menu Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user menu
    initUserMenu();
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        const userMenuTrigger = document.querySelector('.user-menu-trigger');
        
        if (userMenu && !userMenu.contains(event.target) && !userMenuTrigger.contains(event.target)) {
            userMenu.style.opacity = '0';
            userMenu.style.visibility = 'hidden';
            userMenu.style.transform = 'translateY(10px)';
            
            // Reset after transition
            setTimeout(() => {
                if (!userMenuTrigger.matches(':hover')) {
                    userMenu.style = '';
                }
            }, 300);
        }
    });
});

// Initialize user menu
export function initUserMenu() {
    console.log('Initializing user menu');
    
    const userMenuContainer = document.querySelector('.user-menu .user-menu-content');
    if (!userMenuContainer) {
        console.log('User menu container not found, trying alternative selector');
        const altContainer = document.querySelector('.user-menu');
        if (!altContainer) {
            console.log('User menu not found at all');
            return;
        }
        // Create content div if it doesn't exist
        let contentDiv = altContainer.querySelector('.user-menu-content');
        if (!contentDiv) {
            contentDiv = document.createElement('div');
            contentDiv.className = 'user-menu-content';
            altContainer.appendChild(contentDiv);
        }
        addUsageStatsButton(contentDiv);
    } else {
        addUsageStatsButton(userMenuContainer);
    }
    
    // Update usage badge on initialization
    updateUsageBadge();
}

// Add usage statistics button to user menu
function addUsageStatsButton(userMenuContainer = null) {
    if (!userMenuContainer) {
        userMenuContainer = document.querySelector('.user-menu .user-menu-content');
        if (!userMenuContainer) {
            console.log('Cannot find user menu container');
            return;
        }
    }

    // Check if button already exists
    if (document.getElementById('usage-stats-btn')) {
        console.log('Usage stats button already exists');
        return;
    }

    // Create the usage stats button
    const usageStatsBtn = document.createElement('a');
    usageStatsBtn.id = 'usage-stats-btn';
    usageStatsBtn.className = 'user-menu-link';
    usageStatsBtn.href = '#';
    usageStatsBtn.innerHTML = `
        <i class="fas fa-chart-bar"></i>
        סטטיסטיקות שימוש
        <span id="usage-badge" class="usage-badge">0/10</span>
    `;

    // Add styles for the button and badge
    usageStatsBtn.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 15px;
        text-decoration: none;
        color: #333;
        border-radius: 8px;
        transition: background-color 0.3s ease;
    `;

        // Badge styles
        const badgeStyles = `
            .usage-badge {
                background: #3498db;
                color: white;
                font-size: 12px;
                font-weight: bold;
                padding: 4px 8px;
                border-radius: 12px;
                min-width: 40px;
                text-align: center;
                margin-left: auto;
                transition: all 0.3s ease;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.3);
            }
            .usage-badge.warning {
                background: #f39c12;
                border: 1px solid rgba(255,255,255,0.4);
            }
            .usage-badge.danger {
                background: #e74c3c;
                border: 1px solid rgba(255,255,255,0.4);
            }
            .usage-badge.success {
                background: #27ae60;
                border: 1px solid rgba(255,255,255,0.4);
            }
            .user-menu-link:hover {
                background-color: #f8f9fa;
            }
        `;    // Add styles if not already added
    if (!document.querySelector('#usage-badge-styles')) {
        const style = document.createElement('style');
        style.id = 'usage-badge-styles';
        style.textContent = badgeStyles;
        document.head.appendChild(style);
    }

    // Add click event to show usage statistics
    usageStatsBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Usage stats button clicked');
        
        // Close user menu properly without breaking functionality
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            // Reset the menu state properly
            userMenu.style.opacity = '';
            userMenu.style.visibility = '';
            userMenu.style.transform = '';
            userMenu.style.display = 'none';
            
            // Re-enable menu after a short delay
            setTimeout(() => {
                userMenu.style.display = '';
            }, 100);
        }
        
        // Show usage info using dynamic import
        try {
            const { showUsageInfo } = await import('./usage-tracker.js');
            await showUsageInfo();
        } catch (error) {
            console.error('Error loading usage tracker:', error);
            showInfoNotification('שגיאה', 'לא ניתן לטעון נתוני השימוש');
        }
    });

    // Add the button to the user menu (before logout button)
    const logoutBtn = userMenuContainer.querySelector('.logout-link');
    const devModeBtn = userMenuContainer.querySelector('.dev-mode-toggle');
    
    if (logoutBtn) {
        userMenuContainer.insertBefore(usageStatsBtn, logoutBtn);
    } else {
        userMenuContainer.appendChild(usageStatsBtn);
    }
    
    // Show dev mode button for authenticated users
    if (devModeBtn) {
        devModeBtn.style.display = 'block';
        
        // Update button text based on current mode
        const devModeText = devModeBtn.querySelector('#dev-mode-text');
        if (devModeText) {
            const isDevMode = localStorage.getItem('development-mode') === 'true';
            devModeText.textContent = isDevMode ? 'כבה מצב פיתוח' : 'הפעל מצב פיתוח';
        }
    }

    console.log('Usage stats button added to user menu');
}

// Update usage badge with current stats
export async function updateUsageBadge() {
    const user = auth.currentUser;
    if (!user) {
        console.log('No user logged in, cannot update usage badge');
        return;
    }

    console.log('Updating usage badge for user:', user.uid);

    try {
        // Dynamic import to avoid circular dependencies
        const { getUsageStats } = await import('./usage-tracker.js');
        const stats = await getUsageStats();
        
        if (!stats) {
            console.log('No usage stats available');
            return;
        }

        const badge = document.getElementById('usage-badge');
        if (!badge) {
            console.log('Usage badge element not found');
            return;
        }

        // Update badge text
        const remaining = stats.daily.remaining;
        const used = stats.daily.used;
        const total = stats.daily.limit;
        
        badge.textContent = `${remaining}/${total}`;
        
        // Update badge color based on usage
        badge.className = 'usage-badge';
        
        if (remaining === 0) {
            badge.classList.add('danger');
        } else if (remaining <= 2) {
            badge.classList.add('warning');
        } else if (remaining >= 8) {
            badge.classList.add('success');
        }
        
        console.log(`Usage badge updated: ${remaining}/${total} (used: ${used})`);
        
    } catch (error) {
        console.error('Error updating usage badge:', error);
    }
}

// Make updateUsageBadge available globally for other modules
window.updateUsageBadge = updateUsageBadge;

// Export for other modules
export { updateUsageBadge as default };
