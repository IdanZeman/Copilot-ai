// Admin Service - Manages admin functionalities
import { auth } from './firebase-config';

class AdminService {
  constructor() {
    this.adminEmails = [
      'idanzeman@gmail.com'
    ];
  }

  /**
   * Check if current user is admin
   * @returns {boolean}
   */
  isCurrentUserAdmin() {
    if (!auth.currentUser) {
      return false;
    }

    const userEmail = auth.currentUser.email;
    return this.adminEmails.includes(userEmail?.toLowerCase());
  }

  /**
   * Get current user email
   * @returns {string|null}
   */
  getCurrentUserEmail() {
    return auth.currentUser?.email || null;
  }

  /**
   * Toggle dev mode
   * @param {boolean} enabled - Whether to enable dev mode
   * @returns {Promise<boolean>}
   */
  async setDevMode(enabled) {
    try {
      if (!this.isCurrentUserAdmin()) {
        console.warn('🚫 רק אדמין יכול לשנות מצב פיתוח');
        return false;
      }

      // Store in localStorage (in real app, this could be stored in database)
      const devModeOverride = enabled ? 'true' : 'false';
      localStorage.setItem('ADMIN_DEV_MODE_OVERRIDE', devModeOverride);
      
      // Also update the environment variable temporarily
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('VITE_DEV_MODE_OVERRIDE', devModeOverride);
      }

      console.log(`🔧 Admin ${enabled ? 'הפעיל' : 'כיבה'} את מצב הפיתוח`);
      return true;
    } catch (error) {
      console.error('❌ שגיאה בשינוי מצב פיתוח:', error);
      return false;
    }
  }

  /**
   * Get current dev mode status (including admin override)
   * @returns {boolean}
   */
  getDevModeStatus() {
    // First check admin override
    const adminOverride = localStorage.getItem('ADMIN_DEV_MODE_OVERRIDE');
    const envDevMode = import.meta.env.VITE_DEV_MODE === 'true';
    
    console.log('🔧 Admin Service Dev Mode Check:', {
      adminOverride,
      envDevMode,
      VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE
    });
    
    if (adminOverride !== null) {
      console.log('📋 Using admin override:', adminOverride === 'true');
      return adminOverride === 'true';
    }

    // Fall back to environment variable
    console.log('📋 Using environment variable:', envDevMode);
    return envDevMode;
  }

  /**
   * Check if dev mode is overridden by admin
   * @returns {boolean}
   */
  isDevModeOverridden() {
    return localStorage.getItem('ADMIN_DEV_MODE_OVERRIDE') !== null;
  }

  /**
   * Clear admin override and return to environment setting
   * @returns {boolean}
   */
  clearDevModeOverride() {
    if (!this.isCurrentUserAdmin()) {
      return false;
    }

    localStorage.removeItem('ADMIN_DEV_MODE_OVERRIDE');
    localStorage.removeItem('VITE_DEV_MODE_OVERRIDE');
    console.log('🔄 הוסר override אדמין, חזרה להגדרת סביבה');
    return true;
  }

  /**
   * Get admin panel data
   * @returns {Object}
   */
  getAdminPanelData() {
    return {
      isAdmin: this.isCurrentUserAdmin(),
      currentUser: this.getCurrentUserEmail(),
      devMode: {
        current: this.getDevModeStatus(),
        isOverridden: this.isDevModeOverridden(),
        environmentDefault: import.meta.env.VITE_DEV_MODE === 'true'
      }
    };
  }
}

export const adminService = new AdminService();
export default adminService;
