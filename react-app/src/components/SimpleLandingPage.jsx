import React from 'react'
import { Link } from 'react-router-dom'

const SimpleLandingPage = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h2 className="text-2xl font-bold text-blue-600">מעצב החולצות שלי</h2>
            <div className="flex gap-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-4 py-2">בית</Link>
              <Link to="/order" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">התחל לעצב</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6">עיצוב חולצות בעזרת בינה מלאכותית</h1>
          <p className="text-xl mb-8">צור עיצובים ייחודיים לכל אירוע בקלות ובמהירות</p>
          <Link 
            to="/order" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-block"
          >
            התחל לעצב עכשיו
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">למה לבחור בנו?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-4xl text-blue-600 mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3">בינה מלאכותית</h3>
              <p className="text-gray-600">עיצובים ייחודיים ומותאמים אישית</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-4xl text-blue-600 mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">מהיר</h3>
              <p className="text-gray-600">תוצאות תוך דקות ספורות</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-4xl text-blue-600 mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-3">מותאם אישית</h3>
              <p className="text-gray-600">כל עיצוב הוא ייחודי ומיוחד</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SimpleLandingPage
