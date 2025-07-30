import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data - במציאות יתקשר עם backend
  useEffect(() => {
    setTimeout(() => {
      setOrders([
        {
          id: 1001,
          orderNumber: 'ORD-2025-001',
          eventType: 'צבאי',
          description: 'חולצות ליחידת הצנחנים עם עיצוב מיוחד לחגיגת יום העצמאות',
          status: 'completed',
          statusText: 'הושלם',
          orderDate: new Date('2025-07-20'),
          deliveryDate: new Date('2025-07-28'),
          totalItems: 15,
          totalPrice: 675,
          shirtColor: 'שחור',
          printColor: 'לבן',
          customerName: 'יוסי כהן',
          phone: '050-1234567',
          email: 'yossi@email.com',
          backDesign: '/images/default-tshirt.png',
          frontDesign: '/images/default-tshirt.png',
          sizes: [
            { size: 'M', quantity: 6 },
            { size: 'L', quantity: 7 },
            { size: 'XL', quantity: 2 }
          ]
        },
        {
          id: 1002,
          orderNumber: 'ORD-2025-002',
          eventType: 'משפחתי',
          description: 'חולצות למשפחת לוי - חגיגת בר מצווה',
          status: 'in_production',
          statusText: 'בייצור',
          orderDate: new Date('2025-07-25'),
          deliveryDate: new Date('2025-08-05'),
          totalItems: 12,
          totalPrice: 540,
          shirtColor: 'כחול',
          printColor: 'לבן',
          customerName: 'שרה לוי',
          phone: '052-9876543',
          email: 'sarah@email.com',
          backDesign: '/images/default-tshirt.png',
          frontDesign: null,
          sizes: [
            { size: 'S', quantity: 3 },
            { size: 'M', quantity: 5 },
            { size: 'L', quantity: 4 }
          ]
        },
        {
          id: 1003,
          orderNumber: 'ORD-2025-003',
          eventType: 'עסקי',
          description: 'חולצות לחברת הייטק - יום גיבוש',
          status: 'pending',
          statusText: 'ממתין לאישור',
          orderDate: new Date('2025-07-29'),
          deliveryDate: new Date('2025-08-10'),
          totalItems: 25,
          totalPrice: 1125,
          shirtColor: 'אפור',
          printColor: 'שחור',
          customerName: 'דני רוזן',
          phone: '053-5555555',
          email: 'danny@company.com',
          backDesign: '/images/default-tshirt.png',
          frontDesign: '/images/default-tshirt.png',
          sizes: [
            { size: 'S', quantity: 5 },
            { size: 'M', quantity: 10 },
            { size: 'L', quantity: 8 },
            { size: 'XL', quantity: 2 }
          ]
        }
      ])
      setIsLoading(false)
    }, 1200)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_production': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'fas fa-clock'
      case 'confirmed': return 'fas fa-check-circle'
      case 'in_production': return 'fas fa-cogs'
      case 'ready': return 'fas fa-box'
      case 'completed': return 'fas fa-check-double'
      case 'cancelled': return 'fas fa-times-circle'
      default: return 'fas fa-question-circle'
    }
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-28 pb-20 max-w-6xl mx-auto px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">טוען היסטוריית הזמנות...</p>
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
              <i className="fas fa-clipboard-list text-blue-600 mr-3"></i>
              ההזמנות שלי
            </h1>
            <p className="text-gray-600 text-lg">
              כאן תוכל לעקוב אחר כל ההזמנות שלך ולראות את הסטטוס הנוכחי
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { key: 'all', label: 'כל ההזמנות', icon: 'fas fa-list' },
                { key: 'pending', label: 'ממתינות לאישור', icon: 'fas fa-clock' },
                { key: 'in_production', label: 'בייצור', icon: 'fas fa-cogs' },
                { key: 'completed', label: 'הושלמו', icon: 'fas fa-check-double' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    filterStatus === filter.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <i className={`${filter.icon} mr-2`}></i>
                  {filter.label}
                  {filter.key !== 'all' && (
                    <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                      {orders.filter(o => o.status === filter.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            /* No Orders */
            <div className="text-center py-16">
              <div className="mb-8">
                <i className="fas fa-clipboard-list text-gray-300 text-6xl mb-4"></i>
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                  {filterStatus === 'all' ? 'אין הזמנות עדיין' : 'אין הזמנות בסטטוס זה'}
                </h2>
                <p className="text-gray-500">
                  {filterStatus === 'all' 
                    ? 'בואו ניצור את ההזמנה הראשונה שלך!' 
                    : 'נסה לבחור סינון אחר או צור הזמנה חדשה'}
                </p>
              </div>
              
              <a 
                href="/order"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg"
              >
                <i className="fas fa-plus mr-2"></i>
                הזמנה חדשה
              </a>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                          הזמנה #{order.orderNumber}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>
                            <i className="fas fa-calendar mr-1"></i>
                            הוזמן: {order.orderDate.toLocaleDateString('he-IL')}
                          </span>
                          <span>
                            <i className="fas fa-truck mr-1"></i>
                            מועד אספקה: {order.deliveryDate.toLocaleDateString('he-IL')}
                          </span>
                          <span>
                            <i className="fas fa-user mr-1"></i>
                            {order.customerName}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          <i className={`${getStatusIcon(order.status)} mr-2`}></i>
                          {order.statusText}
                        </span>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Event & Description */}
                      <div className="lg:col-span-2">
                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                            פרטי ההזמנה
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="mb-2">
                              <span className="font-medium text-gray-700">סוג אירוע: </span>
                              <span className="text-gray-800">{order.eventType}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{order.description}</p>
                          </div>
                        </div>

                        {/* Design Preview */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">
                            <i className="fas fa-palette text-purple-600 mr-2"></i>
                            עיצובים
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">עיצוב אחורי</h5>
                              <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                                <img 
                                  src={order.backDesign} 
                                  alt="עיצוב אחורי" 
                                  className="w-20 h-20 object-contain mx-auto"
                                />
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">עיצוב קדמי</h5>
                              <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                                {order.frontDesign ? (
                                  <img 
                                    src={order.frontDesign} 
                                    alt="עיצוב קדמי" 
                                    className="w-20 h-20 object-contain mx-auto"
                                  />
                                ) : (
                                  <div className="w-20 h-20 flex items-center justify-center mx-auto text-gray-400">
                                    <i className="fas fa-ban text-2xl"></i>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          <i className="fas fa-shopping-bag text-green-600 mr-2"></i>
                          סיכום הזמנה
                        </h4>
                        
                        <div className="space-y-3">
                          {/* Colors */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">צבע חולצה:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-gray-300" 
                                     style={{ backgroundColor: getColorValue(order.shirtColor) }}></div>
                                <span className="text-sm font-medium">{order.shirtColor}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">צבע הדפסה:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-gray-300" 
                                     style={{ backgroundColor: getColorValue(order.printColor) }}></div>
                                <span className="text-sm font-medium">{order.printColor}</span>
                              </div>
                            </div>
                          </div>

                          {/* Sizes */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-600 block mb-2">מידות:</span>
                            <div className="flex flex-wrap gap-1">
                              {order.sizes.map((sizeInfo) => (
                                <span 
                                  key={sizeInfo.size}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                                >
                                  {sizeInfo.size}: {sizeInfo.quantity}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Totals */}
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-blue-700">סה״כ פריטים:</span>
                              <span className="font-semibold text-blue-800">{order.totalItems}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">סה״כ מחיר:</span>
                              <span className="text-lg font-bold text-blue-800">₪{order.totalPrice.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-600 block mb-2">יצירת קשר:</span>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <i className="fas fa-phone text-gray-500"></i>
                                <span>{order.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fas fa-envelope text-gray-500"></i>
                                <span>{order.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          <i className="fas fa-eye mr-2"></i>
                          צפה בפרטים
                        </button>
                        
                        {order.status === 'pending' && (
                          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
                            <i className="fas fa-edit mr-2"></i>
                            ערוך הזמנה
                          </button>
                        )}
                        
                        {order.status === 'completed' && (
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                            <i className="fas fa-redo mr-2"></i>
                            הזמן שוב
                          </button>
                        )}
                        
                        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                          <i className="fas fa-download mr-2"></i>
                          הורד חשבונית
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Action Button */}
          <div className="fixed bottom-8 right-8">
            <a
              href="/order"
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl"
              title="הזמנה חדשה"
            >
              <i className="fas fa-plus text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get color values (reused from CartPage)
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

export default OrdersPage
