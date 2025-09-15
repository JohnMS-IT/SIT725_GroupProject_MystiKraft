// public/js/cart-count.js
function getCart() {
  return JSON.parse(localStorage.getItem('bag') || '[]');
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

// Run immediately and whenever storage changes
updateCartCount();
window.addEventListener('storage', updateCartCount);
