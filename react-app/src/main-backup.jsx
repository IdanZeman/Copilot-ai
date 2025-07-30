import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🌟 Main.jsx starting to load')
console.log('🌟 React version:', React.version)
console.log('🌟 Window object:', typeof window)
console.log('🌟 Document object:', typeof document)

const rootElement = document.getElementById('root')
console.log('🌟 Root element found:', rootElement)

if (!rootElement) {
  console.error('❌ Root element not found!')
} else {
  console.log('✅ Root element exists, creating React root')
  
  try {
    const root = ReactDOM.createRoot(rootElement)
    console.log('✅ React root created, rendering app')
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    
    console.log('🌟 React app rendered successfully')
  } catch (error) {
    console.error('❌ Error rendering React app:', error)
  }
}
