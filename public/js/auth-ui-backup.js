// Import Firebase auth functions and central auth state manager
import { 
    initFirebaseAuth, 
    signInWithGoogle, 
    signOutUser
} from './firebase-auth.js';

import { 
    isUserLoggedIn, 
    getCurrentUser, 
    addAuthStateListener, 
    waitForAuthInit,
    refreshAuthUI 
} from './auth-state.js';

// Import notification system
import { showLoginSuccessNotification, showErrorNotification, showWarningNotification } from './notifications.js';

// Initialize Firebase when module loads
initFirebaseAuth();

// Export the auth state functions
export { isUserLoggedIn, getCurrentUser, addAuthStateListener, waitForAuthInit, refreshAuthUI };

// Login user (removed - Firebase handles this automatically)
export function loginUser(userData) {
    // This function is no longer needed as Firebase handles login state
    console.log('loginUser called but Firebase handles authentication automatically');
    return true;
}

// Logout user (use Firebase function)
export async function logoutUser() {
    const result = await signOutUser();
    if (result.success) {
        updateUIForLoggedOutUser();
    } else {
        showErrorNotification('שגיאה בהתנתקות', result.error);
    }
}

// Update UI based on login status
function updateUIForLoggedInUser() {
    const user = firebaseGetCurrentUser();
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'משתמש';
    
    const userMenuHeaders = document.querySelectorAll('.user-menu-header span');
    userMenuHeaders.forEach(header => {
        header.textContent = displayName;
    });
    
    const loginLinks = document.querySelectorAll('.login-link');
    const logoutLinks = document.querySelectorAll('.logout-link');
    
    loginLinks.forEach(link => {
        link.style.display = 'none';
    });
    
    logoutLinks.forEach(link => {
        link.style.display = 'block';
        link.onclick = async (e) => {
            e.preventDefault();
            await logoutUser();
            // Redirect to home if on order form
            if (window.location.pathname.includes('/order') || window.location.pathname.includes('order-form.html')) {
                window.location.href = '/';
            }
        };
    });
}

function updateUIForLoggedOutUser() {
    const userMenuHeaders = document.querySelectorAll('.user-menu-header span');
    userMenuHeaders.forEach(header => {
        header.textContent = 'אורח';
    });
    
    const loginLinks = document.querySelectorAll('.login-link');
    const logoutLinks = document.querySelectorAll('.logout-link');
    
    loginLinks.forEach(link => {
        link.style.display = 'block';
        link.onclick = (e) => {
            e.preventDefault();
            showLoginModal();
        };
    });
    
    logoutLinks.forEach(link => {
        link.style.display = 'none';
    });
}

// Check authentication for protected pages
export function requireAuthentication() {
    if (!isUserLoggedIn()) {
        // Show login modal immediately
        showLoginModal();
        
        // Disable form interaction
        const formContainer = document.querySelector('.form-container, .order-form');
        if (formContainer) {
            formContainer.style.pointerEvents = 'none';
            formContainer.style.opacity = '0.5';
            
            // Add overlay message
            const overlay = document.createElement('div');
            overlay.className = 'auth-required-overlay';
            overlay.innerHTML = `
                <div class="auth-required-message">
                    <i class="fas fa-lock"></i>
                    <h3>נדרשת התחברות</h3>
                    <p>כדי להתחיל לעצב חולצה, אנא התחבר למערכת</p>
                    <button class="btn btn-primary" onclick="document.querySelector('.login-link').click()">
                        התחבר עכשיו
                    </button>
                </div>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            overlay.querySelector('.auth-required-message').style.cssText = `
                background: white;
                padding: 2rem;
                border-radius: 10px;
                text-align: center;
                max-width: 400px;
                margin: 1rem;
            `;
            document.body.appendChild(overlay);
        }
        
        return false;
    }
    
    // Enable form if user is logged in
    const formContainer = document.querySelector('.form-container, .order-form');
    if (formContainer) {
        formContainer.style.pointerEvents = 'auto';
        formContainer.style.opacity = '1';
    }
    
    // Remove auth overlay if exists
    const existingOverlay = document.querySelector('.auth-required-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    return true;
}

// Auth UI functionality
export function setupAuthLinks() {
    console.log('Setting up auth links...');
    
    // Setup auth state listener
    authStateCallback = (user, isLoggedIn) => {
        currentUser = user;
        console.log('Auth state changed:', { user, isLoggedIn });
        
        if (isLoggedIn) {
            updateUIForLoggedInUser();
            
            // Enable form if on order form page
            if (window.location.pathname.includes('/order') || window.location.pathname.includes('order-form.html')) {
                // Enable the form first
                if (window.enableFormForAuthenticatedUser) {
                    window.enableFormForAuthenticatedUser();
                }
                
                // Then reinitialize the form functionality
                setTimeout(() => {
                    // Show the first step
                    if (window.showStep) {
                        window.showStep(1);
                    }
                    
                    // Re-setup navigation buttons if they exist
                    const nextBtn = document.getElementById('nextBtn');
                    const prevBtn = document.getElementById('prevBtn');
                    const submitBtn = document.getElementById('submitBtn');
                    
                    if (nextBtn && !nextBtn.hasAttribute('data-listener-added')) {
                        nextBtn.addEventListener('click', window.nextStep);
                        nextBtn.setAttribute('data-listener-added', 'true');
                    }
                    
                    if (prevBtn && !prevBtn.hasAttribute('data-listener-added')) {
                        prevBtn.addEventListener('click', window.prevStep);
                        prevBtn.setAttribute('data-listener-added', 'true');
                    }
                    
                    if (submitBtn && !submitBtn.hasAttribute('data-listener-added')) {
                        submitBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            window.submitForm();
                        });
                        submitBtn.setAttribute('data-listener-added', 'true');
                    }
                }, 100);
            }
        } else {
            updateUIForLoggedOutUser();
        }
    };
    
    // Add auth state listener
    addAuthStateListener(authStateCallback);
    
    // Check initial login status and update UI
    if (firebaseIsLoggedIn()) {
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
    
    // Setup login/logout links
    const loginLinks = document.querySelectorAll('.login-link');
    const logoutLinks = document.querySelectorAll('.logout-link');
    
    if (isUserLoggedIn()) {
        loginLinks.forEach(link => {
            link.style.display = 'none';
        });
        logoutLinks.forEach(link => {
            link.style.display = 'block';
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Logout clicked');
                
                // Show loading state
                const originalText = link.innerHTML;
                link.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מתנתק...';
                
                const result = await logoutUser();
                
                if (result && result.success === false) {
                    showErrorNotification('שגיאה בהתנתקות', result.error);
                }
                
                // Redirect to home if on order form
                if (window.location.pathname.includes('/order') || window.location.pathname.includes('order-form.html')) {
                    window.location.href = '/';
                }
                
                // Reset link text
                link.innerHTML = originalText;
            });
        });
    } else {
        loginLinks.forEach(link => {
            link.style.display = 'block';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginModal();
            });
        });
        logoutLinks.forEach(link => {
            link.style.display = 'none';
        });
    }
    
    // Setup modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            hideAllModals();
        });
    });
    
    // Setup modal backdrop clicks
    const modals = document.querySelectorAll('.auth-modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideAllModals();
            }
        });
    });
}

function showLoginModal() {
    const template = document.getElementById('login-modal-template');
    if (!template) {
        console.error('Login modal template not found');
        // Try to load the modals first
        fetch('../html/auth-modals.html')
            .then(response => response.text())
            .then(html => {
                const container = document.getElementById('auth-modals-container');
                if (container) {
                    container.innerHTML = html;
                    // Try again after loading
                    setTimeout(() => showLoginModal(), 100);
                }
            })
            .catch(error => {
                console.error('Error loading auth modals:', error);
                // Fallback: direct sign in
                directSignIn();
            });
        return;
    }
    
    const modal = template.content.cloneNode(true);
    const authContainer = document.getElementById('auth-modals-container');
    
    // Clear existing modals
    authContainer.innerHTML = '';
    
    // Add new modal
    authContainer.appendChild(modal);
    
    // Show the modal
    const modalElement = authContainer.querySelector('.auth-modal');
    if (modalElement) {
        modalElement.style.display = 'flex';
        
        // Re-setup event listeners for the new modal
        setupModalEvents(modalElement);
    }
}

// Fallback direct sign in
async function directSignIn() {
    try {
        const { signInWithPopup, provider } = await import('./firebase-config.js');
        const result = await signInWithPopup(auth, provider);
        console.log('User signed in:', result.user);
    } catch (error) {
        console.error('Sign in error:', error);
        alert('שגיאה בהתחברות. אנא נסה שוב.');
    }
}

function setupModalEvents(modal) {
    // Close button
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideAllModals();
        });
    }
    
    // Google login button
    const googleBtn = modal.querySelector('#google-login');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            console.log('Google login clicked');
            
            // Show loading state
            googleBtn.disabled = true;
            googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מתחבר...';
            
            try {
                // Use Firebase to sign in with Google
                const result = await signInWithGoogle();
                
                if (result.success) {
                    if (result.redirect) {
                        // Redirect method - page will reload
                        console.log('Redirecting for authentication...');
                        return;
                    }
                    
                    console.log('Firebase login successful:', result.user);
                    
                    // Hide modal
                    hideAllModals();
                    
                    // Remove auth overlay if it exists
                    const authOverlay = document.querySelector('.auth-required-overlay');
                    if (authOverlay) {
                        authOverlay.remove();
                    }
                    
                    // Show beautiful success notification
                    setTimeout(() => {
                        showLoginSuccessNotification(result.user);
                    }, 200);
                    
                    // Update usage badge after successful login
                    setTimeout(async () => {
                        if (window.updateUsageBadge) {
                            try {
                                await window.updateUsageBadge();
                            } catch (error) {
                                console.error('Error updating usage badge after login:', error);
                            }
                        }
                    }, 500);
                    
                } else {
                    // Show error message
                    if (result.code === 'auth/popup-blocked') {
                        // Special handling for popup blocked - offer redirect option
                        const useRedirect = confirm(
                            'חלון ההתחברות נחסם. האם תרצה לנסות התחברות דרך הפניה לדף Google?\n' +
                            '(הדף יטען מחדש אחרי ההתחברות)'
                        );
                        if (useRedirect) {
                            const redirectResult = await signInWithGoogle(true);
                            if (redirectResult.redirect) {
                                return; // Page will redirect
                            }
                        }
                    } else {
                        showErrorNotification('שגיאה בהתחברות', result.error);
                    }
                }
                
            } catch (error) {
                console.error('Login error:', error);
                showErrorNotification('שגיאה בהתחברות', 'אירעה שגיאה בהתחברות. אנא נסה שוב.');
            }
            
            // Reset button state
            googleBtn.disabled = false;
            googleBtn.innerHTML = '<i class="fab fa-google"></i> התחבר עם Google';
        });
    }
    
    // Modal backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideAllModals();
        }
    });
}

function hideAllModals() {
    const authContainer = document.getElementById('auth-modals-container');
    if (authContainer) {
        authContainer.innerHTML = '';
    }
}

// User menu functionality
export function setupUserMenu() {
    const userMenuTrigger = document.querySelector('.user-menu-trigger');
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenuTrigger && userMenu) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            userMenu.classList.remove('active');
        });
        
        // Prevent menu from closing when clicking inside it
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Initialize auth functionality
export function initAuth() {
    setupAuthLinks();
    setupUserMenu();
}

// Cleanup function
export function cleanupAuth() {
    if (authStateCallback) {
        removeAuthStateListener(authStateCallback);
        authStateCallback = null;
    }
}

// Add cleanup on page unload
window.addEventListener('beforeunload', cleanupAuth);
