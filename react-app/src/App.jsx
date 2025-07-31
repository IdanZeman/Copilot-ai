import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Breadcrumbs from './components/Breadcrumbs'
import LandingPage from './components/LandingPage'
import DesignFormPage from './components/DesignFormPage'
import CartPage from './components/CartPage'
import MyOrders from './components/MyOrders'

// App Content Component (to use AppContext inside Router)
const AppContent = () => {
  console.log('🚀 AppContent component rendering')
  const { actions } = useApp()

  useEffect(() => {
    console.log('📱 AppContent useEffect running')
    // Load user and cart from localStorage on app start
    actions.loadUserFromStorage()
    actions.loadCartFromStorage()
    console.log('✅ AppContent useEffect completed')
  }, [actions])

  console.log('🎯 AppContent rendering JSX')
  return (
    <div className="App min-h-screen">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/order" element={
            <>
              <Breadcrumbs />
              <DesignFormPage />
            </>
          } />
          <Route path="/cart" element={
            <>
              <Breadcrumbs />
              <CartPage />
            </>
          } />
          <Route path="/orders" element={
            <>
              <Breadcrumbs />
              <MyOrders />
            </>
          } />
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

// 404 Not Found Page
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <i className="fas fa-search text-blue-500 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">הדף לא נמצא</h2>
          <p className="text-gray-600 mb-6">
            הדף שחיפשת לא קיים או הועבר למקום אחר
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <i className="fas fa-home mr-2"></i>
            חזרה לעמוד הבית
          </a>
          
          <a
            href="/order"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <i className="fas fa-palette mr-2"></i>
            התחל לעצב חולצה
          </a>
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  console.log('🏠 App component rendering')
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <AppProvider>
              <Router>
                <AppContent />
              </Router>
            </AppProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
