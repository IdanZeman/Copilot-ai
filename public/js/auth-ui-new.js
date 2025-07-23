// Simple and clean authentication UI management
import { 
    isUserLoggedIn, 
    getCurrentUser, 
    addAuthStateListener, 
    waitForAuthInit 
} from './auth-state.js';

import { signInWithGoogle, signOutUser } from './firebase-auth.js';
import { showLoginSuccessNotification, showErrorNotification } from './notifications.js';

// Setup authentication system
export async function setupAuthLinks() {
    console.log('Setting up auth links...');
    
    // Wait for auth to initialize
    await waitForAuthInit();
    
    // Add listener for auth state changes
    addAuthStateListener((user, isLoggedIn) => {
        updateUIForAuthState(user, isLoggedIn);
    });
    
    // Update initial UI state
    updateUIForAuthState(getCurrentUser(), isUserLoggedIn());
}

// Update UI based on authentication state
function updateUIForAuthState(user, isLoggedIn) {
    console.log('Updating UI for auth state:', { user: user?.displayName || user?.email, isLoggedIn });
    
    if (isLoggedIn && user) {
        showLoggedInState(user);
    } else {
        showLoggedOutState();
    }
    
    // Update form access if on order form page
    updateFormAccess(isLoggedIn);
}

// Show UI for logged in user
function showLoggedInState(user) {
    const displayName = user.displayName || user.name || user.email?.split('@')[0] || 'משתמש';
    
    // Update user menu headers
    const userMenuHeaders = document.querySelectorAll('.user-menu-header span');
    userMenuHeaders.forEach(header => {
        header.textContent = displayName;
    });
    
    // Hide login links, show logout links
    const loginLinks = document.querySelectorAll('.login-link');
    const logoutLinks = document.querySelectorAll('.logout-link');
    
    loginLinks.forEach(link => {
        link.style.display = 'none';
    });
    
    logoutLinks.forEach(link => {
        link.style.display = 'block';
        
        // Remove existing listeners and add new one
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogout(newLink);
        });
    });
}

// Show UI for logged out user
function showLoggedOutState() {
    // Show login links, hide logout links
    const loginLinks = document.querySelectorAll('.login-link');
    const logoutLinks = document.querySelectorAll('.logout-link');
    
    loginLinks.forEach(link => {
        link.style.display = 'block';
        
        // Remove existing listeners and add new one
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogin(newLink);
        });
    });
    
    logoutLinks.forEach(link => {
        link.style.display = 'none';
    });
    
    // Reset user menu headers
    const userMenuHeaders = document.querySelectorAll('.user-menu-header span');
    userMenuHeaders.forEach(header => {
        header.textContent = 'אזור אישי';
    });
}

// Handle login process
async function handleLogin(link) {
    const originalText = link.innerHTML;
    
    try {
        // Show loading state
        link.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מתחבר...';
        link.disabled = true;
        
        // Attempt sign in
        const result = await signInWithGoogle();
        
        if (result && result.success) {
            showLoginSuccessNotification(result.user);
        } else {
            throw new Error(result?.error || 'Login failed');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showErrorNotification('שגיאה בהתחברות', 'אנא נסה שוב מאוחר יותר');
    } finally {
        // Restore button state
        link.innerHTML = originalText;
        link.disabled = false;
    }
}

// Handle logout process
async function handleLogout(link) {
    const originalText = link.innerHTML;
    
    try {
        // Show loading state
        link.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מתנתק...';
        link.disabled = true;
        
        // Attempt sign out
        const result = await signOutUser();
        
        if (result && result.success === false) {
            throw new Error(result.error);
        }
        
        // Redirect if on protected page
        if (window.location.pathname.includes('/order') || window.location.pathname.includes('order-form.html')) {
            window.location.href = '../html/index.html';
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        showErrorNotification('שגיאה בהתנתקות', error.message || 'אנא נסה שוב');
    } finally {
        // Restore button state
        link.innerHTML = originalText;
        link.disabled = false;
    }
}

// Update form access based on auth state
function updateFormAccess(isLoggedIn) {
    if (window.location.pathname.includes('/order') || window.location.pathname.includes('order-form.html')) {
        if (isLoggedIn) {
            // Enable form for authenticated users
            if (window.enableFormForAuthenticatedUser) {
                window.enableFormForAuthenticatedUser();
            }
        } else {
            // Block form for guests
            if (window.blockFormForGuests) {
                window.blockFormForGuests();
            }
        }
    }
}

// Form blocking functions
export function blockFormForGuests() {
    const formSteps = document.querySelectorAll('.form-step');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Disable all form elements
    formSteps.forEach(step => {
        const inputs = step.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            input.disabled = true;
        });
    });
    
    // Disable navigation buttons
    if (nextBtn) nextBtn.disabled = true;
    if (prevBtn) prevBtn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    
    // Show auth required message
    showAuthRequiredMessage();
}

export function enableFormForAuthenticatedUser() {
    const formSteps = document.querySelectorAll('.form-step');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Enable all form elements
    formSteps.forEach(step => {
        const inputs = step.querySelectorAll('input, textarea, select, button');
        inputs.forEach(input => {
            input.disabled = false;
        });
    });
    
    // Enable navigation buttons
    if (nextBtn) nextBtn.disabled = false;
    if (prevBtn) prevBtn.disabled = false;
    if (submitBtn) submitBtn.disabled = false;
    
    // Hide auth required message
    hideAuthRequiredMessage();
}

// Show authentication required message
function showAuthRequiredMessage() {
    let authMessage = document.getElementById('auth-required-message');
    
    if (!authMessage) {
        authMessage = document.createElement('div');
        authMessage.id = 'auth-required-message';
        authMessage.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 10000;
                max-width: 400px;
                width: 90%;
            ">
                <i class="fas fa-lock" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 15px; color: #333;">נדרשת התחברות</h3>
                <p style="margin-bottom: 20px; color: #666;">כדי לבצע הזמנה, עליך להתחבר תחילה</p>
                <button class="btn btn-primary" onclick="document.querySelector('.login-link').click()" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    <i class="fab fa-google"></i> התחבר עם Google
                </button>
            </div>
        `;
        
        document.body.appendChild(authMessage);
    }
    
    authMessage.style.display = 'block';
}

// Hide authentication required message
function hideAuthRequiredMessage() {
    const authMessage = document.getElementById('auth-required-message');
    if (authMessage) {
        authMessage.style.display = 'none';
    }
}

// Check authentication requirement
export function requireAuthentication() {
    if (!isUserLoggedIn()) {
        blockFormForGuests();
        return false;
    }
    return true;
}

// Export the main functions
export { isUserLoggedIn, getCurrentUser };
