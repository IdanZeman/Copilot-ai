import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { LoginButton, LogoutButton, UserProfile } from './LoginButton'
import adminService from '../services/admin-service'

const Navbar = () => {
  console.log('🧭 Navbar component rendering')
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [devMode, setDevMode] = useState(() => {
    // Load dev mode state from localStorage
    return localStorage.getItem('devMode') === 'true'
  })
  const userMenuRef = useRef(null)
  const location = useLocation()
  const { state } = useApp()
  const { isLoggedIn, user, userName } = useAuth()

  console.log('🧭 Navbar auth state:', { isLoggedIn, user: user?.email, userName })

  const isActiveLink = (path) => location.pathname === path

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const toggleDevMode = () => {
    const newDevMode = !devMode
    setDevMode(newDevMode)
    localStorage.setItem('devMode', newDevMode.toString())
    console.log('🔧 Dev mode toggled:', newDevMode)
  }

  // Check if user is admin
  useEffect(() => {
    if (isLoggedIn && user) {
      const adminStatus = adminService.isCurrentUserAdmin()
      setIsAdmin(adminStatus)
      console.log('👑 Admin status:', adminStatus, 'for user:', user.email)
    } else {
      setIsAdmin(false)
    }
  }, [isLoggedIn, user])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="text-blue-600 font-bold text-2xl">
            <Link to="/" className="no-underline text-blue-600">
              <h2>מעצב החולצות שלי</h2>
            </Link>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex list-none gap-8 m-0">
            <li>
              <Link
                to="/"
                className={`nav-link ${
                  isActiveLink('/') 
                    ? 'text-blue-600 bg-blue-50 px-4 py-2 rounded-full'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full'
                } font-medium transition-all duration-300 no-underline`}
              >
                בית
              </Link>
            </li>
            <li>
              <Link
                to="/order"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:-translate-y-0.5 no-underline"
              >
                התחל לעצב
              </Link>
            </li>
            <li className="relative" ref={userMenuRef}>
              {/* User Menu */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <UserProfile showPhoto={true} />
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      ref={userMenuRef}
                      className="w-72 bg-white rounded-lg shadow-2xl border border-gray-200 z-[60] overflow-hidden"
                      style={{
                        maxHeight: 'calc(100vh - 100px)',
                        minWidth: '288px',
                        position: 'fixed',
                        top: '70px',
                        left: '1rem'
                      }}
                    >
                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/cart"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 no-underline"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded bg-blue-100 text-blue-600 ml-3">
                            <i className="fas fa-shopping-cart text-sm"></i>
                          </div>
                          <div className="flex-1">
                            <span className="block">עגלת קניות</span>
                            {state.cart.totalItems > 0 && (
                              <span className="text-xs text-gray-500">{state.cart.totalItems} פריטים</span>
                            )}
                          </div>
                        </Link>

                        <Link
                          to="/my-orders"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 no-underline"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded bg-green-100 text-green-600 ml-3">
                            <i className="fas fa-box text-sm"></i>
                          </div>
                          <span>ההזמנות שלי</span>
                        </Link>

                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 no-underline"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded bg-purple-100 text-purple-600 ml-3">
                            <i className="fas fa-user text-sm"></i>
                          </div>
                          <span>פרופיל</span>
                        </Link>

                        {/* Dev Mode Toggle - Only for admins */}
                        {isAdmin && (
                          <>
                            <div className="my-2 border-t border-gray-200"></div>
                            <div className="px-4 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 flex items-center justify-center rounded bg-green-100 text-green-600 ml-3">
                                    <i className="fas fa-code text-sm"></i>
                                  </div>
                                  <span className="text-sm text-gray-700">מצב פיתוח</span>
                                </div>
                                <button
                                  onClick={toggleDevMode}
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    devMode 
                                      ? 'bg-green-600' 
                                      : 'bg-gray-200'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      devMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Logout */}
                        <div className="my-2 border-t border-gray-200"></div>
                        <div className="px-4 py-2">
                          <LogoutButton 
                            size="sm" 
                            className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 py-2 rounded-md transition-colors duration-150"
                          >
                            <i className="fas fa-sign-out-alt ml-2"></i>
                            התנתק
                          </LogoutButton>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <LoginButton variant="google" size="sm">
                  התחבר
                </LoginButton>
              )}
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <div
            className="md:hidden flex flex-col cursor-pointer"
            onClick={toggleMenu}
          >
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'
            }`}></span>
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMenuOpen ? 'opacity-0' : 'mb-1'
            }`}></span>
            <span className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}></span>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-blue-600 py-2 no-underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  בית
                </Link>
              </li>
              <li>
                <Link
                  to="/order"
                  className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-center no-underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  התחל לעצב
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Dev Mode Indicator */}
      {devMode && (
        <div className="fixed top-20 left-4 z-[70] bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 animate-pulse">
          <i className="fas fa-code"></i>
          <span>מצב פיתוח - ללא קריאות API</span>
        </div>
      )}
    </nav>
  )
}

export default Navbar
