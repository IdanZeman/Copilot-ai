// Firebase Orders Service - Manages order data in Firestore
import { auth, db } from './firebase-config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';

class OrdersService {
  constructor() {
    this.ordersCollection = 'orders';
  }

  /**
   * Create a new order in Firebase
   * @param {Object} orderData - The order data to save
   * @returns {Promise<{success: boolean, orderId?: string, error?: string}>}
   */
  async createOrder(orderData) {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'משתמש לא מחובר' };
      }

      const userId = auth.currentUser.uid;
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const order = {
        id: orderId,
        userId,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || 'לא ידוע',
        
        // Order details
        eventType: orderData.eventType,
        description: orderData.description,
        selectedDesign: orderData.selectedDesign,
        
        // Product details
        frontColor: orderData.frontColor,
        backColor: orderData.backColor,
        selectedSize: orderData.selectedSize,
        quantity: orderData.quantity || 1,
        
        // Customer details
        customerInfo: {
          fullName: orderData.fullName,
          phone: orderData.phone,
          email: orderData.email,
          address: orderData.address,
          city: orderData.city,
          notes: orderData.notes || ''
        },
        
        // Pricing
        totalPrice: orderData.totalPrice || 0,
        
        // Order status
        status: 'pending', // pending, confirmed, in_production, shipped, delivered, cancelled
        
        // Timestamps
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        
        // Metadata
        designGenerationMethod: orderData.designGenerationMethod || 'ai', // ai, manual, template
        isDevMode: import.meta.env.VITE_DEV_MODE === 'true'
      };

      const orderRef = doc(db, this.ordersCollection, orderId);
      await setDoc(orderRef, order);

      console.log('✅ הזמנה נשמרה בהצלחה:', orderId);
      return { success: true, orderId };
      
    } catch (error) {
      console.error('❌ שגיאה בשמירת הזמנה:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all orders for the current user
   * @returns {Promise<Array>}
   */
  async getUserOrders() {
    try {
      if (!auth.currentUser) {
        return [];
      }

      const userId = auth.currentUser.uid;
      const ordersRef = collection(db, this.ordersCollection);
      const q = query(
        ordersRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const orders = [];
      
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        orders.push({
          ...orderData,
          id: doc.id,
          createdAt: orderData.createdAt?.toDate(),
          updatedAt: orderData.updatedAt?.toDate()
        });
      });

      console.log(`📋 נמצאו ${orders.length} הזמנות למשתמש`);
      return orders;
      
    } catch (error) {
      console.error('❌ שגיאה בטעינת הזמנות:', error);
      return [];
    }
  }

  /**
   * Get a specific order by ID
   * @param {string} orderId - The order ID
   * @returns {Promise<Object|null>}
   */
  async getOrder(orderId) {
    try {
      if (!auth.currentUser) {
        return null;
      }

      const orderRef = doc(db, this.ordersCollection, orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        return null;
      }

      const orderData = orderDoc.data();
      
      // Check if this order belongs to the current user
      if (orderData.userId !== auth.currentUser.uid) {
        console.warn('🚫 ניסיון גישה להזמנה של משתמש אחר');
        return null;
      }

      return {
        ...orderData,
        id: orderDoc.id,
        createdAt: orderData.createdAt?.toDate(),
        updatedAt: orderData.updatedAt?.toDate()
      };
      
    } catch (error) {
      console.error('❌ שגיאה בטעינת הזמנה:', error);
      return null;
    }
  }

  /**
   * Update order status
   * @param {string} orderId - The order ID
   * @param {string} newStatus - The new status
   * @returns {Promise<boolean>}
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const orderRef = doc(db, this.ordersCollection, orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date())
      });

      console.log(`✅ סטטוס הזמנה עודכן: ${orderId} -> ${newStatus}`);
      return true;
      
    } catch (error) {
      console.error('❌ שגיאה בעדכון סטטוס הזמנה:', error);
      return false;
    }
  }

  /**
   * Delete an order (only if status is pending)
   * @param {string} orderId - The order ID
   * @returns {Promise<boolean>}
   */
  async deleteOrder(orderId) {
    try {
      if (!auth.currentUser) {
        return false;
      }

      // First check if order exists and belongs to user
      const order = await this.getOrder(orderId);
      if (!order) {
        return false;
      }

      // Only allow deletion of pending orders
      if (order.status !== 'pending') {
        console.warn('🚫 לא ניתן למחוק הזמנה שאינה בסטטוס pending');
        return false;
      }

      const orderRef = doc(db, this.ordersCollection, orderId);
      await deleteDoc(orderRef);

      console.log('🗑️ הזמנה נמחקה:', orderId);
      return true;
      
    } catch (error) {
      console.error('❌ שגיאה במחיקת הזמנה:', error);
      return false;
    }
  }

  /**
   * Get order statistics for the current user
   * @returns {Promise<Object>}
   */
  async getUserOrderStats() {
    try {
      const orders = await this.getUserOrders();
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        in_production: orders.filter(o => o.status === 'in_production').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      };

      return stats;
      
    } catch (error) {
      console.error('❌ שגיאה בטעינת סטטיסטיקות הזמנות:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        in_production: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      };
    }
  }

  /**
   * Get status display text in Hebrew
   * @param {string} status - The status code
   * @returns {string}
   */
  getStatusText(status) {
    const statusMap = {
      'pending': 'ממתין לאישור',
      'confirmed': 'אושר',
      'in_production': 'בייצור',
      'shipped': 'נשלח',
      'delivered': 'נמסר',
      'cancelled': 'בוטל'
    };

    return statusMap[status] || status;
  }

  /**
   * Get status color for UI display
   * @param {string} status - The status code
   * @returns {string}
   */
  getStatusColor(status) {
    const colorMap = {
      'pending': 'yellow',
      'confirmed': 'blue',
      'in_production': 'purple',
      'shipped': 'indigo',
      'delivered': 'green',
      'cancelled': 'red'
    };

    return colorMap[status] || 'gray';
  }
}

export const ordersService = new OrdersService();
export default ordersService;
