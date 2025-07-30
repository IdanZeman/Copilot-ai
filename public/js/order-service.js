// Order management service
import { db, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from './firebase-config.js';

class OrderService {
    constructor() {
        this.ordersCollection = 'orders';
    }

    // Get API base URL
    getAPIBaseURL() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `http://localhost:${window.location.port || 8000}`;
        }
        return window.location.origin;
    }

    // Save order using new API structure (preferred method)
    async saveOrderViaAPI(orderData) {
        try {
            console.log('💾 Saving order via API with new structure:', orderData);
            
            // Clean the order items before sending
            if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
                orderData.orderItems = orderData.orderItems.map(item => this.cleanOrderItem(item));
            }
            
            const response = await fetch(`${this.getAPIBaseURL()}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API call failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Order saved via API successfully:', result.orderId);
                return {
                    success: true,
                    orderId: result.orderId,
                    order: result.order
                };
            } else {
                throw new Error(result.error || 'API returned failure');
            }
            
        } catch (error) {
            console.error('❌ Error saving order via API:', error);
            throw error;
        }
    }

    // Convert legacy order data to new structure
    convertLegacyToNewStructure(orderData) {
        return {
            userId: orderData.userId,
            orderItems: [
                this.cleanOrderItem({
                    productType: 'tshirt',
                    designId: orderData.selectedDesign,
                    designImage: orderData.designImage || '',
                    color: orderData.shirtColor || '',
                    printColor: orderData.designColor || '',
                    sizes: orderData.sizes || {},
                    designPrompt: orderData.designPrompt || '',
                    frontText: orderData.frontText || '',
                    frontTextPosition: orderData.frontTextPosition || 'none',
                    backText: orderData.backText || '',
                    backTextPosition: orderData.backTextPosition || 'none'
                })
            ],
            payerDetails: {
                name: orderData.fullName || '',
                email: orderData.email || orderData.userEmail || '',
                phone: orderData.phone || '',
                address: orderData.address || '',
                city: orderData.city || '',
                postalCode: orderData.postalCode || '',
                notes: orderData.notes || ''
            }
        };
    }

    // Clean order item: keep only sizes OR quantity, not both
    cleanOrderItem(item) {
        const oneSizeProducts = ['hat', 'beanie', 'cap', 'mug', 'keychain'];
        const cleanedItem = { ...item };
        
        // Fix: Clean up sizes object to remove null/invalid keys
        if (cleanedItem.sizes && typeof cleanedItem.sizes === 'object') {
            const cleanSizes = {};
            Object.entries(cleanedItem.sizes).forEach(([size, qty]) => {
                // Only keep valid size keys with valid quantities
                if (size && typeof size === 'string' && size.trim() !== '' && size !== 'null' && qty > 0) {
                    cleanSizes[size] = parseInt(qty) || 0;
                }
            });
            cleanedItem.sizes = cleanSizes;
        }
        
        // Determine if this is a one-size product
        const isOneSizeProduct = oneSizeProducts.includes(cleanedItem.productType);
        
        if (isOneSizeProduct) {
            // For one-size products: use quantity, remove sizes
            if (cleanedItem.sizes && Object.keys(cleanedItem.sizes).length > 0) {
                // Convert sizes to total quantity
                cleanedItem.quantity = Object.values(cleanedItem.sizes).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
            }
            cleanedItem.sizes = null;
        } else {
            // For multi-size products: use sizes, remove quantity
            if (cleanedItem.sizes && Object.keys(cleanedItem.sizes).length > 0) {
                cleanedItem.quantity = null;
            } else if (cleanedItem.quantity && cleanedItem.quantity > 0) {
                // Convert quantity to default size (M for shirts)
                cleanedItem.sizes = { M: cleanedItem.quantity };
                cleanedItem.quantity = null;
            }
        }
        
        return cleanedItem;
    }

    // Save order to database (with fallback to direct Firebase)
    async saveOrder(orderData) {
        try {
            console.log('💾 Starting to save order:', orderData);
            
            // Try new API structure first
            try {
                const newStructureData = this.convertLegacyToNewStructure(orderData);
                return await this.saveOrderViaAPI(newStructureData);
            } catch (apiError) {
                console.warn('⚠️ API failed, falling back to direct Firebase:', apiError);
                // Fall back to direct Firebase save
                return await this.saveOrderDirectly(orderData);
            }
            
        } catch (error) {
            console.error('❌ All save methods failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Direct Firebase save (legacy method, kept for compatibility)
    async saveOrderDirectly(orderData) {
        try {
            console.log('💾 Saving order directly to Firebase (legacy method)');
            
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
                
                // Add new orderItems structure for compatibility
                orderItems: [
                    this.cleanOrderItem({
                        productType: 'tshirt',
                        designId: orderData.selectedDesign,
                        designImage: orderData.designImage || '',
                        color: orderData.shirtColor || '',
                        printColor: orderData.designColor || '',
                        sizes: orderData.sizes || {},
                        designPrompt: orderData.designPrompt || '',
                        frontText: orderData.frontText || '',
                        frontTextPosition: orderData.frontTextPosition || 'none',
                        backText: orderData.backText || '',
                        backTextPosition: orderData.backTextPosition || 'none'
                    })
                ],
                
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
                
                // Add payerDetails for new structure compatibility
                payerDetails: {
                    name: orderData.fullName || '',
                    email: orderData.email || orderData.userEmail || '',
                    phone: orderData.phone || '',
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

            console.log('💾 Order object prepared for Firebase:', order);
            console.log('💾 Saving to collection:', this.ordersCollection);
            
            const docRef = await addDoc(collection(db, this.ordersCollection), order);
            console.log('✅ Order saved successfully with ID:', docRef.id);
            
            return {
                success: true,
                orderId: docRef.id,
                order: { id: docRef.id, ...order }
            };
            
        } catch (error) {
            console.error('Error saving order to Firebase:', error);
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
        
        // Handle new orderItems structure
        if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
            orderData.orderItems.forEach(item => {
                if (item.quantity) {
                    totalQuantity += parseInt(item.quantity) || 0;
                } else if (item.sizes && typeof item.sizes === 'object') {
                    Object.values(item.sizes).forEach(quantity => {
                        totalQuantity += parseInt(quantity) || 0;
                    });
                }
            });
        }
        // Handle legacy structure
        else if (orderData.sizes && typeof orderData.sizes === 'object') {
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
            console.log('🔎 Querying orders for userId:', userId);
            console.log('🔎 Collection name:', this.ordersCollection);
            console.log('🔎 Database object:', db);
            
            // Try without orderBy first to see if that's the issue
            const q = query(
                collection(db, this.ordersCollection),
                where('userId', '==', userId)
            );
            
            console.log('🔎 Firebase query created successfully (without orderBy)');
            const querySnapshot = await getDocs(q);
            console.log('🔎 Query executed, processing results...');
            
            const orders = [];
            
            querySnapshot.forEach((doc) => {
                console.log('📄 Found order document:', doc.id, doc.data());
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ Found ${orders.length} orders for user ${userId}`);
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
            designImage: order.designImage || (order.orderItems && order.orderItems[0]?.designImage) || '',
            designPrompt: order.designPrompt || (order.orderItems && order.orderItems[0]?.designPrompt) || '',
            customerName: order.customerInfo?.fullName || order.payerDetails?.name || '',
            items: order.orderItems ? order.orderItems.map(item => ({
                design: item.designPrompt ? `עיצוב AI: ${item.designPrompt.substring(0, 50)}...` : 'עיצוב מותאם אישית',
                color: item.color || '',
                printColor: item.printColor || '',
                productType: item.productType || 'tshirt',
                sizes: item.sizes || {},
                quantity: item.quantity || null,
                totalQuantity: item.sizes ? Object.values(item.sizes).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0) : (item.quantity || 0),
                price: (item.sizes ? Object.values(item.sizes).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0) : (item.quantity || 0)) * 89.99
            })) : [{
                // Fallback to legacy structure
                design: order.designPrompt ? `עיצוב AI: ${order.designPrompt.substring(0, 50)}...` : 'עיצוב מותאם אישית',
                color: order.shirtColor || '',
                printColor: order.designColor || '',
                productType: 'tshirt',
                sizes: order.sizes || {},
                quantity: null,
                totalQuantity: order.totalQuantity || 0,
                price: order.totalPrice || 0
            }]
        };
    }
}

// Export singleton instance
const orderService = new OrderService();
export { orderService };
