// Order management service
import { db, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from './firebase-config.js';

class OrderService {
    constructor() {
        this.ordersCollection = 'orders';
    }

    // Save order to database
    async saveOrder(orderData) {
        try {
            const order = {
                userId: orderData.userId,
                userEmail: orderData.userEmail,
                
                // Design information
                designPrompt: orderData.designPrompt || '',
                designImage: orderData.designImage || '',
                selectedDesign: orderData.selectedDesign || null,
                designMethod: orderData.designMethod || 'ai',
                designStyle: orderData.designStyle || '',
                designColor: orderData.designColor || '',
                
                // T-shirt details
                shirtColor: orderData.shirtColor || '',
                
                // Text overlays
                frontText: orderData.frontText || '',
                frontTextPosition: orderData.frontTextPosition || 'none',
                backText: orderData.backText || '',
                backTextPosition: orderData.backTextPosition || 'none',
                
                // Sizes and quantities
                sizes: orderData.sizes || {},
                totalQuantity: orderData.totalQuantity || 0,
                
                // Customer details
                customerInfo: {
                    fullName: orderData.fullName || '',
                    phone: orderData.phone || '',
                    email: orderData.email || '',
                    address: orderData.address || '',
                    city: orderData.city || '',
                    postalCode: orderData.postalCode || '',
                    notes: orderData.notes || ''
                },
                
                // Order details
                eventType: orderData.eventType || '',
                eventDate: orderData.eventDate || '',
                specialRequests: orderData.specialRequests || '',
                
                // Pricing
                basePrice: 89.99, // Base price per shirt
                totalPrice: this.calculateTotalPrice(orderData),
                
                // Order status and timestamps
                status: 'pending', // pending, processing, shipped, delivered, cancelled
                orderDate: serverTimestamp(),
                submissionTime: new Date().toISOString(),
                
                // Additional metadata
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, this.ordersCollection), order);
            console.log('Order saved with ID:', docRef.id);
            
            return {
                success: true,
                orderId: docRef.id,
                order: { id: docRef.id, ...order }
            };
            
        } catch (error) {
            console.error('Error saving order:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Calculate total price based on order data
    calculateTotalPrice(orderData) {
        const basePrice = 89.99;
        let totalQuantity = 0;
        
        if (orderData.sizes && typeof orderData.sizes === 'object') {
            Object.values(orderData.sizes).forEach(quantity => {
                totalQuantity += parseInt(quantity) || 0;
            });
        } else if (orderData.totalQuantity) {
            totalQuantity = parseInt(orderData.totalQuantity) || 0;
        }
        
        return totalQuantity * basePrice;
    }

    // Get user's orders
    async getUserOrders(userId) {
        try {
            const q = query(
                collection(db, this.ordersCollection),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const orders = [];
            
            querySnapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`Found ${orders.length} orders for user ${userId}`);
            return orders;
            
        } catch (error) {
            console.error('Error getting user orders:', error);
            return [];
        }
    }

    // Format order for display
    formatOrderForDisplay(order) {
        const formatDate = (timestamp) => {
            if (!timestamp) return 'לא זמין';
            
            let date;
            if (timestamp.toDate) {
                // Firestore timestamp
                date = timestamp.toDate();
            } else {
                // Regular date string
                date = new Date(timestamp);
            }
            
            return date.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const formatPrice = (price) => {
            return (price || 0).toFixed(2) + ' ₪';
        };

        const getStatusText = (status) => {
            const statusMap = {
                'pending': 'ממתין לעיבוד',
                'processing': 'בהכנה',
                'shipped': 'נשלח',
                'delivered': 'נמסר',
                'cancelled': 'בוטל'
            };
            return statusMap[status] || 'לא ידוע';
        };

        return {
            id: order.id,
            orderNumber: order.id.substring(0, 8).toUpperCase(),
            date: formatDate(order.orderDate || order.createdAt),
            status: getStatusText(order.status),
            statusClass: `status-${order.status}`,
            totalPrice: formatPrice(order.totalPrice),
            totalQuantity: order.totalQuantity || 0,
            designImage: order.designImage || '',
            designPrompt: order.designPrompt || '',
            customerName: order.customerInfo?.fullName || '',
            items: [{
                design: order.designPrompt ? `עיצוב AI: ${order.designPrompt.substring(0, 50)}...` : 'עיצוב מותאם אישית',
                color: order.shirtColor || '',
                sizes: order.sizes || {},
                totalQuantity: order.totalQuantity || 0,
                price: order.totalPrice || 0
            }]
        };
    }
}

// Export singleton instance
const orderService = new OrderService();
export { orderService };
