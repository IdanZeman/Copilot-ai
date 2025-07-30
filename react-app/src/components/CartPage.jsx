import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'

const CartPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - במציאות יתקשר עם localStorage או backend
  useEffect(() => {
    setTimeout(() => {
      setCartItems([
        {
          id: 1,
          eventType: 'צבאי',
          description: 'חולצות ליחידת הצנחנים עם עיצוב מיוחד',
          backDesign: '/images/default-tshirt.png',
          frontDesign: '/images/default-tshirt.png',
          shirtColor: 'שחור',
          printColor: 'לבן',
          sizes: [
            { size: 'M', quantity: 5 },
            { size: 'L', quantity: 3 },
            { size: 'XL', quantity: 2 }
          ],
          totalQuantity: 10,
          pricePerItem: 45,
          totalPrice: 450,
          dateAdded: new Date('2025-07-29'),
          status: 'pending'
        },
        {
          id: 2,
          eventType: 'משפחתי',
          description: 'חולצות למשפחת כהן - חגיגת יום הולדת 50',
          backDesign: '/images/default-tshirt.png',
          frontDesign: null,
          shirtColor: 'כחול',
          printColor: 'לבן',
          sizes: [
            { size: 'S', quantity: 2 },
            { size: 'M', quantity: 4 },
            { size: 'L', quantity: 2 }
          ],
          totalQuantity: 8,
          pricePerItem: 45,
          totalPrice: 360,
          dateAdded: new Date('2025-07-28'),
          status: 'pending'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, newSizes) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            sizes: newSizes,
            totalQuantity: newSizes.reduce((total, s) => total + s.quantity, 0),
            totalPrice: newSizes.reduce((total, s) => total + s.quantity, 0) * item.pricePerItem
          }
        : item
    ))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.totalQuantity, 0)
  }

  const proceedToCheckout = () => {
    if (cartItems.length === 0) return
    
    // כאן נעביר לדף תשלום או נשלח הזמנה
    alert('🚧 בקרוב: מעבר לעמוד תשלום מאובטח')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-28 pb-20 max-w-6xl mx-auto px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">טוען עגלת קניות...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              <i className="fas fa-shopping-cart text-blue-600 mr-3"></i>
              עגלת הקניות שלי
            </h1>
            <p className="text-gray-600 text-lg">
              {cartItems.length > 0 
                ? `יש לך ${getTotalItems()} פריטים בעגלה` 
                : 'העגלה שלך ריקה'}
            </p>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16">
              <div className="mb-8">
                <i className="fas fa-shopping-cart text-gray-300 text-6xl mb-4"></i>
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">העגלה שלך ריקה</h2>
                <p className="text-gray-500">בואו נוסיף כמה עיצובים מדהימים!</p>
              </div>
              
              <div className="space-y-4">
                <a 
                  href="/order"
                  className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg"
                >
                  <i className="fas fa-plus mr-2"></i>
                  התחל עיצוב חדש
                </a>
                
                <div className="block">
                  <a 
                    href="/"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <i className="fas fa-arrow-right mr-2"></i>
                    חזרה לעמוד הבית
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Cart Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">
                            הזמנה #{item.id} - {item.eventType}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            נוסף ב-{item.dateAdded.toLocaleDateString('he-IL')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2"
                          title="הסר מהעגלה"
                        >
                          <i className="fas fa-trash text-lg"></i>
                        </button>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {item.description}
                        </p>
                      </div>

                      {/* Design Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">עיצוב אחורי</h4>
                          <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                            <img 
                              src={item.backDesign} 
                              alt="עיצוב אחורי" 
                              className="w-16 h-16 object-contain mx-auto"
                            />
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">עיצוב קדמי</h4>
                          <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                            {item.frontDesign ? (
                              <img 
                                src={item.frontDesign} 
                                alt="עיצוב קדמי" 
                                className="w-16 h-16 object-contain mx-auto"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center mx-auto text-gray-400">
                                <i className="fas fa-ban"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Colors */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-600">צבע חולצה:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded-full border border-gray-300" 
                                 style={{ backgroundColor: getColorValue(item.shirtColor) }}></div>
                            <span className="font-medium">{item.shirtColor}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-600">צבע הדפסה:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded-full border border-gray-300" 
                                 style={{ backgroundColor: getColorValue(item.printColor) }}></div>
                            <span className="font-medium">{item.printColor}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sizes */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">מידות וכמויות:</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.sizes.map((sizeInfo) => (
                            <span 
                              key={sizeInfo.size}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {sizeInfo.size}: {sizeInfo.quantity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          {item.totalQuantity} חולצות × ₪{item.pricePerItem}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ₪{item.totalPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-32">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    <i className="fas fa-calculator text-blue-600 mr-2"></i>
                    סיכום הזמנה
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">פריטים בעגלה:</span>
                      <span className="font-semibold">{cartItems.length}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">סה״כ חולצות:</span>
                      <span className="font-semibold">{getTotalItems()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-800 font-medium">סה״כ לתשלום:</span>
                      <span className="text-2xl font-bold text-blue-800">₪{getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={proceedToCheckout}
                      className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold text-lg"
                    >
                      <i className="fas fa-credit-card mr-2"></i>
                      המשך לתשלום
                    </button>
                    
                    <a
                      href="/order"
                      className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-center"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      הוסף עיצוב נוסף
                    </a>
                    
                    <a
                      href="/"
                      className="block w-full text-center text-gray-600 hover:text-gray-800 transition-colors py-2"
                    >
                      <i className="fas fa-arrow-right mr-2"></i>
                      המשך קניות
                    </a>
                  </div>

                  {/* Info Box */}
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      <i className="fas fa-info-circle mr-2"></i>
                      חשוב לדעת
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• זמן אספקה: 7-14 יום עבודה</li>
                      <li>• משלוח חינם מעל ₪500</li>
                      <li>• אחריות איכות מלאה</li>
                      <li>• אפשרות לתיקונים עד 48 שעות</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get color values
const getColorValue = (colorName) => {
  const colors = {
    'לבן': '#FFFFFF',
    'שחור': '#000000',
    'אדום': '#DC2626',
    'כחול': '#2563EB',
    'ירוק': '#059669',
    'צהוב': '#FACC15',
    'אפור': '#6B7280',
    'ורוד': '#EC4899',
    'סגול': '#7C3AED',
    'כתום': '#EA580C',
    'טורקיז': '#0891B2',
    'חום': '#92400E'
  }
  return colors[colorName] || '#CCCCCC'
}

export default CartPage
