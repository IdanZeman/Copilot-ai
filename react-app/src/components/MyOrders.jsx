import React, { useState, useEffect } from 'react'
import { useMetaTags } from '../hooks/usePageTitle'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'
import { AuthRequiredModal } from './LoginButton'
import ordersService from '../services/orders-service'
import Navbar from './Navbar'

const MyOrders = () => {
  // SEO Meta tags
  useMetaTags({
    title: 'ההזמנות שלי',
    description: 'צפה בכל ההזמנות שלך, מעקב אחר סטטוס ומידע על משלוח',
    keywords: 'הזמנות, מעקב הזמנה, חולצות מותאמות אישית'
  })

  // Authentication
  const { isLoggedIn, requireAuth, user } = useAuth()
  
  // Notifications
  const { showSuccess, showError } = useNotifications()

  // State
  const [orders, setOrders] = useState([])
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    in_production: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Load orders when component mounts
  useEffect(() => {
    if (isLoggedIn && user) {
      loadOrders()
    } else if (!isLoggedIn) {
      setShowAuthModal(true)
      setIsLoading(false)
    }
  }, [isLoggedIn, user])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      console.log('📋 טוען הזמנות...')
      
      const [userOrders, stats] = await Promise.all([
        ordersService.getUserOrders(),
        ordersService.getUserOrderStats()
      ])
      
      setOrders(userOrders)
      setOrderStats(stats)
      
      console.log(`✅ נטענו ${userOrders.length} הזמנות`)
    } catch (error) {
      console.error('❌ שגיאה בטעינת הזמנות:', error)
      showError('שגיאה בטעינת ההזמנות', 'אנא נסה לרענן את הדף')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
      return
    }

    try {
      const success = await ordersService.deleteOrder(orderId)
      if (success) {
        showSuccess('הזמנה נמחקה בהצלחה')
        loadOrders() // Reload orders
      } else {
        showError('שגיאה במחיקת ההזמנה', 'ניתן למחוק רק הזמנות ממתינות')
      }
    } catch (error) {
      console.error('❌ שגיאה במחיקת הזמנה:', error)
      showError('שגיאה במחיקת ההזמנה', error.message)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'לא ידוע'
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const renderOrderCard = (order) => {
    const statusColor = ordersService.getStatusColor(order.status)
    const statusText = ordersService.getStatusText(order.status)

    return (
      <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">הזמנה #{order.id}</h3>
            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
            {statusText}
          </div>
        </div>

        {/* Design Preview */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            {order.selectedDesign ? (
              <img 
                src={order.selectedDesign} 
                alt="עיצוב החולצה"
                className="w-full h-40 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setSelectedOrder(order)}
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 rounded-lg border flex items-center justify-center">
                <span className="text-gray-500">אין עיצוב</span>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-2">
              <p><strong>סוג אירוע:</strong> {order.eventType}</p>
              <p><strong>תיאור:</strong> {order.description}</p>
              <p><strong>מידה:</strong> {order.selectedSize}</p>
              <p><strong>צבע קדמי:</strong> {order.frontColor}</p>
              <p><strong>צבע אחורי:</strong> {order.backColor}</p>
              <p><strong>כמות:</strong> {order.quantity || 1}</p>
              {order.totalPrice > 0 && (
                <p><strong>מחיר:</strong> ₪{order.totalPrice}</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-t pt-4 mb-4">
          <h4 className="font-medium text-gray-700 mb-2">פרטי לקוח:</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>שם:</strong> {order.customerInfo?.fullName}</p>
              <p><strong>טלפון:</strong> {order.customerInfo?.phone}</p>
              <p><strong>אימייל:</strong> {order.customerInfo?.email}</p>
            </div>
            <div>
              <p><strong>כתובת:</strong> {order.customerInfo?.address}</p>
              <p><strong>עיר:</strong> {order.customerInfo?.city}</p>
              {order.customerInfo?.notes && (
                <p><strong>הערות:</strong> {order.customerInfo.notes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => setSelectedOrder(order)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-eye mr-2"></i>
            צפה בפרטים
          </button>
          
          {order.status === 'pending' && (
            <button
              onClick={() => handleDeleteOrder(order.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <i className="fas fa-trash mr-2"></i>
              מחק
            </button>
          )}
        </div>

        {/* Dev Mode Indicator */}
        {order.isDevMode && (
          <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            🚧 הזמנה נוצרה במצב פיתוח
          </div>
        )}
      </div>
    )
  }

  const renderOrderModal = () => {
    if (!selectedOrder) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">פרטי הזמנה #{selectedOrder.id}</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {selectedOrder.selectedDesign && (
              <div className="mb-6">
                <img 
                  src={selectedOrder.selectedDesign} 
                  alt="עיצוב החולצה"
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">פרטי ההזמנה</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>סוג אירוע:</strong> {selectedOrder.eventType}</p>
                    <p><strong>מידה:</strong> {selectedOrder.selectedSize}</p>
                    <p><strong>כמות:</strong> {selectedOrder.quantity || 1}</p>
                  </div>
                  <div>
                    <p><strong>צבע קדמי:</strong> {selectedOrder.frontColor}</p>
                    <p><strong>צבע אחורי:</strong> {selectedOrder.backColor}</p>
                    {selectedOrder.totalPrice > 0 && (
                      <p><strong>מחיר:</strong> ₪{selectedOrder.totalPrice}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <p><strong>תיאור:</strong> {selectedOrder.description}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">פרטי לקוח</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>שם מלא:</strong> {selectedOrder.customerInfo?.fullName}</p>
                    <p><strong>טלפון:</strong> {selectedOrder.customerInfo?.phone}</p>
                    <p><strong>אימייל:</strong> {selectedOrder.customerInfo?.email}</p>
                  </div>
                  <div>
                    <p><strong>כתובת:</strong> {selectedOrder.customerInfo?.address}</p>
                    <p><strong>עיר:</strong> {selectedOrder.customerInfo?.city}</p>
                  </div>
                </div>
                {selectedOrder.customerInfo?.notes && (
                  <div className="mt-2">
                    <p><strong>הערות:</strong> {selectedOrder.customerInfo.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">מידע נוסף</h3>
                <div className="text-sm space-y-1">
                  <p><strong>תאריך הזמנה:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>עדכון אחרון:</strong> {formatDate(selectedOrder.updatedAt)}</p>
                  <p><strong>סטטוס:</strong> {ordersService.getStatusText(selectedOrder.status)}</p>
                  <p><strong>שיטת יצירת עיצוב:</strong> {selectedOrder.designGenerationMethod === 'ai' ? 'בינה מלאכותית' : 'ידני'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If not logged in, show auth modal
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
            <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">נדרשת התחברות</h2>
            <p className="text-gray-600 mb-6">
              כדי לצפות בהזמנות שלך, עליך להתחבר תחילה
            </p>
          </div>
        </div>
        
        <AuthRequiredModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="נדרשת התחברות"
          message="כדי לצפות בהזמנות שלך, עליך להתחבר תחילה"
        />
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
            <h1 className="text-4xl font-bold text-gray-800 mb-4">ההזמנות שלי</h1>
            <p className="text-xl text-gray-600">מעקב אחר כל ההזמנות שלך במקום אחד</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600">{orderStats.total}</div>
              <div className="text-sm text-gray-600">סה״כ</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
              <div className="text-sm text-gray-600">ממתין</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600">{orderStats.confirmed}</div>
              <div className="text-sm text-gray-600">אושר</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600">{orderStats.in_production}</div>
              <div className="text-sm text-gray-600">בייצור</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-indigo-600">{orderStats.shipped}</div>
              <div className="text-sm text-gray-600">נשלח</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
              <div className="text-sm text-gray-600">נמסר</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
              <div className="text-sm text-gray-600">בוטל</div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">טוען הזמנות...</p>
            </div>
          )}

          {/* No Orders */}
          {!isLoading && orders.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-bold text-gray-600 mb-2">אין לך הזמנות עדיין</h3>
              <p className="text-gray-500 mb-6">התחל לעצב חולצה מותאמת אישית</p>
              <a 
                href="/design" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                צור הזמנה חדשה
              </a>
            </div>
          )}

          {/* Orders Grid */}
          {!isLoading && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map(renderOrderCard)}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {renderOrderModal()}
    </div>
  )
}

export default MyOrders
