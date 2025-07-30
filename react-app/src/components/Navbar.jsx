import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { LoginButton, LogoutButton, UserProfile } from './LoginButton'

const Navbar = () => {
  console.log('🧭 Navbar component rendering')
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
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
      <div className="max-w-6xl mx-auto px-8">
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-100">
                        <UserProfile showPhoto={true} showEmail={true} />
                      </div>
                      <div className="p-2">
                        <Link
                          to="/cart"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg no-underline transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <i className="fas fa-shopping-cart w-5 text-center ml-3"></i>
                          <span>עגלת קניות {state.cart.totalItems > 0 && `(${state.cart.totalItems})`}</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg no-underline transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <i className="fas fa-box w-5 text-center ml-3"></i>
                          <span>ההזמנות שלי</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg no-underline transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <i className="fas fa-user w-5 text-center ml-3"></i>
                          <span>פרופיל</span>
                        </Link>
                        <hr className="my-2" />
                        <div className="px-2 py-2">
                          <LogoutButton size="sm" className="w-full">
                            <i className="fas fa-sign-out-alt w-5 text-center ml-2"></i>
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
    </nav>
  )
}

export default Navbar
