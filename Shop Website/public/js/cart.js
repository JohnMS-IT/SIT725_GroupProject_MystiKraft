document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cart-container');
  const summary = document.getElementById('cart-summary');
  const btnClear = document.getElementById('btn-clear');
  const btnCheckout = document.getElementById('btn-checkout');

  let cartData = [];

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
          <input type="number" class="qty-input browser-default" data-id="${item.productId._id}" value="${item.quantity}" min="1" max="${item.productId.stock}" style="width:60px; text-align:center;">
        </div>
        <div class="col s2"><strong class="line-total">$${lineTotal.toFixed(2)}</strong></div>
      `;
      container.appendChild(row);
    });

    summary.innerHTML = `<h5>Total: $${total.toFixed(2)}</h5>`;
    bindQtyInputs();
  };

  const bindQtyInputs = () => {
    document.querySelectorAll('.qty-input').forEach(input => {
      input.onchange = async (e) => {
        const id = e.target.dataset.id;
        let newQty = Math.max(1, parseInt(e.target.value) || 1);
        const item = cartData.find(i => i.productId._id === id);
        if (!item) return;

        newQty = Math.min(newQty, item.productId.stock); // 限制 <= stock
        e.target.value = newQty;

        try {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id, quantity: newQty })
          });

          item.quantity = newQty;

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

  btnCheckout.addEventListener('click', async () => {
    if (!cartData.length) {
      CartUtils.notifyCartChange('Your bag is empty', false);
      return;
    }

    try {
      const authResponse = await fetch('/api/auth/user');
      if (authResponse.ok) {
        window.location.href = 'checkout.html';
      } else {
        window.location.href = 'guestCheckout.html';
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      window.location.href = 'guestCheckout.html';
    }
  });

  loadCart();
});
