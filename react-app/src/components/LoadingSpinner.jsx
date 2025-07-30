import React from 'react'

const LoadingSpinner = ({ size = 'medium', text = 'טוען...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  }

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4`}></div>
      {text && (
        <p className="text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <LoadingContent />
        </div>
      </div>
    )
  }

  return <LoadingContent />
}

const LoadingPage = ({ message = 'טוען את הדף...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{message}</h2>
          <p className="text-gray-600">זה ייקח רק רגע...</p>
        </div>
        
        {/* Loading Animation */}
        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

const LoadingSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded mb-3 last:mb-0" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
      ))}
    </div>
  )
}

const LoadingCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

export { LoadingSpinner, LoadingPage, LoadingSkeleton, LoadingCard }
export default LoadingSpinner
