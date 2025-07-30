// Authentication Context for React App
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth-service-simple';
import { useNotifications } from './NotificationContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('🔐 AuthProvider rendering')
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { showSuccess, showError } = useNotifications();

  console.log('🔐 AuthProvider state:', { user: user?.email, isLoading, isLoggedIn })

  useEffect(() => {
    // Initialize auth service and listen for changes
    const initAuth = async () => {
      await authService.waitForInit();
      
      // Set initial state
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoggedIn(authService.isUserLoggedIn());
      setIsLoading(false);
      
      // Add listener for auth state changes
      const unsubscribe = authService.addListener((user, isLoggedIn) => {
        setUser(user);
        setIsLoggedIn(isLoggedIn);
        setIsLoading(false);
      });

      return () => {
        authService.removeListener(unsubscribe);
      };
    };

    initAuth();

    // Check for redirect result on app load
    authService.checkRedirectResult();
  }, []);

  const signIn = async (useRedirect = false) => {
    try {
      setIsLoading(true);
      const result = await authService.signInWithGoogle(useRedirect);
      
      if (result.success && !result.redirect) {
        showSuccess('התחברת בהצלחה!', `ברוך הבא ${result.user.displayName || result.user.email}`);
      }
      
      return result;
    } catch (error) {
      showError('שגיאה בהתחברות', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const result = await authService.signOut();
      
      if (result.success) {
        showSuccess('התנתקת בהצלחה', 'להתראות!');
      }
      
      return result;
    } catch (error) {
      showError('שגיאה בהתנתקות', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const requireAuth = () => {
    if (!isLoggedIn) {
      showError('נדרשת התחברות', 'כדי לבצע פעולה זו, עליך להתחבר תחילה');
      return false;
    }
    return true;
  };

  const value = {
    user,
    isLoggedIn,
    isLoading,
    signIn,
    signOut,
    requireAuth,
    // Convenience getters
    userId: user?.uid || user?.id,
    userEmail: user?.email,
    userName: user?.displayName || user?.name || user?.email?.split('@')[0],
    userPhoto: user?.photoURL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
