// checkout.js - Checkout functionality for logged-in users
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Modal.init(document.querySelectorAll('.modal'));
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));
    M.FormSelect.init(document.querySelectorAll('select'));
    
    // DOM Elements
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('btn-place-order');
    const orderItemsContainer = document.getElementById('order-items');
    const orderTotalAmount = document.getElementById('order-total-amount');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const creditCardSection = document.getElementById('creditCardSection');
    
    let cartData = [];
    let userProfile = null;

    // Initialize checkout process
    initializeCheckout();

    // Event Listeners
    placeOrderBtn.addEventListener('click', handleOrderSubmission);
    
    // Handle payment method change to show/hide credit card fields
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', handlePaymentMethodChange);
    }

    // Handle payment method change
    function handlePaymentMethodChange() {
        const selectedMethod = paymentMethodSelect.value;
        if (selectedMethod === 'credit_card') {
            creditCardSection.classList.remove('hide');
        } else {
            creditCardSection.classList.add('hide');
        }
        M.updateTextFields();
    }

    // Initialize checkout process
    async function initializeCheckout() {
        try {
            // Check authentication first
            const isAuthenticated = await checkAuthentication();
            if (!isAuthenticated) {
                redirectToGuestCheckout();
                return;
            }

            // Load user profile and cart data in parallel
            await Promise.all([
                loadUserProfile(),
                loadCartData()
            ]);

            // Enable place order button if we have cart items
            if (cartData.length > 0) {
                placeOrderBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error initializing checkout:', error);
            M.toast({html: 'Error loading checkout data', classes: 'red'});
        }
    }

    // Check if user is authenticated
    async function checkAuthentication() {
        try {
            const response = await fetch('/api/auth/user', {
                credentials: 'include'
            });
            return response.ok;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    // Load user profile data
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/user/profile', {
                credentials: 'include'
            });
            
            if (response.ok) {
                userProfile = await response.json();
                populateUserInfo();
            } else {
                throw new Error('Failed to load user profile');
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            M.toast({html: 'Error loading user information', classes: 'red'});
        }
    }

    // Load cart data
    async function loadCartData() {
        try {
            const response = await fetch('/api/cart', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const cart = await response.json();
                cartData = cart.items || [];
                renderOrderSummary();
            } else {
                throw new Error('Failed to load cart data');
            }
        } catch (error) {
            console.error('Error loading cart data:', error);
            M.toast({html: 'Error loading cart items', classes: 'red'});
        }
    }

    // Populate form with user information
    function populateUserInfo() {
        if (!userProfile) return;

        // Personal Information
        document.getElementById('firstName').value = userProfile.firstName || '';
        document.getElementById('lastName').value = userProfile.lastName || '';
        document.getElementById('checkoutEmail').value = userProfile.email || '';
        document.getElementById('phone').value = userProfile.phone || '';

        // Shipping Address
        if (userProfile.shippingAddress) {
            document.getElementById('street').value = userProfile.shippingAddress.street || '';
            document.getElementById('city').value = userProfile.shippingAddress.city || '';
            document.getElementById('state').value = userProfile.shippingAddress.state || '';
            document.getElementById('zipCode').value = userProfile.shippingAddress.zipCode || '';
            document.getElementById('country').value = userProfile.shippingAddress.country || 'Australia';
        }

        // Payment Method
        if (userProfile.paymentMethod) {
            document.getElementById('paymentMethod').value = userProfile.paymentMethod;
            M.FormSelect.init(document.querySelectorAll('select'));
            
            if (userProfile.paymentMethod === 'credit_card') {
                creditCardSection.classList.remove('hide');
                if (userProfile.creditCard) {
                    const card = userProfile.creditCard;
                    if (card.cardHolderName) document.getElementById('cardHolderName').value = card.cardHolderName;
                    if (card.cardNumber) document.getElementById('cardNumber').value = card.cardNumber;
                    if (card.expiryDate) document.getElementById('expiryDate').value = card.expiryDate;
                }
            }
        }

        // Update Materialize labels
        M.updateTextFields();
    }

    // Render order summary with cart items
    function renderOrderSummary() {
        if (!cartData.length) {
            orderItemsContainer.innerHTML = '<p class="center-align red-text">Your cart is empty</p>';
            orderTotalAmount.textContent = '$0.00';
            placeOrderBtn.disabled = true;
            return;
        }

        let itemsHTML = '';
        let orderTotal = 0;

        cartData.forEach(item => {
            const lineTotal = item.price * item.quantity;
            orderTotal += lineTotal;

            itemsHTML += `
                <div class="order-item">
                    <div class="row valign-wrapper" style="margin-bottom: 0;">
                        <div class="col s3">
                            <img src="${item.productId?.image || '/images/placeholder.jpg'}" alt="${item.productId?.name || 'Product'}" 
                                 style="width: 50px; height: 50px; object-fit: cover;">
                        </div>
                        <div class="col s6">
                            <strong>${item.productId?.name || 'Unknown Product'}</strong>
                            <br>
                            <small>Qty: ${item.quantity}</small>
                        </div>
                        <div class="col s3 right-align">
                            $${lineTotal.toFixed(2)}
                        </div>
                    </div>
                </div>
            `;
        });

        orderItemsContainer.innerHTML = itemsHTML;
        orderTotalAmount.textContent = `$${orderTotal.toFixed(2)}`;
    }

    // Handle order submission
    async function handleOrderSubmission() {
        // Validate form
        if (!checkoutForm.checkValidity()) {
            M.toast({html: 'Please fill all required fields correctly', classes: 'red'});
            return;
        }

        if (!cartData.length) {
            M.toast({html: 'Your cart is empty', classes: 'red'});
            return;
        }

        // Validate payment method
        const paymentMethod = document.getElementById('paymentMethod').value;
        if (!paymentMethod) {
            M.toast({html: 'Please select a payment method', classes: 'red'});
            return;
        }

        // Validate credit card info if selected
        if (paymentMethod === 'credit_card') {
            const cardHolderName = document.getElementById('cardHolderName').value;
            const cardNumber = document.getElementById('cardNumber').value;
            const expiryDate = document.getElementById('expiryDate').value;
            
            if (!cardHolderName || !cardNumber || !expiryDate) {
                M.toast({html: 'Please fill all credit card information', classes: 'red'});
                return;
            }
        }

        try {
            // Prepare order data
            const orderData = {
                customerInfo: {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('checkoutEmail').value,
                    phone: document.getElementById('phone').value,
                    address: {
                        street: document.getElementById('street').value,
                        city: document.getElementById('city').value,
                        state: document.getElementById('state').value,
                        zipCode: document.getElementById('zipCode').value,
                        country: document.getElementById('country').value
                    }
                },
                paymentMethod: paymentMethod,
                items: cartData.map(item => ({
                    productId: item.productId?._id || item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            // Add credit card info if payment method is credit card
            if (paymentMethod === 'credit_card') {
                orderData.creditCard = {
                    cardHolderName: document.getElementById('cardHolderName').value,
                    cardNumber: document.getElementById('cardNumber').value,
                    expiryDate: document.getElementById('expiryDate').value
                };
            }

            // Show loading state
            placeOrderBtn.disabled = true;
            placeOrderBtn.innerHTML = 'Processing...';

            // Submit order
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const orderResult = await response.json();
                
                M.toast({
                    html: 'Order placed successfully!',
                    classes: 'green',
                    displayLength: 5000
                });

                // Update user profile with any changes
                await updateUserProfile();

                // Clear cart
                await clearCart();

                // Redirect to home page after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);

            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            M.toast({html: `Error: ${error.message}`, classes: 'red'});
            
            // Reset button state
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = 'Complete Order';
        }
    }

    // Update user profile with any changes made during checkout
    async function updateUserProfile() {
        try {
            const profileData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('checkoutEmail').value,
                phone: document.getElementById('phone').value,
                shippingAddress: {
                    street: document.getElementById('street').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zipCode: document.getElementById('zipCode').value,
                    country: document.getElementById('country').value
                },
                paymentMethod: document.getElementById('paymentMethod').value
            };

            // Add credit card info if payment method is credit card
            if (profileData.paymentMethod === 'credit_card') {
                profileData.creditCard = {
                    cardHolderName: document.getElementById('cardHolderName').value,
                    cardNumber: document.getElementById('cardNumber').value,
                    expiryDate: document.getElementById('expiryDate').value
                };
            }

            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(profileData)
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            // Non-critical error, don't show to user
        }
    }

    // Clear cart after successful order
    async function clearCart() {
        try {
            await fetch('/api/cart/clear', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }

    // Redirect to guest checkout if user is not authenticated
    function redirectToGuestCheckout() {
        M.toast({html: 'Redirecting to guest checkout', classes: 'orange'});
        setTimeout(() => {
            window.location.href = 'guest-checkout.html';
        }, 1000);
    }
});