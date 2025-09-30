// cart.js - My Bag page: fetch cart from backend, update qty, clear cart
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cart-container');
  const summary = document.getElementById('cart-summary');
  const btnClear = document.getElementById('btn-clear');
  const btnCheckout = document.getElementById('btn-checkout');

  let cartData = [];

  // Render cart items
  const renderCart = () => {
    container.innerHTML = '';
    summary.innerHTML = '';

    if (!cartData.length) {
      container.innerHTML = `<p class="grey-text">Your bag is empty</p>`;
      summary.innerHTML = `<h5>Total: $0.00</h5>`;
      return;
    }

    let total = 0;
    cartData.forEach(item => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;

      const row = document.createElement('div');
      row.className = 'row valign-wrapper';
      row.style.borderBottom = '1px solid #e0e0e0';
      row.style.padding = '10px 0';
      row.innerHTML = `
        <div class="col s2"><img src="${item.productId.image}" class="cart-img"></div>
        <div class="col s4">${item.productId.name}</div>
        <div class="col s2"><strong>$${item.price.toFixed(2)}</strong></div>
        <div class="col s2">
          <input type="number" class="qty-input browser-default" data-id="${item.productId._id}" value="${item.quantity}" min="1" style="width:60px; text-align:center;">
        </div>
        <div class="col s2"><strong class="line-total">$${lineTotal.toFixed(2)}</strong></div>
      `;
      container.appendChild(row);
    });

    summary.innerHTML = `<h5>Total: $${total.toFixed(2)}</h5>`;

    bindQtyInputs();
  };

  // Bind quantity input events
  const bindQtyInputs = () => {
    document.querySelectorAll('.qty-input').forEach(input => {
      input.onchange = async (e) => {
        const id = e.target.dataset.id;
        const newQty = Math.max(1, parseInt(e.target.value) || 1);

        try {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id, quantity: newQty })
          });

          const item = cartData.find(i => i.productId._id === id);
          if (item) item.quantity = newQty;

          const lineTotalEl = e.target.closest('.row').querySelector('.line-total');
          lineTotalEl.textContent = `$${(item.price * newQty).toFixed(2)}`;

          const total = cartData.reduce((sum, i) => sum + i.price * i.quantity, 0);
          summary.innerHTML = `<h5>Total: $${total.toFixed(2)}</h5>`;

          CartUtils.updateCartCount();
          CartUtils.notifyCartChange('Quantity updated');
        } catch (err) {
          console.error(err);
          CartUtils.notifyCartChange('Failed to update quantity', false);
        }
      };
    });
  };

  // Load cart data from backend
  const loadCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const cart = await res.json();
      cartData = cart.items || [];
      renderCart();
    } catch (err) {
      console.error(err);
    }
  };

  // Clear cart
  btnClear.addEventListener('click', async () => {
    try {
      await fetch('/api/cart', { method: 'DELETE' });
      cartData = [];
      renderCart();
      CartUtils.updateCartCount();
      CartUtils.notifyCartChange('Bag cleared', false);
    } catch (err) {
      console.error(err);
      CartUtils.notifyCartChange('Failed to clear bag', false);
    }
  });

  // Checkout - Updated logic to handle both logged-in and guest users
  btnCheckout.addEventListener('click', async () => {
    if (!cartData.length) {
      CartUtils.notifyCartChange('Your bag is empty', false);
      return;
    }

    try {
      // Check if user is authenticated
      const authResponse = await fetch('/api/auth/user');
      
      if (authResponse.ok) {
        // User is logged in - redirect to checkout.html
        window.location.href = 'checkout.html';
      } else {
        // User is not logged in - redirect to guest-checkout.html
        window.location.href = 'guestCheckout.html';
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // If auth check fails, default to guest checkout
      window.location.href = 'guestCheckout.html';
    }
  });

  loadCart();
});