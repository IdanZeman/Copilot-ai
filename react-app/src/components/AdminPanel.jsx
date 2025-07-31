import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import adminService from '../services/admin-service'

const AdminPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { showSuccess, showError } = useNotifications()
  
  const [adminData, setAdminData] = useState({
    isAdmin: false,
    currentUser: null,
    devMode: {
      current: false,
      isOverridden: false,
      environmentDefault: false
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1200)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadAdminData()
    }
  }, [isOpen, user])

  const loadAdminData = () => {
    const data = adminService.getAdminPanelData()
    setAdminData(data)
  }

  const handleDevModeToggle = async (enabled) => {
    setIsLoading(true)
    try {
      // אם אנחנו רוצים להפעיל מצב פיתוח - פשוט נגדיר זאת
      console.log(`🔧 Admin setting dev mode to: ${enabled}`)
      
      // Set the override in localStorage
      localStorage.setItem('ADMIN_DEV_MODE_OVERRIDE', enabled ? 'true' : 'false')
      
      showSuccess(
        `מצב פיתוח ${enabled ? 'הופעל' : 'כובה'} בהצלחה`,
        'השינוי ייכנס לתוקף מיד'
      )
      loadAdminData()
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new Event('devModeChanged'))
      
      // Trigger page reload to apply changes
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (error) {
      showError('שגיאה בשינוי מצב פיתוח', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearOverride = async () => {
    setIsLoading(true)
    try {
      console.log('🔄 Admin clearing dev mode override')
      localStorage.removeItem('ADMIN_DEV_MODE_OVERRIDE')
      
      showSuccess('הוסרה עקיפת אדמין', 'חזרה להגדרת סביבה מקורית')
      loadAdminData()
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new Event('devModeChanged'))
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (error) {
      showError('שגיאה', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  // Only render if user is admin
  if (!adminData.isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className={`bg-white rounded-xl ${isMobile ? 'max-w-sm' : 'max-w-md'} w-full mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto`} onClick={e => e.stopPropagation()}>
          <div className="text-center p-6">
            <i className="fas fa-lock text-4xl text-red-500 mb-4"></i>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-2`}>אין הרשאה</h2>
            <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : ''}`}>רק משתמשי אדמין יכולים לגשת לפאנל זה</p>
            <button
              onClick={onClose}
              className={`bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 ${isMobile ? 'text-sm' : ''}`}
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className={`bg-white rounded-xl ${isMobile ? 'max-w-sm' : 'max-w-2xl'} w-full mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 flex items-center gap-2`}>
                <i className="fas fa-crown text-yellow-500"></i>
                פאנל אדמין
              </h2>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>משתמש: {adminData.currentUser}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Dev Mode Control */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-800 mb-4 flex items-center gap-2`}>
              <i className="fas fa-code text-blue-500"></i>
              בקרת מצב פיתוח
            </h3>

            {/* Current Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                <div>
                  <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>מצב נוכחי:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full font-medium ${isMobile ? 'text-xs' : 'text-sm'} ${
                    adminData.devMode.current 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {adminData.devMode.current ? '🚧 מצב פיתוח' : '🚀 מצב ייצור'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {adminData.devMode.isOverridden && (
                    <span className={`bg-purple-100 text-purple-800 px-2 py-1 rounded ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      עקיפת אדמין פעילה
                    </span>
                  )}
                  {!adminData.devMode.current && (
                    <button
                      onClick={() => handleDevModeToggle(true)}
                      className={`bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors ${isMobile ? 'text-xs' : 'text-xs'}`}
                      title="החזר למצב פיתוח מהר"
                    >
                      מצב פיתוח מהיר
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Environment Info */}
            <div className={`mb-4 text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <p>
                <strong>הגדרת סביבה מקורית:</strong> 
                <span className={`ml-1 ${adminData.devMode.environmentDefault ? 'text-yellow-600' : 'text-green-600'}`}>
                  {adminData.devMode.environmentDefault ? 'מצב פיתוח' : 'מצב ייצור'}
                </span>
              </p>
              {adminData.devMode.isOverridden && (
                <p className="text-purple-600">
                  <strong>סטטוס:</strong> הגדרת אדמין דוחקת את הגדרת הסביבה
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
                <button
                  onClick={() => handleDevModeToggle(true)}
                  disabled={isLoading || adminData.devMode.current}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${isMobile ? 'text-sm' : ''} ${
                    adminData.devMode.current
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-code mr-2"></i>
                      הפעל מצב פיתוח
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDevModeToggle(false)}
                  disabled={isLoading || !adminData.devMode.current}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${isMobile ? 'text-sm' : ''} ${
                    !adminData.devMode.current
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-rocket mr-2"></i>
                      הפעל מצב ייצור
                    </>
                  )}
                </button>
              </div>

              {adminData.devMode.isOverridden && (
                <button
                  onClick={handleClearOverride}
                  disabled={isLoading}
                  className={`w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all ${isMobile ? 'text-sm' : ''}`}
                >
                  <i className="fas fa-undo mr-2"></i>
                  חזור להגדרת סביבה מקורית
                </button>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className={`font-bold text-blue-800 mb-2 ${isMobile ? 'text-sm' : ''}`}>
              <i className="fas fa-info-circle mr-2"></i>
              מידע חשוב
            </h4>
            <ul className={`text-blue-700 space-y-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <li>• מצב פיתוח: משתמש בתמונות גנריות (ללא עלות OpenAI)</li>
              <li>• מצב ייצור: משתמש ב-API אמיתי של OpenAI</li>
              <li>• השינויים נכנסים לתוקף מיד אחרי רענון הדף</li>
              <li>• עקיפת אדמין דוחקת את הגדרות קובץ .env</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
