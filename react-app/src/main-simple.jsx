import React from 'react'
import ReactDOM from 'react-dom/client'
import SimplePage from './SimplePage.jsx'

console.log('🌟 SIMPLE - Main.jsx starting to load')
console.log('🌟 SIMPLE - React version:', React.version)

const rootElement = document.getElementById('root')
console.log('🌟 SIMPLE - Root element found:', rootElement)

if (!rootElement) {
  console.error('❌ SIMPLE - Root element not found!')
} else {
  console.log('✅ SIMPLE - Root element exists, creating React root')
  
  try {
    const root = ReactDOM.createRoot(rootElement)
    console.log('✅ SIMPLE - React root created, rendering simple page')
    
    root.render(<SimplePage />)
    
    console.log('🌟 SIMPLE - Simple page rendered successfully')
  } catch (error) {
    console.error('❌ SIMPLE - Error rendering simple page:', error)
  }
}
