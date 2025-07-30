// Firebase Authentication Service for React
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Try to import Firebase config with fallback
let auth, googleProvider;
try {
  const firebaseModule = await import('./firebase-config');
  auth = firebaseModule.auth;
  googleProvider = firebaseModule.googleProvider;
} catch (error) {
  console.warn('⚠️ Firebase not available, using mock auth service');
  auth = null;
  googleProvider = null;
}

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.isInitialized = false;
    this.initPromise = this.initialize();
  }

  // Initialize authentication state
  async initialize() {
    return new Promise((resolve) => {
      // Check localStorage for immediate UI update
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
          console.log('🔄 Restored user from localStorage:', this.currentUser);
        } catch (error) {
          console.error('❌ Error parsing stored user:', error);
          localStorage.removeItem('currentUser');
        }
      }

      // Set up auth state listener
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
          
          // Store in localStorage for persistence
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          console.log('✅ User signed in:', this.currentUser);
        } else {
          // User is signed out
          this.currentUser = null;
          localStorage.removeItem('currentUser');
          console.log('👋 User signed out');
        }

        this.isInitialized = true;
        this.notifyListeners();
        
        if (!this.isInitialized) {
          resolve();
        }
      });
    });
  }

  // Sign in with Google (popup method)
  async signInWithGoogle(useRedirect = false) {
    try {
      console.log('🚀 Starting Google sign-in...', useRedirect ? 'with redirect' : 'with popup');
      
      if (useRedirect) {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, redirect: true };
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log('✅ Google sign-in successful:', user);
        
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
      console.error('❌ Google sign-in error:', error);
      
      let errorMessage = 'אירעה שגיאה בהתחברות';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'חלון ההתחברות נסגר על ידי המשתמש';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'חלון ההתחברות נחסם על ידי הדפדפן - נסה שוב';
          // Try redirect as fallback
          if (!useRedirect) {
            console.log('🔄 Popup blocked, trying redirect...');
            return await this.signInWithGoogle(true);
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
  async signOut() {
    try {
      console.log('👋 Signing out...');
      await signOut(auth);
      console.log('✅ Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return {
        success: false,
        error: 'אירעה שגיאה בהתנתקות'
      };
    }
  }

  // Check if user is logged in
  isUserLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Add auth state listener
  addListener(callback) {
    this.listeners.push(callback);
    
    // Call immediately if already initialized
    if (this.isInitialized) {
      callback(this.currentUser, this.isUserLoggedIn());
    }
  }

  // Remove auth state listener
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentUser, this.isUserLoggedIn());
      } catch (error) {
        console.error('❌ Error in auth state listener:', error);
      }
    });
  }

  // Wait for auth initialization
  async waitForInit() {
    return this.initPromise;
  }

  // Check for redirect result (call on app load)
  async checkRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('✅ Redirect sign-in successful:', result.user);
        return result;
      }
    } catch (error) {
      console.error('❌ Redirect result error:', error);
      return null;
    }
  }
}

// Create and export singleton instance
export const authService = new AuthService();

// Export convenience functions
export const getCurrentUser = () => authService.getCurrentUser();
export const isUserLoggedIn = () => authService.isUserLoggedIn();
export const addAuthStateListener = (callback) => authService.addListener(callback);
export const removeAuthStateListener = (callback) => authService.removeListener(callback);
export const waitForAuthInit = () => authService.waitForInit();

export default authService;
