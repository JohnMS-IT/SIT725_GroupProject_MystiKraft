// admin-orders.js
// Admin Orders Management logic:
// - Load all orders (GET /api/orders/all)
// - Update order status (PUT /api/orders/:id/status)
// - Live updates via Socket.IO: order-updated

const orderTableBody = document.getElementById('orderTableBody');

// Connect to server via Socket.IO for live updates
const socket = io();

// Load all orders
async function loadOrders() {
  orderTableBody.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';

  const res = await fetch('/api/orders/all');
  if (!res.ok) {
    orderTableBody.innerHTML = '<tr><td colspan="5" class="red-text">Failed to load orders</td></tr>';
    return;
  }
  const orders = await res.json();
  renderOrders(orders);
}

// Render orders to the table
function renderOrders(orders) {
  orderTableBody.innerHTML = '';

  if (orders.length === 0) {
    orderTableBody.innerHTML = '<tr><td colspan="5" class="center">No orders found</td></tr>';
    return;
  }

  orders.forEach(order => {
    const tr = document.createElement('tr');
    tr.dataset.id = order._id;
    tr.innerHTML = `
      <td>${order.orderNumber}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td>$${order.total.toFixed(2)}</td>
      <td>${order.status}</td>
      <td>
        <a class="btn-flat blue-text text-darken-1" data-act="update" data-id="${order._id}">
          <i class="material-icons">edit</i>
        </a>
      </td>
    `;
    orderTableBody.appendChild(tr);
  });
}

// Handle Update clicks (event delegation on <tbody>)
orderTableBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act="update"]');
  if (!btn) return;

  const id = btn.dataset.id;
  const newStatus = prompt('Enter new status for the order:');
  if (!newStatus) return;

  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });

  if (!res.ok) {
    M.toast({html: 'Failed to update order status', classes: 'red'});
    return;
  }

  const updatedOrder = await res.json();

  // Update the row in the table
  const row = orderTableBody.querySelector(`tr[data-id="${id}"]`);
  if (row) {
    const newRow = renderOrderRow(updatedOrder);
    row.replaceWith(newRow);
  }

  M.toast({html: `Order status updated to: ${updatedOrder.status}`, classes: 'green'});
});

// Render a single order row
function renderOrderRow(order) {
  const tr = document.createElement('tr');
  tr.dataset.id = order._id;
  tr.innerHTML = `
    <td>${order.orderNumber}</td>
    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
    <td>$${order.total.toFixed(2)}</td>
    <td>${order.status}</td>
    <td>
      <a class="btn-flat blue-text text-darken-1" data-act="update" data-id="${order._id}">
        <i class="material-icons">edit</i>
      </a>
    </td>
  `;
  return tr;
}

// Live updates from server
// If anyone updates an order, update it if present
socket.on('order-updated', (order) => {
  if (!order || !order._id) return;
  const row = orderTableBody.querySelector(`tr[data-id="${order._id}"]`);
  if (row) {
    const newRow = renderOrderRow(order);
    row.replaceWith(newRow);
  }
});

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
});
