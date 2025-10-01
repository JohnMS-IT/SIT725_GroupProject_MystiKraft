// admin.js
const tBody = document.getElementById('productTableBody');
const form = document.getElementById('addForm');
const socket = io();
console.log('[ADMIN SOCKET] Socket.IO connecting...');
socket.on('connect', () => {
  console.log('[ADMIN SOCKET] Connected! Socket ID:', socket.id);
});
socket.on('disconnect', (reason) => {
  console.log('[ADMIN SOCKET] Disconnected:', reason);
});

// Toast helper function
function toast(msg, ok = true) {
  if (window.CartUtils && window.CartUtils.notifyCartChange) {
    return window.CartUtils.notifyCartChange(msg, ok);
  }
  M.toast({ html: msg, classes: ok ? 'green darken-1' : 'red darken-1' });
}

// Render table row for product
function renderRow(p) {
  const tr = document.createElement('tr');
  tr.dataset.id = p._id;
  tr.innerHTML = `
    <td style="width:72px">
      <img src="${p.image}" alt="${p.name}"
           style="width:64px;height:64px;object-fit:cover;border-radius:6px;">
    </td>
    <td>${p.name}</td>
    <td>$${Number(p.price).toFixed(2)}</td>
    <td>${p.category}</td>
    <td>${p.slug || ''}</td>
    <td>
      <input type="number" value="${p.stock || 0}" min="0" style="width:60px;text-align:center;" class="stock-input">
      <button class="btn-small black stock-btn" style="margin-left:5px;">Update</button>
    </td>
    <td>
      <a class="btn-flat red-text text-darken-1" data-act="del" data-id="${p._id}">
        <i class="material-icons left">delete</i>Delete
      </a>
    </td>
  `;

  // Bind stock update event
  const stockBtn = tr.querySelector('.stock-btn');
  const stockInput = tr.querySelector('.stock-input');
  stockBtn.addEventListener('click', async () => {
    const newStock = Number(stockInput.value);
    if (isNaN(newStock) || newStock < 0) {
      toast('Invalid stock', false);
      return;
    }
    try {
      const res = await fetch(`/api/products/${p._id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      toast(`Stock updated: ${p.name} = ${data.stock}`);
    } catch (err) {
      console.error(err);
      toast('Failed to update stock', false);
    }
  });
  return tr;
}

// Load products from API
async function loadProducts() {
  tBody.innerHTML = '<tr><td colspan="7">Loading…</td></tr>';
  const res = await fetch('/api/products');
  if (!res.ok) {
    tBody.innerHTML = '<tr><td colspan="7" class="red-text">Failed to load products</td></tr>';
    return;
  }
  const data = await res.json();
  tBody.innerHTML = '';
  data.items.forEach(p => tBody.appendChild(renderRow(p)));
}

// Handle add product form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const price = document.getElementById('price').value.trim();
  const category = document.getElementById('category').value.trim();
  const image = document.getElementById('image').value.trim();
  const description = document.getElementById('description').value.trim();
  const stock = document.getElementById('stock') ? document.getElementById('stock').value.trim() : 0;

  if (!name || !price || !category || !image) {
    toast('Please fill required fields', false);
    return;
  }

  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, category, image, description, stock })
  });

  if (!res.ok) {
    toast('Failed to add product', false);
    return;
  }

  const p = await res.json();
  tBody.prepend(renderRow(p));
  form.reset();
  M.updateTextFields();
  toast(`Added: ${p.name}`);
});

// Handle product deletion
tBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act="del"]');
  if (!btn) return;
  const id = btn.dataset.id;
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    toast('Delete failed', false);
    return;
  }
  const row = tBody.querySelector(`tr[data-id="${id}"]`);
  if (row) row.remove();
  toast('Product deleted');
});

// Socket event handlers for real-time updates
socket.on('product-added', (p) => {
  if (!tBody.querySelector(`tr[data-id="${p._id}"]`)) tBody.prepend(renderRow(p));
});

socket.on('product-removed', ({ id }) => {
  const row = tBody.querySelector(`tr[data-id="${id}"]`);
  if (row) row.remove();
});

// Listen for stock alerts - but only show admin-specific notifications
socket.on('stock-alert', (alert) => {
  console.log('[ADMIN SOCKET] stock-alert event received:', alert);
  // Don't show the same notifications as users see
  // Instead, log them for admin reference
  if (alert.type === 'restocked') {
    console.log(`[ADMIN SOCKET] Admin: ${alert.productName} was restocked to ${alert.stock}`);
  } else if (alert.type === 'low-stock') {
    console.log(`[ADMIN SOCKET] Admin: ${alert.productName} is low on stock (${alert.stock})`);
  }
});

// Listen for stock updates to refresh UI
socket.on('stock-updated', (data) => {
  const row = tBody.querySelector(`tr[data-id="${data.id}"]`);
  if (row) {
    const stockInput = row.querySelector('.stock-input');
    if (stockInput) {
      stockInput.value = data.stock;
    }
  }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  M.updateTextFields();
  loadProducts();
});