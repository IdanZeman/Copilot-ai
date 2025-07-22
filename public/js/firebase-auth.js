// Firebase Authentication Service
import { auth, provider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from './firebase-config.js';

let currentUser = null;
let authStateListeners = [];

// Check for redirect result when page loads
window.addEventListener('load', async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            console.log('Redirect sign-in successful:', result.user);
        }
    } catch (error) {
        console.error('Redirect result error:', error);
    }
});

// Authentication state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            loginTime: new Date().toISOString()
        };
        
        // Save to localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        console.log('User signed in:', currentUser);
        
        // Notify all listeners
        authStateListeners.forEach(listener => listener(currentUser, true));
        
    } else {
        // User is signed out
        currentUser = null;
        localStorage.removeItem('currentUser');
        
        console.log('User signed out');
        
        // Notify all listeners
        authStateListeners.forEach(listener => listener(null, false));
    }
});

// Add auth state change listener
export function addAuthStateListener(callback) {
    authStateListeners.push(callback);
    
    // Immediately call with current state
    if (currentUser) {
        callback(currentUser, true);
    } else {
        callback(null, false);
    }
}

// Remove auth state change listener
export function removeAuthStateListener(callback) {
    const index = authStateListeners.indexOf(callback);
    if (index > -1) {
        authStateListeners.splice(index, 1);
    }
}

// Sign in with Google
export async function signInWithGoogle(useRedirect = false) {
    try {
        console.log('Starting Google sign-in...', useRedirect ? 'with redirect' : 'with popup');
        
        if (useRedirect) {
            // Use redirect method - this will reload the page
            await signInWithRedirect(auth, provider);
            return { success: true, redirect: true };
        } else {
            // Try popup first
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            console.log('Google sign-in successful:', user);
            
            // User info is automatically updated via onAuthStateChanged
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }
            };
        }
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        
        let errorMessage = 'אירעה שגיאה בהתחברות';
        
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'חלון ההתחברות נסגר על ידי המשתמש';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'חלון ההתחברות נחסם על ידי הדפדפן - נסה שוב';
                // Try redirect as fallback for popup blocked
                if (!useRedirect) {
                    console.log('Popup blocked, trying redirect...');
                    return await signInWithGoogle(true);
                }
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'בקשת ההתחברות בוטלה';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'שגיאת רשת - אנא בדוק את החיבור לאינטרנט';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'יותר מדי ניסיונות התחברות - אנא נסה שוב מאוחר יותר';
                break;
            default:
                errorMessage = `שגיאה: ${error.message}`;
        }
        
        return {
            success: false,
            error: errorMessage,
            code: error.code
        };
    }
}

// Sign out
export async function signOutUser() {
    try {
        console.log('Signing out...');
        await signOut(auth);
        console.log('Sign out successful');
        return { success: true };
        
    } catch (error) {
        console.error('Sign out error:', error);
        return {
            success: false,
            error: 'אירעה שגיאה בהתנתקות'
        };
    }
}

// Check if user is logged in
export function isUserLoggedIn() {
    return currentUser !== null;
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Initialize Firebase Auth (call this when app loads)
export function initFirebaseAuth() {
    // Check localStorage for existing user (for immediate UI update)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('Restored user from localStorage:', currentUser);
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('currentUser');
        }
    }
    
    console.log('Firebase Auth initialized');
}
