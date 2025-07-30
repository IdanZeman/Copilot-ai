// Login Component for React App
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const LoginButton = ({ className = '', size = 'md', variant = 'primary', children, ...props }) => {
  const { signIn, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    google: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm'
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  const isButtonLoading = isLoading || isSigningIn;

  return (
    <button
      onClick={handleSignIn}
      disabled={isButtonLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-medium rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {isButtonLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          מתחבר...
        </>
      ) : (
        <>
          {variant === 'google' && (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {children || (variant === 'google' ? 'התחבר עם Google' : 'התחבר')}
        </>
      )}
    </button>
  );
};

const LogoutButton = ({ className = '', size = 'md', variant = 'secondary', children, ...props }) => {
  const { signOut, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  const isButtonLoading = isLoading || isSigningOut;

  return (
    <button
      onClick={handleSignOut}
      disabled={isButtonLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-medium rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {isButtonLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          מתנתק...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
          {children || 'התנתק'}
        </>
      )}
    </button>
  );
};

const UserProfile = ({ className = '', showPhoto = true, showEmail = false }) => {
  const { user, userName, userEmail, userPhoto } = useAuth();

  if (!user) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showPhoto && userPhoto && (
        <img
          src={userPhoto}
          alt={userName}
          className="w-8 h-8 rounded-full border-2 border-gray-200"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {userName}
        </span>
        {showEmail && (
          <span className="text-xs text-gray-500">
            {userEmail}
          </span>
        )}
      </div>
    </div>
  );
};

const AuthRequiredModal = ({ isOpen, onClose, title = "נדרשת התחברות", message = "כדי לבצע פעולה זו, עליך להתחבר תחילה" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <div className="flex gap-3 justify-center">
            <LoginButton variant="google" size="lg">
              התחבר עם Google
            </LoginButton>
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export all components
export {
  LoginButton,
  LogoutButton,
  UserProfile,
  AuthRequiredModal
};

export default LoginButton;
