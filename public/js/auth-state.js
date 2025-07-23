// Central authentication state manager
import { auth, onAuthStateChanged } from './firebase-config.js';

class AuthStateManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.listeners = [];
        this.initPromise = this.initialize();
    }

    // Initialize authentication state
    async initialize() {
        return new Promise((resolve) => {
            // Check localStorage first for immediate UI update
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                    console.log('Restored user from localStorage:', this.currentUser);
                } catch (error) {
                    console.error('Error parsing stored user:', error);
                    localStorage.removeItem('currentUser');
                }
            }

            // Listen to auth state changes
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    // User is signed in
                    this.currentUser = {
                        id: user.uid,
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        name: user.displayName,
                        photoURL: user.photoURL,
                        emailVerified: user.emailVerified,
                        loginTime: new Date().toISOString()
                    };
                    
                    // Save to localStorage
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    
                    console.log('User signed in:', this.currentUser);
                } else {
                    // User is signed out
                    this.currentUser = null;
                    localStorage.removeItem('currentUser');
                    
                    console.log('User signed out');
                }

                this.isInitialized = true;
                
                // Notify all listeners
                this.notifyListeners();
                
                // Resolve the promise on first call
                if (!this.initPromise.resolved) {
                    this.initPromise.resolved = true;
                    resolve();
                }
            });
        });
    }

    // Wait for initialization to complete
    async waitForInit() {
        await this.initPromise;
    }

    // Check if user is logged in
    isUserLoggedIn() {
        return !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Add listener for auth state changes
    addListener(callback) {
        this.listeners.push(callback);
        
        // Call immediately if already initialized
        if (this.isInitialized) {
            callback(this.currentUser, this.isUserLoggedIn());
        }
    }

    // Remove listener
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Notify all listeners of state change
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.currentUser, this.isUserLoggedIn());
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
    }

    // Force refresh of UI state
    refreshUI() {
        this.notifyListeners();
    }
}

// Create singleton instance
const authStateManager = new AuthStateManager();

// Export functions for backward compatibility
export function isUserLoggedIn() {
    return authStateManager.isUserLoggedIn();
}

export function getCurrentUser() {
    return authStateManager.getCurrentUser();
}

export function addAuthStateListener(callback) {
    authStateManager.addListener(callback);
}

export function removeAuthStateListener(callback) {
    authStateManager.removeListener(callback);
}

export function waitForAuthInit() {
    return authStateManager.waitForInit();
}

export function refreshAuthUI() {
    authStateManager.refreshUI();
}

// Export the manager instance
export { authStateManager };

// Initialize on module load
console.log('Auth state manager initialized');
