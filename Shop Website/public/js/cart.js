// Handles cart page: display items, update quantities, clear bag, checkout placeholder

// Helpers for localStorage cart
function getCart() {
  return JSON.parse(localStorage.getItem('bag') || '[]');
}
function setCart(c) {
  localStorage.setItem('bag', JSON.stringify(c));
  if (window.CartUtils) {
    window.CartUtils.updateCartCount(); // update navbar badge
  }
}

// References to DOM elements
const container = document.getElementById('cart-container'); // items 
const summary   = document.getElementById('cart-summary');   // total 
const btnClear  = document.getElementById('btn-clear');
const btnCheckout = document.getElementById('btn-checkout');

// Render cart contents
function renderCart() {
  const cart = getCart();
  container.innerHTML = '';
  summary.innerHTML = '';

  // Empty bag case
  if (!cart.length) {
    container.innerHTML = `<p class="grey-text"> Your bag is empty</p>`;
    return;
  }

  // Build HTML for each item
  let total = 0;
  const html = cart.map(item => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    return `
      <div class="row valign-wrapper" style="border-bottom: 1px solid #e0e0e0; padding: 10px 0;">
        <div class="col s2"><img src="${item.image}" class="cart-img"></div>
        <div class="col s4">${item.name}</div>
        <div class="col s2">$${item.price.toFixed(2)}</div>
        <div class="col s2">
          <input type="number" class="qty-input browser-default" 
                 data-slug="${item.slug}" value="${item.qty}" min="1">
        </div>
        <div class="col s2"><strong>$${lineTotal.toFixed(2)}</strong></div>
      </div>
    `;
  }).join('');
  container.innerHTML = html;

  // Show total
  summary.innerHTML = `<h5>Total: $${total.toFixed(2)}</h5>`;

  // Quantity change listeners
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const slug = e.target.dataset.slug;
      const newQty = Math.max(1, parseInt(e.target.value) || 1);
      updateQty(slug, newQty);
      if (window.CartUtils) {
        window.CartUtils.notifyCartChange(`Updated quantity for ${slug} to ${newQty}`);
      }
    });
  });
}

// Update quantity for one item
function updateQty(slug, qty) {
  const cart = getCart();
  const item = cart.find(i => i.slug === slug);
  if (item) {
    item.qty = qty;
    setCart(cart);
    renderCart(); // re-render to update totals
  }
}

// Clear bag button
btnClear.addEventListener('click', () => {
  if (window.CartUtils) {
    window.CartUtils.notifyCartChange("👜 Bag cleared", false);
  }
  setCart([]);
  renderCart();
});

// Checkout button (placeholder)
btnCheckout.addEventListener('click', () => {
  const cart = getCart();
  if (!cart.length) {
    if (window.CartUtils) {
      window.CartUtils.notifyCartChange(" Your bag is empty", false);
    }
    return;
  }
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  if (window.CartUtils) {
    window.CartUtils.notifyCartChange(`Checkout placeholder — ${totalItems} item(s) in your bag.`);
  }
});

// Initial render
renderCart();
