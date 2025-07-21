import { logoutUser, subscribeToAuth, signInWithGoogle, getCurrentUser } from './auth-service.js';

// ניהול מצב המשתמש
let currentUser = null;

// פונקציה להגדרת קישורי אימות
export function setupAuthLinks() {
    // הפונקציה הזו תפעל באופן אוטומטי כשהמודול נטען
    console.log('Auth links setup completed');
}

// האזנה לשינויים במצב ההתחברות
subscribeToAuth((user) => {
    currentUser = user;
    updateUIForAuthState(user);
});

// עדכון ממשק המשתמש בהתאם למצב ההתחברות
function updateUIForAuthState(user) {
    const userMenuTrigger = document.querySelector('.user-menu-trigger');
    const userMenuContent = document.querySelector('.user-menu-content');
    
    if (user) {
        // משתמש מחובר
        const firstName = user.displayName ? user.displayName.split(' ')[0] : user.email;
        userMenuContent.innerHTML = `
            <div class="user-info">
                <img src="${user.photoURL || '/images/default-avatar.png'}" alt="תמונת פרופיל" class="user-avatar">
                <span class="user-name">${firstName}</span>
            </div>
            <a href="#" class="user-menu-link logout-link">
                <i class="fas fa-sign-out-alt"></i>
                התנתק
            </a>
        `;
        
        // הוספת אירוע לכפתור ההתנתקות
        const logoutLink = userMenuContent.querySelector('.logout-link');
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await logoutUser();
                console.log('המשתמש התנתק בהצלחה');
            } catch (error) {
                console.error('שגיאה בהתנתקות:', error);
            }
        });
    } else {
        // משתמש לא מחובר
        userMenuContent.innerHTML = `
            <a href="#" class="user-menu-link login-link">
                <i class="fab fa-google"></i>
                התחבר עם Google
            </a>
        `;
        
        // הוספת אירוע לכפתור ההתחברות
        const loginLink = userMenuContent.querySelector('.login-link');
        loginLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signInWithGoogle();
                console.log('המשתמש התחבר בהצלחה');
            } catch (error) {
                console.error('שגיאה בהתחברות:', error);
            }
        });
    }
}

// טיפול בתפריט המשתמש
document.addEventListener('DOMContentLoaded', () => {
    const userMenuTrigger = document.querySelector('.user-menu-trigger');
    const userMenu = document.querySelector('.user-menu');

    if (userMenuTrigger && userMenu) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });

        // סגירת התפריט בלחיצה מחוץ לאזור התפריט
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target) && !userMenuTrigger.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }
});
