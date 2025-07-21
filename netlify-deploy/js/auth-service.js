// Mock authentication service for development
let mockUser = null;
const authCallbacks = [];

// התחברות עם Google (מדומה)
export async function signInWithGoogle() {
    try {
        // מדמה התחברות עם Google
        mockUser = {
            uid: 'mock-user-id',
            displayName: 'משתמש דמו',
            email: 'demo@example.com',
            photoURL: null
        };
        
        // מפעיל את כל ה-callbacks
        authCallbacks.forEach(callback => callback(mockUser));
        
        console.log('התחברות מדומה בוצעה בהצלחה');
        return mockUser;
    } catch (error) {
        console.error('שגיאה בהתחברות:', error);
        throw error;
    }
}

// התנתקות (מדומה)
export async function logoutUser() {
    try {
        mockUser = null;
        
        // מפעיל את כל ה-callbacks
        authCallbacks.forEach(callback => callback(null));
        
        console.log('התנתקות מדומה בוצעה בהצלחה');
    } catch (error) {
        console.error('שגיאה בהתנתקות:', error);
        throw error;
    }
}

// האזנה לשינויים במצב ההתחברות (מדומה)
export function subscribeToAuth(callback) {
    authCallbacks.push(callback);
    
    // מפעיל את ה-callback מיד עם המצב הנוכחי
    callback(mockUser);
    
    // מחזיר פונקציה לביטול המנוי
    return () => {
        const index = authCallbacks.indexOf(callback);
        if (index > -1) {
            authCallbacks.splice(index, 1);
        }
    };
}

// קבלת המשתמש הנוכחי (מדומה)
export function getCurrentUser() {
    return mockUser;
}
