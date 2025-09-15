// public/js/cart.js
function getCart() {
  return JSON.parse(localStorage.getItem('bag') || '[]');
}
function setCart(c) {
  localStorage.setItem('bag', JSON.stringify(c));
}

const container = document.getElementById('cart-container');
const summary   = document.getElementById('cart-summary');
const btnClear  = document.getElementById('btn-clear');
const btnCheckout = document.getElementById('btn-checkout');

function renderCart() {
  const cart = getCart();
  container.innerHTML = '';
  summary.innerHTML = '';

  if (!cart.length) {
    container.innerHTML = `<p class="text-muted">👜 Your bag is empty</p>`;
    return;
  }

  let total = 0;
  const html = cart.map(item => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    return `
      <div class="row align-items-center border-bottom py-2">
        <div class="col-2"><img src="${item.image}" class="cart-img"></div>
        <div class="col-4">${item.name}</div>
        <div class="col-2">$${item.price.toFixed(2)}</div>
        <div class="col-2">
          <input type="number" class="form-control form-control-sm qty-input" 
                 data-slug="${item.slug}" value="${item.qty}" min="1">
        </div>
        <div class="col-2 fw-bold">$${lineTotal.toFixed(2)}</div>
      </div>
    `;
  }).join('');
  container.innerHTML = html;

  summary.innerHTML = `<h4>Total: $${total.toFixed(2)}</h4>`;

  // Attach listeners for quantity changes
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const slug = e.target.dataset.slug;
      const newQty = Math.max(1, parseInt(e.target.value) || 1);
      updateQty(slug, newQty);
    });
  });
}

function updateQty(slug, qty) {
  const cart = getCart();
  const item = cart.find(i => i.slug === slug);
  if (item) {
    item.qty = qty;
    setCart(cart);
    renderCart();
  }
}

// Clear
btnClear.addEventListener('click', () => {
  if (confirm("Clear your bag?")) {
    setCart([]);
    renderCart();
  }
});

// Checkout placeholder
btnCheckout.addEventListener('click', () => {
  const cart = getCart();
  if (!cart.length) {
    alert("Your bag is empty.");
    return;
  }
  alert("✅ Checkout placeholder: This is where payment would happen.");
});

renderCart();
