// admin.js
// Admin Panel logic:
// - Load products (GET /api/products)
// - Add product (POST /api/products)
// - Delete product (DELETE /api/products/:id)
// - Live updates via Socket.IO: product-added, product-removed

const tBody = document.getElementById('productTableBody');
const form = document.getElementById('addForm');

// Connect to server via Socket.IO for live updates
const socket = io();

// Toast helper (uses your CartUtils if present, else Materialize directly)
function toast(msg, ok = true) {
  if (window.CartUtils && window.CartUtils.notifyCartChange) {
    return window.CartUtils.notifyCartChange(msg, ok);
  }
  M.toast({ html: msg, classes: ok ? 'green darken-1' : 'red darken-1' });
}

// Render one <tr> for the product table
function renderRow(p) {
  const tr = document.createElement('tr');
  tr.dataset.id = p._id; // so we can find/remove it later
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
      <a class="btn-flat red-text text-darken-1" data-act="del" data-id="${p._id}">
        <i class="material-icons left">delete</i>Delete
      </a>
    </td>
  `;
  return tr;
}

// Load current products (first page, large limit)
async function loadProducts() {
  tBody.innerHTML = '<tr><td colspan="6">Loading…</td></tr>';

  // reuse existing API with pagination
  const res = await fetch('/api/products?limit=200&page=1&sort=newest');
  if (!res.ok) {
    tBody.innerHTML = '<tr><td colspan="6" class="red-text">Failed to load products</td></tr>';
    return;
  }
  const data = await res.json();
  tBody.innerHTML = '';

  // data.items could be an array of Product docs
  data.items.forEach(p => tBody.appendChild(renderRow(p)));
}

// Handle Add Product form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Grab values from form fields
  const name = document.getElementById('name').value.trim();
  const price = document.getElementById('price').value.trim();
  const category = document.getElementById('category').value.trim();
  const image = document.getElementById('image').value.trim();
  const description = document.getElementById('description').value.trim();

  // validation
  if (!name || !price || !category || !image) {
    toast('Please fill required fields', false);
    return;
  }

  // POST to backend
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, category, image, description })
  });

  if (!res.ok) {
    toast('Failed to add product', false);
    return;
  }

  const p = await res.json();

  // Prepend row to table immediately (server also broadcasts via socket)
  tBody.prepend(renderRow(p));

  // Reset form
  form.reset();
  // Materialize needs this to keep labels in the right place after reset
  M.updateTextFields();

  toast(`Added: ${p.name}`);
});

// Handle Delete clicks (event delegation on <tbody>)
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

// Live updates from server
// If anyone adds a product, insert it if we don't already have it
socket.on('product-added', (p) => {
  if (!p || !p._id) return;
  if (!tBody.querySelector(`tr[data-id="${p._id}"]`)) {
    tBody.prepend(renderRow(p));
  }
});

// If anyone deletes a product, remove it if present
socket.on('product-removed', ({ id }) => {
  const row = tBody.querySelector(`tr[data-id="${id}"]`);
  if (row) row.remove();
});

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Materialize input label alignment
  M.updateTextFields();
  loadProducts();
});
