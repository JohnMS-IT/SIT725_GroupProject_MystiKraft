// admin.js
// Admin Panel logic:
// - Load products (GET /api/products)
// - Add product (POST /api/products)
// - Update product (PUT /api/products/:id)
// - Delete product (DELETE /api/products/:id)
// - Search products
// - Live updates via Socket.IO: product-added, product-removed, product-updated

const tBody = document.getElementById('productTableBody');
const form = document.getElementById('addForm');
const editForm = document.getElementById('editForm');
const saveEditBtn = document.getElementById('saveEditBtn');
const searchInput = document.getElementById('searchProducts');

// Store all products for search
let allProducts = [];

// Connect to server via Socket.IO for live updates
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
    <td>${p.stock !== undefined ? p.stock : 'N/A'}</td>
    <td>
      <input type="number" value="${p.stock || 0}" min="0" style="width:60px;text-align:center;" class="stock-input">
      <button class="btn-small black stock-btn" style="margin-left:5px;">Update</button>
    </td>
    <td>
      <a class="btn-flat blue-text text-darken-1" data-act="edit" data-id="${p._id}">
        <i class="material-icons">edit</i>
      </a>
      <a class="btn-flat red-text text-darken-1" data-act="del" data-id="${p._id}">
        <i class="material-icons">delete</i>
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

  // Store all products for search
  allProducts = data.items || [];

  // data.items could be an array of Product docs
  allProducts.forEach(p => tBody.appendChild(renderRow(p)));
}

// Search products by name
function searchProducts(query) {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    // Show all products if search is empty
    tBody.innerHTML = '';
    allProducts.forEach(p => tBody.appendChild(renderRow(p)));
    return;
  }

  // Filter products by name or category
  const filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm) || 
    (p.category && p.category.toLowerCase().includes(searchTerm))
  );

  tBody.innerHTML = '';
  if (filtered.length === 0) {
    tBody.innerHTML = '<tr><td colspan="6" class="center">No products found</td></tr>';
  } else {
    filtered.forEach(p => tBody.appendChild(renderRow(p)));
  }
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

// Handle Edit and Delete clicks (event delegation on <tbody>)
tBody.addEventListener('click', async (e) => {
  // Handle Edit
  const editBtn = e.target.closest('[data-act="edit"]');
  if (editBtn) {
    const id = editBtn.dataset.id;
    const product = allProducts.find(p => p._id === id);
    if (product) {
      openEditModal(product);
    }
    return;
  }

  // Handle Delete
  const delBtn = e.target.closest('[data-act="del"]');
  if (delBtn) {
    const id = delBtn.dataset.id;
    
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast('Delete failed', false);
      return;
    }

    const row = tBody.querySelector(`tr[data-id="${id}"]`);
    if (row) row.remove();
    
    // Remove from allProducts array
    allProducts = allProducts.filter(p => p._id !== id);
    
    toast('Product deleted');
  }
});

// Open edit modal with product data
function openEditModal(product) {
  document.getElementById('editProductId').value = product._id;
  document.getElementById('editName').value = product.name;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editImage').value = product.image;
  document.getElementById('editDescription').value = product.description || '';
  document.getElementById('editStock').value = product.stock || 0;
  document.getElementById('editFeatured').checked = product.featured || false;

  // Update Materialize labels
  M.updateTextFields();

  // Open modal
  const modal = M.Modal.getInstance(document.getElementById('editModal'));
  modal.open();
}

// Handle Save Edit button click
saveEditBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editProductId').value;
  const name = document.getElementById('editName').value.trim();
  const price = document.getElementById('editPrice').value.trim();
  const category = document.getElementById('editCategory').value.trim();
  const image = document.getElementById('editImage').value.trim();
  const description = document.getElementById('editDescription').value.trim();
  const stock = document.getElementById('editStock').value.trim();
  const featured = document.getElementById('editFeatured').checked;

  if (!name || !price || !category || !image) {
    toast('Please fill required fields', false);
    return;
  }

  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, category, image, description, stock, featured })
  });

  if (!res.ok) {
    toast('Failed to update product', false);
    return;
  }

  const updated = await res.json();

  // Update the row in the table
  const row = tBody.querySelector(`tr[data-id="${id}"]`);
  if (row) {
    const newRow = renderRow(updated);
    row.replaceWith(newRow);
  }

  // Update in allProducts array
  const index = allProducts.findIndex(p => p._id === id);
  if (index !== -1) {
    allProducts[index] = updated;
  }

  // Close modal
  const modal = M.Modal.getInstance(document.getElementById('editModal'));
  modal.close();

  toast(`Updated: ${updated.name}`);
});

// Search input listener
searchInput.addEventListener('input', (e) => {
  searchProducts(e.target.value);
});

// Socket event handlers for real-time updates
socket.on('product-added', (p) => {
  if (!p || !p._id) return;
  if (!tBody.querySelector(`tr[data-id="${p._id}"]`)) {
    allProducts.unshift(p);
    tBody.prepend(renderRow(p));
  }
});

// If anyone updates a product, update it if present
socket.on('product-updated', (p) => {
  if (!p || !p._id) return;
  const row = tBody.querySelector(`tr[data-id="${p._id}"]`);
  if (row) {
    const newRow = renderRow(p);
    row.replaceWith(newRow);
  }
  // Update in allProducts array
  const index = allProducts.findIndex(prod => prod._id === p._id);
  if (index !== -1) {
    allProducts[index] = p;
  }
});

// If anyone updates a product, update it if present
socket.on('product-updated', (p) => {
  if (!p || !p._id) return;
  const row = tBody.querySelector(`tr[data-id="${p._id}"]`);
  if (row) {
    const newRow = renderRow(p);
    row.replaceWith(newRow);
  }
  // Update in allProducts array
  const index = allProducts.findIndex(prod => prod._id === p._id);
  if (index !== -1) {
    allProducts[index] = p;
  }
});

socket.on('product-removed', ({ id }) => {
  const row = tBody.querySelector(`tr[data-id="${id}"]`);
  if (row) row.remove();
  // Remove from allProducts array
  allProducts = allProducts.filter(p => p._id !== id);
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
  // Initialize Materialize components
  M.updateTextFields();
  M.Modal.init(document.querySelectorAll('.modal'));
  
  loadProducts();
});