// guestcheckout.js - Guest checkout (manual fill, local/cart fallback)
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.FormSelect.init(document.querySelectorAll('select'));
    M.Modal.init(document.querySelectorAll('.modal'));
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));

    // DOM elements
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('btn-place-order');
    const orderItemsContainer = document.getElementById('order-items');
    const orderTotalAmount = document.getElementById('order-total-amount');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const creditCardSection = document.getElementById('creditCardSection');

    let cartData = [];

    // Init
    init();

    // Event listeners
    placeOrderBtn.addEventListener('click', handleOrderSubmission);
    if (paymentMethodSelect) paymentMethodSelect.addEventListener('change', handlePaymentMethodChange);

    function handlePaymentMethodChange() {
        const selected = paymentMethodSelect.value;
        if (selected === 'credit_card') {
            creditCardSection.classList.remove('hide');
        } else {
            creditCardSection.classList.add('hide');
        }
        M.updateTextFields();
    }

    async function init() {
        try {
            await loadCartData();
            if (cartData.length > 0) {
                placeOrderBtn.disabled = false;
            } else {
                placeOrderBtn.disabled = true;
            }
        } catch (err) {
            console.error('Init error:', err);
            M.toast({html: 'Error loading cart', classes: 'red'});
        }
    }

    // Try server cart (no credentials) then fallback to localStorage 'cart'
    async function loadCartData() {
        // First attempt: fetch server cart (some systems support guest cart via session or token)
        try {
            const res = await fetch('/api/cart');
            if (res.ok) {
                const json = await res.json();
                cartData = json.items || [];
                renderOrderSummary();
                return;
            }
            // else fallthrough to localStorage
        } catch (err) {
            // network or server error -> fallback to localStorage
            console.warn('Server cart fetch failed, falling back to localStorage', err);
        }

        // Fallback: read from localStorage
        try {
            const raw = localStorage.getItem('cart');
            if (raw) {
                // Expecting either array of items or object { items: [...] }
                const parsed = JSON.parse(raw);
                cartData = Array.isArray(parsed) ? parsed : (parsed.items || []);
            } else {
                cartData = [];
            }
        } catch (err) {
            console.error('Error parsing localStorage cart:', err);
            cartData = [];
        }

        renderOrderSummary();
    }

    function renderOrderSummary() {
        if (!cartData || cartData.length === 0) {
            orderItemsContainer.innerHTML = '<p class="center-align red-text">Your cart is empty</p>';
            orderTotalAmount.textContent = '$0.00';
            placeOrderBtn.disabled = true;
            return;
        }

        let html = '';
        let total = 0;

        cartData.forEach(item => {
            // item may be { productId: {_id, name, image}, quantity, price } or { id, name, price, qty }
            const name = item.productId?.name || item.name || 'Product';
            const img = item.productId?.image || item.image || '/images/placeholder.jpg';
            const qty = item.quantity ?? item.qty ?? 1;
            const price = item.price ?? item.unitPrice ?? 0;
            const line = price * qty;
            total += line;

            html += `
                <div class="order-item">
                  <div class="row valign-wrapper" style="margin-bottom: 0;">
                    <div class="col s3">
                      <img src="${img}" alt="${name}" style="width:50px;height:50px;object-fit:cover;">
                    </div>
                    <div class="col s6">
                      <strong>${name}</strong><br><small>Qty: ${qty}</small>
                    </div>
                    <div class="col s3 right-align">
                      $${line.toFixed(2)}
                    </div>
                  </div>
                </div>
            `;
        });

        orderItemsContainer.innerHTML = html;
        orderTotalAmount.textContent = `$${total.toFixed(2)}`;
    }

    async function handleOrderSubmission(e) {
        // Validate form
        if (!checkoutForm.checkValidity()) {
            M.toast({html: 'Please fill all required fields correctly', classes: 'red'});
            return;
        }

        if (!cartData.length) {
            M.toast({html: 'Your cart is empty', classes: 'red'});
            return;
        }

        const paymentMethod = document.getElementById('paymentMethod').value;
        if (!paymentMethod) {
            M.toast({html: 'Please select a payment method', classes: 'red'});
            return;
        }

        if (paymentMethod === 'credit_card') {
            const cardHolderName = document.getElementById('cardHolderName').value.trim();
            const cardNumber = document.getElementById('cardNumber').value.trim();
            const expiryDate = document.getElementById('expiryDate').value.trim();
            if (!cardHolderName || !cardNumber || !expiryDate) {
                M.toast({html: 'Please fill all credit card information', classes: 'red'});
                return;
            }
        }

        // Prepare order payload
        const orderData = {
            guest: true,
            customerInfo: {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('checkoutEmail').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: {
                    street: document.getElementById('street').value.trim(),
                    city: document.getElementById('city').value.trim(),
                    state: document.getElementById('state').value.trim(),
                    zipCode: document.getElementById('zipCode').value.trim(),
                    country: document.getElementById('country').value.trim() || 'Australia'
                }
            },
            paymentMethod: paymentMethod,
            items: cartData.map(item => ({
                productId: item.productId?._id || item.productId || item.id,
                quantity: item.quantity ?? item.qty ?? 1,
                price: item.price ?? item.unitPrice ?? 0
            }))
        };

        if (paymentMethod === 'credit_card') {
            orderData.creditCard = {
                cardHolderName: document.getElementById('cardHolderName').value.trim(),
                cardNumber: document.getElementById('cardNumber').value.trim(),
                expiryDate: document.getElementById('expiryDate').value.trim()
            };
        }

        // Submit order
        try {
            placeOrderBtn.disabled = true;
            const originalText = placeOrderBtn.innerHTML;
            placeOrderBtn.innerHTML = 'Processing...';

            // Guest orders: do not send credentials by default
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const result = await res.json();
                M.toast({html: 'Order placed successfully!', classes: 'green', displayLength: 4000});
                // Clear local cart
                clearLocalCart();

                // Also attempt to clear server-side cart (non-blocking)
                try {
                    await fetch('/api/cart/clear', { method: 'POST' });
                } catch (err) {
                    // ignore
                    console.warn('Server-side cart clear attempt failed:', err);
                }

                // Redirect to home or order confirmation (if backend returns a confirmation URL)
                setTimeout(() => {
                    if (result && result.confirmationUrl) {
                        window.location.href = result.confirmationUrl;
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1200);
            } else {
                const errBody = await res.json().catch(()=>({}));
                const msg = errBody.error || 'Failed to place order';
                throw new Error(msg);
            }
        } catch (err) {
            console.error('Order submission error:', err);
            M.toast({html: `Error: ${err.message}`, classes: 'red'});
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = 'Complete Order';
        }
    }

    function clearLocalCart() {
        try {
            localStorage.removeItem('cart');
        } catch (err) {
            console.warn('Failed to clear local cart:', err);
        }
    }
});
