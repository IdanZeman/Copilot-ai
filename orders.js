// Orders management functionality
class OrdersManager {
    constructor() {
        this.orders = this.loadOrders();
        this.initializeOrdersPage();
    }

    // Load orders from localStorage
    loadOrders() {
        const savedOrders = localStorage.getItem('tshirtOrders');
        return savedOrders ? JSON.parse(savedOrders) : this.getSampleOrders();
    }

    // Save orders to localStorage
    saveOrders() {
        localStorage.setItem('tshirtOrders', JSON.stringify(this.orders));
    }

    // Get sample orders for demonstration
    getSampleOrders() {
        return [
            {
                id: 'ORD-2025-001',
                date: '2025-01-15',
                eventType: 'צבאי',
                audience: 'מבוגרים',
                description: 'חולצות לאירוע גיבוש פלוגה',
                shirtColor: 'שחור',
                quantities: {
                    s: 2,
                    m: 5,
                    l: 8,
                    xl: 3,
                    xxl: 1
                },
                totalQuantity: 19,
                status: 'processing',
                customerName: 'דוד כהן',
                customerEmail: 'david@example.com',
                customerPhone: '052-1234567',
                estimatedDelivery: '2025-01-25',
                design: {
                    frontIcon: 'shield',
                    topCaption: 'יחידת הקומנדו'
                }
            },
            {
                id: 'ORD-2025-002',
                date: '2025-01-10',
                eventType: 'חתונה',
                audience: 'מעורב',
                description: 'חולצות למסיבת רווקות',
                shirtColor: 'לבן',
                quantities: {
                    s: 3,
                    m: 4,
                    l: 2,
                    xl: 1,
                    xxl: 0
                },
                totalQuantity: 10,
                status: 'delivered',
                customerName: 'שרה לוי',
                customerEmail: 'sarah@example.com',
                customerPhone: '053-9876543',
                estimatedDelivery: '2025-01-20',
                design: {
                    frontIcon: 'heart',
                    topCaption: 'צוות הכלה'
                }
            },
            {
                id: 'ORD-2025-003',
                date: '2025-01-12',
                eventType: 'עסקי',
                audience: 'מבוגרים',
                description: 'חולצות לכנס השנתי של החברה',
                shirtColor: 'כחול כהה',
                quantities: {
                    s: 5,
                    m: 12,
                    l: 15,
                    xl: 8,
                    xxl: 3
                },
                totalQuantity: 43,
                status: 'shipped',
                customerName: 'מיכל רוזן',
                customerEmail: 'michal@company.com',
                customerPhone: '054-5551234',
                estimatedDelivery: '2025-01-22',
                design: {
                    frontIcon: 'building',
                    topCaption: 'חברת טכנולוגיות'
                }
            }
        ];
    }

    // Add new order
    addOrder(orderData) {
        const newOrder = {
            id: this.generateOrderId(),
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            estimatedDelivery: this.calculateEstimatedDelivery(),
            ...orderData
        };
        
        this.orders.unshift(newOrder);
        this.saveOrders();
        return newOrder;
    }

    // Generate unique order ID
    generateOrderId() {
        const year = new Date().getFullYear();
        const orderNumber = String(this.orders.length + 1).padStart(3, '0');
        return `ORD-${year}-${orderNumber}`;
    }

    // Calculate estimated delivery date
    calculateEstimatedDelivery() {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 10); // 10 days from now
        return deliveryDate.toISOString().split('T')[0];
    }

    // Initialize orders page
    initializeOrdersPage() {
        if (window.location.pathname.includes('my-orders.html')) {
            this.renderOrders();
            this.setupModal();
        }
    }

    // Render orders on the page
    renderOrders() {
        const ordersContainer = document.getElementById('ordersContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.orders.length === 0) {
            ordersContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        ordersContainer.style.display = 'grid';
        emptyState.style.display = 'none';

        ordersContainer.innerHTML = this.orders.map(order => this.createOrderCard(order)).join('');

        // Add click handlers
        document.querySelectorAll('.order-card').forEach(card => {
            card.addEventListener('click', () => {
                const orderId = card.dataset.orderId;
                this.showOrderDetails(orderId);
            });
        });
    }

    // Create order card HTML
    createOrderCard(order) {
        const statusClass = `status-${order.status}`;
        const statusText = this.getStatusText(order.status);
        const iconClass = this.getEventIcon(order.eventType);

        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-id">הזמנה #${order.id}</div>
                    <div class="order-status ${statusClass}">${statusText}</div>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <strong>תאריך הזמנה:</strong>
                        <span>${this.formatDate(order.date)}</span>
                    </div>
                    <div class="order-detail">
                        <strong>סוג אירוע:</strong>
                        <span>${order.eventType}</span>
                    </div>
                    <div class="order-detail">
                        <strong>כמות:</strong>
                        <span>${order.totalQuantity} חולצות</span>
                    </div>
                    <div class="order-detail">
                        <strong>צבע:</strong>
                        <span>${order.shirtColor}</span>
                    </div>
                </div>
                <div class="order-preview">
                    <div class="order-preview-image">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                    <div class="order-preview-text">
                        <h4>${order.design?.topCaption || 'עיצוב מותאם אישית'}</h4>
                        <p>${order.description}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Get status text in Hebrew
    getStatusText(status) {
        const statusMap = {
            'pending': 'ממתין לאישור',
            'processing': 'בעיבוד',
            'shipped': 'נשלח',
            'delivered': 'נמסר'
        };
        return statusMap[status] || status;
    }

    // Get event icon
    getEventIcon(eventType) {
        const iconMap = {
            'צבאי': 'shield-alt',
            'משפחתי': 'home',
            'חתונה': 'heart',
            'עסקי': 'building',
            'יום הולדת': 'birthday-cake',
            'ספורט': 'football-ball'
        };
        return iconMap[eventType] || 'tshirt';
    }

    // Format date to Hebrew
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('he-IL');
    }

    // Show order details in modal
    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('orderModal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = this.createOrderDetailsHTML(order);
        modal.style.display = 'block';
    }

    // Create detailed order HTML
    createOrderDetailsHTML(order) {
        const statusClass = `status-${order.status}`;
        const statusText = this.getStatusText(order.status);
        const iconClass = this.getEventIcon(order.eventType);

        const quantitiesHTML = Object.entries(order.quantities)
            .filter(([size, qty]) => qty > 0)
            .map(([size, qty]) => `<div class="size-quantity">${size.toUpperCase()}: ${qty}</div>`)
            .join('');

        return `
            <div class="order-detail-header">
                <h3>הזמנה #${order.id}</h3>
                <div class="order-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="order-detail-section">
                <h4>פרטי ההזמנה</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>תאריך הזמנה:</strong>
                        <span>${this.formatDate(order.date)}</span>
                    </div>
                    <div class="detail-item">
                        <strong>סוג אירוע:</strong>
                        <span>${order.eventType}</span>
                    </div>
                    <div class="detail-item">
                        <strong>קהל יעד:</strong>
                        <span>${order.audience}</span>
                    </div>
                    <div class="detail-item">
                        <strong>צבע החולצה:</strong>
                        <span>${order.shirtColor}</span>
                    </div>
                    <div class="detail-item">
                        <strong>תאריך אספקה משוער:</strong>
                        <span>${this.formatDate(order.estimatedDelivery)}</span>
                    </div>
                </div>
            </div>

            <div class="order-detail-section">
                <h4>עיצוב</h4>
                <div class="design-preview">
                    <div class="design-icon">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                    <div class="design-details">
                        <p><strong>כותרת:</strong> ${order.design?.topCaption || 'ללא כותרת'}</p>
                        <p><strong>תיאור:</strong> ${order.description}</p>
                    </div>
                </div>
            </div>

            <div class="order-detail-section">
                <h4>כמויות לפי מידות</h4>
                <div class="quantities-display">
                    ${quantitiesHTML}
                    <div class="total-quantity-display">
                        <strong>סה"כ: ${order.totalQuantity} חולצות</strong>
                    </div>
                </div>
            </div>

            <div class="order-detail-section">
                <h4>פרטי לקוח</h4>
                <div class="customer-details">
                    <p><strong>שם:</strong> ${order.customerName}</p>
                    <p><strong>אימייל:</strong> ${order.customerEmail}</p>
                    <p><strong>טלפון:</strong> ${order.customerPhone}</p>
                    ${order.customerNotes ? `<p><strong>הערות:</strong> ${order.customerNotes}</p>` : ''}
                </div>
            </div>

            <div class="order-detail-section">
                <h4>סטטוס משלוח</h4>
                <div class="shipping-status">
                    ${this.createShippingTimeline(order)}
                </div>
            </div>
        `;
    }

    // Create shipping timeline
    createShippingTimeline(order) {
        const stages = [
            { key: 'pending', text: 'הזמנה התקבלה', icon: 'check' },
            { key: 'processing', text: 'מעבד את ההזמנה', icon: 'cogs' },
            { key: 'shipped', text: 'נשלח', icon: 'truck' },
            { key: 'delivered', text: 'נמסר', icon: 'home' }
        ];

        const currentStageIndex = stages.findIndex(stage => stage.key === order.status);

        return stages.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const stageClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';

            return `
                <div class="timeline-stage ${stageClass}">
                    <div class="timeline-icon">
                        <i class="fas fa-${stage.icon}"></i>
                    </div>
                    <div class="timeline-text">${stage.text}</div>
                </div>
            `;
        }).join('');
    }

    // Setup modal functionality
    setupModal() {
        const modal = document.getElementById('orderModal');
        const closeBtn = document.getElementById('closeModal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Initialize orders manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrdersManager();
});

// Function to add order from form page
function addOrderFromForm(orderData) {
    const ordersManager = new OrdersManager();
    return ordersManager.addOrder(orderData);
}
