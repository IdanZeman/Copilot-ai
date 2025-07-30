// Import Firebase and order service
import { orderService } from './order-service.js';
import { auth, onAuthStateChanged, signInWithPopup, provider } from './firebase-config.js';
import { getCurrentUser, waitForAuthInit, authStateManager } from './auth-state.js';

// Show sign in modal/popup
async function showSignInModal() {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('User signed in:', result.user);
        // Orders will reload automatically due to auth state change
    } catch (error) {
        console.error('Sign in error:', error);
        alert('שגיאה בהתחברות. אנא נסה שוב.');
    }
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('he-IL', options);
}

// Function to format price
function formatPrice(price) {
    return price.toFixed(2) + ' ₪';
}

// Function to create order card
function createOrderCard(order) {
    // Handle multiple items display
    const itemsToShow = order.items || [];
    const firstItem = itemsToShow[0] || {};
    
    const sizesDisplay = firstItem.sizes ? 
        Object.entries(firstItem.sizes)
            .filter(([size, qty]) => qty > 0)
            .map(([size, qty]) => `${size}: ${qty}`)
            .join(', ') : '';

    const quantityDisplay = firstItem.quantity ? `כמות: ${firstItem.quantity}` : 
                           sizesDisplay ? `מידות: ${sizesDisplay}` : 
                           `כמות כוללת: ${order.totalQuantity}`;

    return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <span class="order-number">הזמנה #${order.orderNumber}</span>
                    <span class="order-date">${order.date}</span>
                </div>
                <div class="order-status ${order.statusClass}">
                    ${order.status}
                </div>
            </div>
            ${order.designImage ? 
                `<div class="order-image">
                    <img src="${order.designImage}" alt="עיצוב הזמנה" onerror="this.style.display='none';">
                </div>` : ''
            }
            <div class="order-details">
                ${itemsToShow.map((item, index) => `
                    <div class="order-item">
                        <div class="item-info">
                            <span class="item-name">${item.design || 'עיצוב מותאם אישית'}</span>
                            <span class="item-details">
                                ${item.productType && item.productType !== 'tshirt' ? `סוג: ${item.productType} | ` : ''}
                                צבע: ${item.color || 'לא צוין'}
                                ${item.printColor ? ` | צבע הדפס: ${item.printColor}` : ''}
                                ${index === 0 ? ` | ${quantityDisplay}` : ''}
                            </span>
                            ${index === 0 && order.customerName ? `<span class="customer-name">לקוח: ${order.customerName}</span>` : ''}
                        </div>
                        ${index === 0 ? `<div class="item-price">${order.totalPrice}</div>` : ''}
                    </div>
                `).join('')}
                ${itemsToShow.length > 1 ? `<div class="items-summary">+${itemsToShow.length - 1} פריטים נוספים</div>` : ''}
            </div>
            <div class="order-footer">
                <div class="order-total">
                    <span>סה"כ:</span>
                    <span class="total-amount">${order.totalPrice}</span>
                </div>
                <button class="view-details-btn" onclick="showOrderDetails('${order.id}')">
                    צפה בפרטים נוספים
                </button>
            </div>
        </div>
    `;
}

// Function to load orders from Firebase
let isLoadingOrders = false; // Prevent multiple simultaneous calls

async function loadOrders() {
    if (isLoadingOrders) {
        console.log('Orders already loading, skipping duplicate call');
        return;
    }
    
    isLoadingOrders = true;
    
    const ordersContainer = document.querySelector('.orders-container');
    if (!ordersContainer) {
        console.error('Orders container not found');
        isLoadingOrders = false;
        return;
    }

    try {
        // Wait for auth to initialize
        await waitForAuthInit();
        
        // Check if user is authenticated
        const currentUser = getCurrentUser();
        console.log('👤 Current user object:', currentUser);
        
        if (!currentUser) {
            console.log('❌ No current user found');
            ordersContainer.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-user-lock"></i>
                    <h3>נדרשת התחברות</h3>
                    <p>התחבר כדי לצפות בהזמנות שלך</p>
                    <button onclick="showSignInModal()" class="cta-button">התחבר</button>
                </div>
            `;
            return;
        }

        console.log('✅ User is authenticated, UID:', currentUser.uid);

        // Show loading state
        ordersContainer.innerHTML = `
            <div class="loading-orders">
                <i class="fas fa-spinner fa-spin"></i>
                <p>טוען הזמנות...</p>
            </div>
        `;

        // Fetch orders from Firebase
        console.log('🔍 Fetching orders for user:', currentUser.uid);
        try {
            const orders = await orderService.getUserOrders(currentUser.uid);
            console.log('📦 Retrieved orders:', orders.length, orders);
            
            if (orders.length === 0) {
                console.log('ℹ️ No orders found, showing empty state');
                ordersContainer.innerHTML = `
                    <div class="no-orders">
                        <i class="fas fa-box-open"></i>
                        <h3>אין הזמנות עדיין</h3>
                        <p>התחל להזמין חולצות מותאמות אישית</p>
                        <a href="./order-form.html" class="cta-button">התחל לעצב</a>
                    </div>
                `;
            } else {
                console.log('✅ Displaying orders');
                // Format orders for display and render
                const formattedOrders = orders.map(order => orderService.formatOrderForDisplay(order));
                console.log('🎨 Formatted orders:', formattedOrders);
                ordersContainer.innerHTML = formattedOrders.map(order => createOrderCard(order)).join('');
            }
        } catch (fetchError) {
            console.error('❌ Error fetching orders:', fetchError);
            ordersContainer.innerHTML = `
                <div class="error-orders">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>שגיאה בטעינת הזמנות</h3>
                    <p>שגיאה: ${fetchError.message}</p>
                    <button onclick="loadOrders()" class="cta-button">נסה שוב</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersContainer.innerHTML = `
            <div class="error-orders">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>שגיאה בטעינת הזמנות</h3>
                <p>אירעה שגיאה בטעינת ההזמנות. אנא נסה שוב מאוחר יותר.</p>
                <button onclick="loadOrders()" class="cta-button">נסה שוב</button>
            </div>
        `;
    } finally {
        isLoadingOrders = false;
    }
}

// Function to show order details in modal
async function showOrderDetails(orderId) {
    const modal = document.getElementById('orderModal');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) {
        console.error('Modal elements not found');
        return;
    }

    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.error('User not authenticated');
            return;
        }

        // Show loading in modal
        modalBody.innerHTML = `
            <div class="loading-modal">
                <i class="fas fa-spinner fa-spin"></i>
                <p>טוען פרטי הזמנה...</p>
            </div>
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal

        // Get all user orders and find the specific one
        const orders = await orderService.getUserOrders(currentUser.uid);
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            modalBody.innerHTML = `
                <div class="error-modal">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>הזמנה לא נמצאה</p>
                </div>
            `;
            return;
        }

        const formattedOrder = orderService.formatOrderForDisplay(order);
        const sizesDisplay = order.sizes ? 
            Object.entries(order.sizes)
                .filter(([size, qty]) => qty > 0)
                .map(([size, qty]) => `<span class="size-item">${size}: ${qty}</span>`)
                .join(' ') : 'לא צוין';

        const modalHeader = document.getElementById('modalHeader');
        if (modalHeader) {
            modalHeader.innerHTML = `
                <h3 class="modal-title">פרטי הזמנה #${formattedOrder.orderNumber}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            `;
        }
        
        modalBody.innerHTML = `
            <div class="modal-order-details">
                <div class="modal-section">
                    <h4>פרטי הזמנה</h4>
                    <div class="detail-grid">
                        <p><strong>תאריך:</strong> ${formattedOrder.date}</p>
                        <p><strong>סטטוס:</strong> <span class="${formattedOrder.statusClass}">${formattedOrder.status}</span></p>
                        <p><strong>סכום כולל:</strong> ₪${order.totalPrice || 0}</p>
                    </div>
                </div>
                
                ${order.designImage || (order.orderItems && order.orderItems[0]?.designImage) ? `
                    <div class="modal-section">
                        <h4>עיצוב</h4>
                        <div class="design-preview">
                            <img src="${order.designImage || order.orderItems[0].designImage}" alt="עיצוב הזמנה" class="preview-image">
                        </div>
                    </div>
                ` : ''}
                
                <div class="modal-section">
                    <h4>פרטי המוצרים</h4>
                    <div class="product-details">
                        ${order.orderItems && order.orderItems.length > 0 ? 
                            order.orderItems.map((item, index) => `
                                <div class="product-item" ${index > 0 ? 'style="border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;"' : ''}>
                                    ${item.designPrompt ? `<p><strong>תיאור עיצוב:</strong> ${item.designPrompt}</p>` : ''}
                                    <p><strong>סוג מוצר:</strong> ${item.productType === 'tshirt' ? 'חולצה' : item.productType}</p>
                                    <p><strong>צבע:</strong> ${item.color || 'לא צוין'}</p>
                                    <p><strong>צבע הדפס:</strong> ${item.printColor || 'לא צוין'}</p>
                                    ${item.sizes ? `<p><strong>מידות:</strong> ${Object.entries(item.sizes)
                                        .filter(([size, qty]) => qty > 0)
                                        .map(([size, qty]) => `${size}: ${qty}`)
                                        .join(', ')}</p>` : ''}
                                    ${item.quantity ? `<p><strong>כמות:</strong> ${item.quantity}</p>` : ''}
                                    ${item.frontText ? `<p><strong>טקסט קדמי:</strong> ${item.frontText} (${item.frontTextPosition})</p>` : ''}
                                    ${item.backText ? `<p><strong>טקסט אחורי:</strong> ${item.backText} (${item.backTextPosition})</p>` : ''}
                                </div>
                            `).join('') :
                            // Fallback to legacy structure
                            `<div class="product-item">
                                ${order.designPrompt ? `<p><strong>תיאור עיצוב:</strong> ${order.designPrompt}</p>` : ''}
                                <p><strong>צבע חולצה:</strong> ${order.shirtColor || 'לא צוין'}</p>
                                <p><strong>מידות:</strong> ${sizesDisplay}</p>
                                <p><strong>כמות כוללת:</strong> ${order.totalQuantity || 0}</p>
                                ${order.frontText ? `<p><strong>טקסט קדמי:</strong> ${order.frontText} (${order.frontTextPosition})</p>` : ''}
                                ${order.backText ? `<p><strong>טקסט אחורי:</strong> ${order.backText} (${order.backTextPosition})</p>` : ''}
                            </div>`
                        }
                    </div>
                </div>
                
                <div class="modal-section">
                    <h4>פרטי לקוח</h4>
                    <div class="customer-details">
                        <p><strong>שם:</strong> ${order.customerInfo?.fullName || order.payerDetails?.name || 'לא צוין'}</p>
                        <p><strong>טלפון:</strong> ${order.customerInfo?.phone || order.payerDetails?.phone || 'לא צוין'}</p>
                        <p><strong>אימייל:</strong> ${order.customerInfo?.email || order.payerDetails?.email || 'לא צוין'}</p>
                        <p><strong>כתובת:</strong> ${order.customerInfo?.address || order.payerDetails?.address || 'לא צוין'}</p>
                        <p><strong>עיר:</strong> ${order.customerInfo?.city || order.payerDetails?.city || 'לא צוין'}</p>
                        ${(order.customerInfo?.postalCode || order.payerDetails?.postalCode) ? `<p><strong>מיקוד:</strong> ${order.customerInfo?.postalCode || order.payerDetails?.postalCode}</p>` : ''}
                        ${(order.customerInfo?.notes || order.payerDetails?.notes) ? `<p><strong>הערות:</strong> ${order.customerInfo?.notes || order.payerDetails?.notes}</p>` : ''}
                    </div>
                </div>
                
                ${order.eventType || order.eventDate || order.specialRequests ? `
                    <div class="modal-section">
                        <h4>פרטי אירוע</h4>
                        <div class="event-details">
                            ${order.eventType ? `<p><strong>סוג אירוע:</strong> ${order.eventType}</p>` : ''}
                            ${order.eventDate ? `<p><strong>תאריך אירוע:</strong> ${order.eventDate}</p>` : ''}
                            ${order.specialRequests ? `<p><strong>בקשות מיוחדות:</strong> ${order.specialRequests}</p>` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="modal-section modal-total-section">
                    <div class="modal-total">
                        <span class="total-label">סה"כ לתשלום:</span>
                        <span class="total-amount">${formattedOrder.totalPrice}</span>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading order details:', error);
        modalBody.innerHTML = `
            <div class="error-modal">
                <i class="fas fa-exclamation-triangle"></i>
                <p>שגיאה בטעינת פרטי ההזמנה</p>
            </div>
        `;
    }
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'visible'; // Re-enable scrolling
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('orderModal');
        if (modal && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
});

// Make functions global for HTML onclick handlers
window.showOrderDetails = showOrderDetails;
window.closeModal = closeModal;
window.loadOrders = loadOrders;
window.showSignInModal = showSignInModal;

// Load orders when page loads and auth state changes
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize auth state and load orders
    await authStateManager.initialize();
    loadOrders();
    
    // Add event listener to close button
    const closeButton = document.getElementById('closeModal');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // Listen for auth state changes
    authStateManager.addListener(() => {
        console.log('Auth state changed, reloading orders');
        loadOrders();
    });
});
