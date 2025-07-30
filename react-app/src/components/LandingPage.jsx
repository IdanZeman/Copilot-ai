import React from 'react'
import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/usePageTitle'
import Navbar from './Navbar'

const LandingPage = () => {
  console.log('🏡 LandingPage component rendering')
  
  // SEO Meta tags
  useMetaTags({
    title: 'עיצוב חולצות מותאמות אישית',
    description: 'צור חולצות מותאמות אישית עם בינה מלאכותית. עיצובים ייחודיים לאירועים צבאיים, משפחתיים ועסקיים. הזמן עכשיו!',
    keywords: 'עיצוב חולצות, חולצות מותאמות אישית, הדפסה על חולצות, עיצוב AI, חולצות לאירועים'
  })

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                עיצוב חולצות מותאמות אישית<br />
                בעזרת <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">בינה מלאכותית</span>
              </h1>
              <p className="text-xl mb-10 opacity-90 font-light">
                צור עיצובים ייחודיים לכל אירוע - צבאי, משפחתי, עסקי ועוד<br />
                תהליך פשוט ומהיר עם תוצאות מקצועיות
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/order"
                  className="btn btn-primary btn-large bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 no-underline flex items-center justify-center gap-2"
                >
                  <i className="fas fa-magic"></i>
                  התחל לעצב עכשיו
                </Link>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="btn btn-secondary btn-large bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-tools"></i>
                  איך זה עובד?
                </button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-60 h-60 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <i className="fas fa-shield-alt text-6xl mb-4"></i>
                    <span className="text-xl font-medium">עיצוב ייחודי</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">למה לבחור בנו?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'fas fa-robot',
                title: 'בינה מלאכותית מתקדמת',
                description: 'אלגוריתמים חכמים שיוצרים עיצובים ייחודיים בהתאם לצרכים שלך'
              },
              {
                icon: 'fas fa-clock',
                title: 'תהליך מהיר',
                description: 'מרעיון לעיצוב מוגמר תוך דקות ספורות'
              },
              {
                icon: 'fas fa-palette',
                title: 'עיצובים מותאמים אישית',
                description: 'כל עיצוב נוצר במיוחד עבורך ולא יחזור על עצמו'
              },
              {
                icon: 'fas fa-mobile-alt',
                title: 'ממשק ידידותי',
                description: 'תהליך פשוט ואינטואיטיבי שמותאם למכשירים ניידים'
              },
              {
                icon: 'fas fa-star',
                title: 'איכות גבוהה',
                description: 'חולצות איכותיות עם הדפסה עמידה ומקצועית'
              },
              {
                icon: 'fas fa-shipping-fast',
                title: 'משלוח מהיר',
                description: 'קבלת החולצות תוך זמן קצר ישירות עד הבית'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-600 text-4xl mb-4">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">פשוט וקל ליצור חולצה מעוצבת</h2>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {[
              {
                icon: 'fas fa-tshirt',
                title: 'בחר אירוע',
                description: 'ספר לנו על האירוע שלך'
              },
              {
                icon: 'fas fa-pen',
                title: 'תאר את הרעיון',
                description: 'שתף אותנו במה שאתה מחפש'
              },
              {
                icon: 'fas fa-magic',
                title: 'קבל עיצוב',
                description: 'נכין לך עיצוב מותאם אישית'
              },
              {
                icon: 'fas fa-palette',
                title: 'התאם והשלם',
                description: 'בחר צבעים וכמויות'
              },
              {
                icon: 'fas fa-box',
                title: 'קבל הביתה',
                description: 'משלוח מהיר עד אליך'
              }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center max-w-xs">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl mb-4">
                  <i className={step.icon}></i>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < 4 && (
                  <div className="hidden lg:block text-gray-400 text-2xl mt-4">
                    <i className="fas fa-chevron-left"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">עיצובים לכל אירוע</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'fas fa-shield-alt',
                title: 'אירועים צבאיים',
                description: 'גיבוש יחידות, סיום קורסים, אירועי זיכרון'
              },
              {
                icon: 'fas fa-heart',
                title: 'חתונות ואירועים',
                description: 'חתונות, אירוסין, מסיבות רווקות'
              },
              {
                icon: 'fas fa-building',
                title: 'אירועים עסקיים',
                description: 'כנסים, ימי גיבוש עובדים, השקות מוצרים'
              },
              {
                icon: 'fas fa-home',
                title: 'אירועים משפחתיים',
                description: 'מפגשי משפחה, יום הולדת, חגים'
              },
              {
                icon: 'fas fa-football-ball',
                title: 'אירועי ספורט',
                description: 'קבוצות ספורט, מרטונים, תחרויות'
              },
              {
                icon: 'fas fa-graduation-cap',
                title: 'אירועי חינוך',
                description: 'סיום לימודים, מחזור, ימי עיון'
              }
            ].map((event, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
                <div className="text-blue-600 text-4xl mb-4">
                  <i className={event.icon}></i>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">מוכן להתחיל?</h2>
          <p className="text-xl mb-10 opacity-90">
            צור את העיצוב הייחודי שלך עכשיו ותקבל תוצאה מקצועית תוך דקות
          </p>
          <Link
            to="/order"
            className="btn btn-primary btn-large bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-xl font-medium rounded-lg transition-all duration-200 no-underline inline-flex items-center gap-3"
          >
            <i className="fas fa-rocket"></i>
            התחל לעצב עכשיו
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">מעצב החולצות שלי</h3>
              <p className="text-gray-300">עיצוב חולצות מותאמות אישית בעזרת בינה מלאכותית</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">קישורים מהירים</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white transition-colors no-underline">בית</Link></li>
                <li><Link to="/order" className="text-gray-300 hover:text-white transition-colors no-underline">הזמן עכשיו</Link></li>
                <li><Link to="/orders" className="text-gray-300 hover:text-white transition-colors no-underline">ההזמנות שלי</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">צור קשר</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <i className="fas fa-phone"></i>
                  <span>03-1234567</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-envelope"></i>
                  <span>info@aishirts.co.il</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-300">
            <p>&copy; 2025 מעצב החולצות שלי. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
