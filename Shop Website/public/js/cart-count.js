// Cart Utils for badge and notifications (API-based)

// Fetch cart from backend
async function fetchCart() {
  try {
    const res = await fetch('/api/cart');
    if (!res.ok) throw new Error('Failed to fetch cart');
    const cart = await res.json();
    return cart.items || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Update cart count badge in navbar
async function updateCartCount() {
  const cart = await fetchCart();
  const count = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

// Show toast notification
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

// Expose globally
window.CartUtils = {
  fetchCart,
  updateCartCount,
  notifyCartChange
};

// Initial update
updateCartCount();
