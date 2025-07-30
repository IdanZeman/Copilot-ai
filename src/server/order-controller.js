import express from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();

// Initialize Firebase Admin SDK
let db;
try {
    // Initialize with application default credentials or service account
    const app = initializeApp({
        credential: applicationDefault(),
        // Add your Firebase project ID if needed
        projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id'
    });
    db = getFirestore(app);
    console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    console.log('ℹ️ Note: You may need to set up Firebase Admin credentials');
}

// Validation helper
function validateOrderItem(item) {
    const errors = [];
    
    if (!item.productType) {
        errors.push('productType is required');
    }
    
    if (!item.designId && !item.designImage) {
        errors.push('designId or designImage is required');
    }
    
    if (!item.color) {
        errors.push('color is required');
    }
    
    if (!item.printColor) {
        errors.push('printColor is required');
    }
    
    // Validate sizes or quantity
    if (item.productType === 'hat' || item.productType === 'accessory') {
        if (!item.quantity || item.quantity <= 0) {
            errors.push('quantity is required for hats and accessories');
        }
    } else {
        // For shirts, hoodies, etc.
        if (!item.sizes || typeof item.sizes !== 'object') {
            errors.push('sizes object is required for clothing items');
        } else {
            const totalSizes = Object.values(item.sizes).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
            if (totalSizes <= 0) {
                errors.push('at least one size with quantity > 0 is required');
            }
        }
    }
    
    return errors;
}

// POST /api/orders - Create a new order
router.post('/orders', async (req, res) => {
    console.log('🚀 === SERVER: POST /api/orders endpoint called ===');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { orderItems, payerDetails, userId } = req.body;
        
        // Validate required fields
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }
        
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'orderItems array is required and must not be empty'
            });
        }
        
        if (!payerDetails || !payerDetails.name || !payerDetails.email || !payerDetails.phone) {
            return res.status(400).json({
                success: false,
                error: 'payerDetails with name, email, and phone are required'
            });
        }
        
        // Validate each order item
        const validationErrors = [];
        orderItems.forEach((item, index) => {
            const errors = validateOrderItem(item);
            if (errors.length > 0) {
                validationErrors.push(`Item ${index + 1}: ${errors.join(', ')}`);
            }
        });
        
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation errors',
                details: validationErrors
            });
        }
        
        // Calculate total quantities and price
        let totalQuantity = 0;
        let totalPrice = 0;
        const basePrice = 89.99; // Base price per item
        
        orderItems.forEach(item => {
            if (item.quantity) {
                totalQuantity += item.quantity;
                totalPrice += item.quantity * basePrice;
            } else if (item.sizes) {
                const itemQuantity = Object.values(item.sizes).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
                totalQuantity += itemQuantity;
                totalPrice += itemQuantity * basePrice;
            }
        });
        
        // Create order document
        const order = {
            userId,
            userEmail: payerDetails.email,
            
            // New structure with order items
            orderItems: orderItems.map(item => ({
                productType: item.productType,
                designId: item.designId || null,
                designImage: item.designImage || '',
                color: item.color,
                printColor: item.printColor,
                sizes: item.sizes || null,
                quantity: item.quantity || null,
                // Additional item-level data that might be useful
                designPrompt: item.designPrompt || '',
                frontText: item.frontText || '',
                frontTextPosition: item.frontTextPosition || 'none',
                backText: item.backText || '',
                backTextPosition: item.backTextPosition || 'none'
            })),
            
            // Payer details
            payerDetails: {
                name: payerDetails.name,
                email: payerDetails.email,
                phone: payerDetails.phone,
                address: payerDetails.address || '',
                city: payerDetails.city || '',
                postalCode: payerDetails.postalCode || '',
                notes: payerDetails.notes || ''
            },
            
            // Legacy compatibility fields (keep for now)
            shirtColor: orderItems[0]?.color || '',
            designColor: orderItems[0]?.printColor || '',
            sizes: orderItems[0]?.sizes || {},
            designImage: orderItems[0]?.designImage || '',
            designPrompt: orderItems[0]?.designPrompt || '',
            frontText: orderItems[0]?.frontText || '',
            frontTextPosition: orderItems[0]?.frontTextPosition || 'none',
            backText: orderItems[0]?.backText || '',
            backTextPosition: orderItems[0]?.backTextPosition || 'none',
            
            // Customer details (legacy)
            customerInfo: {
                fullName: payerDetails.name,
                phone: payerDetails.phone,
                email: payerDetails.email,
                address: payerDetails.address || '',
                city: payerDetails.city || '',
                postalCode: payerDetails.postalCode || '',
                notes: payerDetails.notes || ''
            },
            
            // Totals
            totalQuantity,
            totalPrice,
            basePrice,
            
            // Order metadata
            status: 'pending',
            orderDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            submissionTime: new Date().toISOString()
        };
        
        console.log('💾 Order prepared for saving:', JSON.stringify(order, null, 2));
        
        // Save to Firestore if available
        if (db) {
            const docRef = await db.collection('orders').add(order);
            console.log('✅ Order saved to Firestore with ID:', docRef.id);
            
            res.json({
                success: true,
                orderId: docRef.id,
                order: { id: docRef.id, ...order }
            });
        } else {
            // Fallback - just return success without saving (for development)
            console.log('⚠️ Firebase not available - returning mock response');
            const mockOrderId = 'mock_' + Date.now();
            res.json({
                success: true,
                orderId: mockOrderId,
                order: { id: mockOrderId, ...order }
            });
        }
        
    } catch (error) {
        console.error('❌ Error processing order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process order',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/orders/:userId - Get orders for a user
router.get('/orders/:userId', async (req, res) => {
    console.log('🚀 === SERVER: GET /api/orders/:userId endpoint called ===');
    
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }
        
        if (db) {
            const ordersSnapshot = await db.collection('orders')
                .where('userId', '==', userId)
                .orderBy('orderDate', 'desc')
                .get();
            
            const orders = [];
            ordersSnapshot.forEach(doc => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ Found ${orders.length} orders for user ${userId}`);
            
            res.json({
                success: true,
                orders
            });
        } else {
            // Fallback for development
            console.log('⚠️ Firebase not available - returning mock orders');
            res.json({
                success: true,
                orders: []
            });
        }
        
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
