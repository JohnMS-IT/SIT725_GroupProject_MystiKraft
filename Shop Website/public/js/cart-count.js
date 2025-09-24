// Keeps "My Cart" badge updated across all pages and shows toasts

// Get cart from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('bag') || '[]');
}

// Update the cart count badge in navbar
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

// Show a Materialize toast message when cart is updated
function notifyCartChange(message, success = true) {
  if (M && M.toast) {
    M.toast({
      html: message,
      classes: success ? 'green darken-1' : 'red darken-1'
    });
  } else {
    alert(message);
  }
}

// Run immediately to set initial badge count
updateCartCount();

// Update count if localStorage changes in another tab
window.addEventListener('storage', updateCartCount);

// Expose helpers for other scripts (product.js, cart.js)
window.CartUtils = {
  getCart,
  updateCartCount,
  notifyCartChange
};
