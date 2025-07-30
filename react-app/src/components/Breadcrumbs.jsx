import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  // Define breadcrumb labels in Hebrew
  const breadcrumbLabels = {
    '': 'בית',
    'order': 'עיצוב חולצה',
    'cart': 'עגלת קניות',
    'orders': 'ההזמנות שלי',
    'profile': 'פרופיל אישי',
    'contact': 'צור קשר',
    'about': 'אודות'
  }

  const breadcrumbIcons = {
    '': 'fas fa-home',
    'order': 'fas fa-palette',
    'cart': 'fas fa-shopping-cart',
    'orders': 'fas fa-clipboard-list',
    'profile': 'fas fa-user',
    'contact': 'fas fa-envelope',
    'about': 'fas fa-info-circle'
  }

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex items-center space-x-2 text-sm">
          {/* Home Link */}
          <Link 
            to="/" 
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
          >
            <i className="fas fa-home mr-2"></i>
            בית
          </Link>

          {/* Path segments */}
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
            const isLast = index === pathnames.length - 1
            const label = breadcrumbLabels[name] || name
            const icon = breadcrumbIcons[name] || 'fas fa-folder'

            return (
              <React.Fragment key={name}>
                {/* Separator */}
                <i className="fas fa-chevron-left text-gray-400 text-xs"></i>
                
                {/* Breadcrumb item */}
                {isLast ? (
                  <span className="flex items-center text-gray-800 font-medium">
                    <i className={`${icon} mr-2`}></i>
                    {label}
                  </span>
                ) : (
                  <Link 
                    to={routeTo}
                    className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <i className={`${icon} mr-2`}></i>
                    {label}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Breadcrumbs
