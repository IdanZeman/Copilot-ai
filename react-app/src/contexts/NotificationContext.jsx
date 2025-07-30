import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  console.log('🔔 NotificationProvider rendering')
  
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    console.log('🔔 Adding notification:', notification)
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    })
  }, [addNotification])

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 7000, // Longer duration for errors
      ...options
    })
  }, [addNotification])

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    })
  }, [addNotification])

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    })
  }, [addNotification])

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

// Individual Notification Component
const NotificationItem = ({ notification, onRemove }) => {
  const { type, message, title } = notification

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: 'fas fa-check-circle',
          border: 'border-green-200'
        }
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: 'fas fa-exclamation-circle',
          border: 'border-red-200'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: 'fas fa-exclamation-triangle',
          border: 'border-yellow-200'
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          icon: 'fas fa-info-circle',
          border: 'border-blue-200'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className={`bg-white rounded-lg shadow-lg border-l-4 ${styles.border} p-4 transform transition-all duration-300 ease-in-out hover:shadow-xl`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-6 h-6 ${styles.bg} rounded-full flex items-center justify-center mr-3`}>
          <i className={`${styles.icon} text-white text-sm`}></i>
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {title}
            </p>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="סגור הודעה"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>
    </div>
  )
}

export default NotificationContext
