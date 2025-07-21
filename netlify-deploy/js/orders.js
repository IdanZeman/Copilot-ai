// Mock data for orders (replace with actual data from backend)
const mockOrders = [
    {
        id: '1',
        date: '2025-07-15',
        status: 'בהכנה',
        items: [
            {
                design: 'חולצה מותאמת אישית #1',
                size: 'M',
                color: 'לבן',
                quantity: 2,
                price: 89.99
            }
        ],
        total: 179.98
    },
    {
        id: '2',
        date: '2025-07-10',
        status: 'נשלח',
        items: [
            {
                design: 'חולצה מותאמת אישית #2',
                size: 'L',
                color: 'שחור',
                quantity: 1,
                price: 89.99
            }
        ],
        total: 89.99
    }
];

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
    return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <span class="order-number">הזמנה #${order.id}</span>
                    <span class="order-date">${formatDate(order.date)}</span>
                </div>
                <div class="order-status ${order.status === 'נשלח' ? 'status-shipped' : 'status-processing'}">
                    ${order.status}
                </div>
            </div>
            <div class="order-details">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="item-info">
                            <span class="item-name">${item.design}</span>
                            <span class="item-details">גודל: ${item.size} | צבע: ${item.color} | כמות: ${item.quantity}</span>
                        </div>
                        <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <div class="order-total">
                    <span>סה"כ:</span>
                    <span class="total-amount">${formatPrice(order.total)}</span>
                </div>
                <button class="view-details-btn" onclick="showOrderDetails('${order.id}')">
                    צפה בפרטים נוספים
                </button>
            </div>
        </div>
    `;
}

// Function to load orders
function loadOrders() {
    const ordersContainer = document.querySelector('.orders-container');
    if (!ordersContainer) {
        console.error('Orders container not found');
        return;
    }

    // In a real application, this would fetch orders from a server
    const orders = mockOrders;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-box-open"></i>
                <h3>אין הזמנות עדיין</h3>
                <p>התחל להזמין חולצות מותאמות אישית</p>
                <a href="./order-form.html" class="cta-button">התחל לעצב</a>
            </div>
        `;
    } else {
        ordersContainer.innerHTML = orders.map(order => createOrderCard(order)).join('');
    }
}

// Function to show order details in modal
function showOrderDetails(orderId) {
    const modal = document.getElementById('orderModal');
    const modalBody = document.getElementById('modalBody');
    const order = mockOrders.find(o => o.id === orderId);

    if (!order) {
        console.error('Order not found');
        return;
    }

    modalBody.innerHTML = `
        <div class="modal-order-details">
            <div class="modal-section">
                <h4>פרטי הזמנה</h4>
                <p>מספר הזמנה: #${order.id}</p>
                <p>תאריך: ${formatDate(order.date)}</p>
                <p>סטטוס: ${order.status}</p>
            </div>
            <div class="modal-section">
                <h4>פריטים</h4>
                ${order.items.map(item => `
                    <div class="modal-item">
                        <div class="modal-item-info">
                            <p class="item-name">${item.design}</p>
                            <p class="item-details">
                                גודל: ${item.size} | צבע: ${item.color}
                            </p>
                            <p>כמות: ${item.quantity}</p>
                        </div>
                        <div class="modal-item-price">${formatPrice(item.price * item.quantity)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="modal-section">
                <div class="modal-total">
                    <span>סה"כ לתשלום:</span>
                    <span>${formatPrice(order.total)}</span>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Load orders when page loads
document.addEventListener('DOMContentLoaded', loadOrders);
