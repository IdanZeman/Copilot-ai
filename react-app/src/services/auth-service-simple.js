// Simplified Auth Service for React (without Firebase initially)

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.isInitialized = false;
    this.isFirebaseEnabled = false;
    this.initPromise = this.initialize();
  }

  // Initialize authentication state
  async initialize() {
    return new Promise((resolve) => {
      console.log('🔄 Initializing Auth Service...');
      
      // Try to load Firebase later
      this.tryInitFirebase();
      
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

      this.isInitialized = true;
      this.notifyListeners();
      resolve();
    });
  }

  // Try to initialize Firebase asynchronously
  async tryInitFirebase() {
    try {
      console.log('🔥 Attempting to load Firebase...');
      const firebaseModule = await import('./firebase-config');
      
      // Firebase imports
      const { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } = await import('firebase/auth');
      
      this.auth = firebaseModule.auth;
      this.googleProvider = firebaseModule.googleProvider;
      this.isFirebaseEnabled = true;
      
      // Set up auth state listener if Firebase is available
      if (this.auth) {
        onAuthStateChanged(this.auth, (user) => {
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

          this.notifyListeners();
        });
      }
      
      console.log('✅ Firebase loaded successfully');
    } catch (error) {
      console.warn('⚠️ Firebase not available, using mock auth service:', error.message);
      this.isFirebaseEnabled = false;
    }
  }

  // Sign in with Google (real or mock)
  async signInWithGoogle(useRedirect = false) {
    if (this.isFirebaseEnabled && this.auth && this.googleProvider) {
      return this.signInWithFirebase(useRedirect);
    } else {
      return this.signInMock();
    }
  }

  // Real Firebase sign-in
  async signInWithFirebase(useRedirect = false) {
    try {
      console.log('🚀 Starting Google sign-in...', useRedirect ? 'with redirect' : 'with popup');
      
      const { signInWithPopup, signInWithRedirect } = await import('firebase/auth');
      
      if (useRedirect) {
        await signInWithRedirect(this.auth, this.googleProvider);
        return { success: true, redirect: true };
      } else {
        const result = await signInWithPopup(this.auth, this.googleProvider);
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

  // Mock sign-in for development
  async signInMock() {
    console.log('🎭 Using mock sign-in');
    
    const mockUser = {
      id: 'mock-user-123',
      uid: 'mock-user-123',
      email: 'demo@example.com',
      displayName: 'משתמש דמו',
      name: 'משתמש דמו',
      photoURL: 'https://via.placeholder.com/40x40/4f46e5/ffffff?text=DU',
      emailVerified: true,
      loginTime: new Date().toISOString()
    };

    this.currentUser = mockUser;
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    this.notifyListeners();

    return {
      success: true,
      user: mockUser
    };
  }

  // Sign out
  async signOut() {
    try {
      console.log('👋 Signing out...');
      
      if (this.isFirebaseEnabled && this.auth) {
        const { signOut } = await import('firebase/auth');
        await signOut(this.auth);
      }
      
      // Always clear local state
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      this.notifyListeners();
      
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
    if (this.isFirebaseEnabled && this.auth) {
      try {
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(this.auth);
        if (result) {
          console.log('✅ Redirect sign-in successful:', result.user);
          return result;
        }
      } catch (error) {
        console.error('❌ Redirect result error:', error);
        return null;
      }
    }
    return null;
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
