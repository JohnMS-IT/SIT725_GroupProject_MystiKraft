// profile.js - User profile management for MystiKraft
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    M.Modal.init(document.querySelectorAll('.modal'));
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));
    M.FormSelect.init(document.querySelectorAll('select'));

    // DOM Elements
    const personalInfoForm = document.getElementById('personalInfoForm');
    const shippingAddressForm = document.getElementById('shippingAddressForm');
    const paymentMethodForm = document.getElementById('paymentMethodForm');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const creditCardSection = document.getElementById('creditCardSection');
    const profileEmailInput = document.getElementById('profileEmail');

    // Override logout button behavior for profile page
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirect to index.html first, then logout will be handled there
            window.location.href = 'index.html';
        });
    }

    // Load user profile from backend
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Important for session cookies
            });

            if (response.ok) {
                const user = await response.json();
                populateFormData(user);
            } else if (response.status === 401) {
                // User not authenticated, redirect to login
                window.location.href = '/index.html';
            } else {
                console.error('Failed to load user profile');
                M.toast({html: 'Failed to load user profile', classes: 'red'});
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            M.toast({html: 'Error loading user profile', classes: 'red'});
        }
    }

    // Populate form with user data
    function populateFormData(user) {
        // Personal Information
        if (user.firstName) document.getElementById('firstName').value = user.firstName;
        if (user.lastName) document.getElementById('lastName').value = user.lastName;
        if (user.email) profileEmailInput.value = user.email;
        if (user.phone) document.getElementById('phone').value = user.phone;

        // Shipping Address
        if (user.shippingAddress) {
            const addr = user.shippingAddress;
            if (addr.street) document.getElementById('addressStreet').value = addr.street;
            if (addr.city) document.getElementById('addressCity').value = addr.city;
            if (addr.state) document.getElementById('addressState').value = addr.state;
            if (addr.zipCode) document.getElementById('addressZipCode').value = addr.zipCode;
            if (addr.country) document.getElementById('addressCountry').value = addr.country;
        }

        // Payment Method
        if (user.paymentMethod) {
            document.getElementById('paymentMethod').value = user.paymentMethod;
            M.FormSelect.init(document.querySelectorAll('select'));
            
            // Show/hide credit card section based on selected payment method
            if (user.paymentMethod === 'credit_card') {
                creditCardSection.classList.remove('hide');
                if (user.creditCard) {
                    const card = user.creditCard;
                    if (card.cardHolderName) document.getElementById('cardHolderName').value = card.cardHolderName;
                    if (card.cardNumber) document.getElementById('cardNumber').value = card.cardNumber;
                    if (card.expiryDate) document.getElementById('expiryDate').value = card.expiryDate;
                }
            } else {
                creditCardSection.classList.add('hide');
            }
        }

        // Update Materialize labels
        M.updateTextFields();
    }

    // Set initial email (fallback if not authenticated)
    function setInitialEmail() {
        const userEmailElement = document.getElementById('userEmail');
        
        if (userEmailElement && userEmailElement.textContent && userEmailElement.textContent !== 'User') {
            profileEmailInput.value = userEmailElement.textContent;
            M.updateTextFields();
        }
    }

    // Load user order history
    async function loadOrderHistory() {
        try {
            const response = await fetch('/api/orders/user/history', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Important for session cookies
            });

            if (response.ok) {
                const orders = await response.json();
                renderOrderHistory(orders);
            } else if (response.status === 401) {
                // User not authenticated, redirect to login
                window.location.href = '/index.html';
            } else {
                console.error('Failed to load order history');
                M.toast({html: 'Failed to load order history', classes: 'red'});
            }
        } catch (error) {
            console.error('Error loading order history:', error);
            M.toast({html: 'Error loading order history', classes: 'red'});
        }
    }

    // Render order history to the DOM
    function renderOrderHistory(orders) {
        const orderList = document.getElementById('orderHistoryList');
        orderList.innerHTML = '';

        if (orders.length === 0) {
            orderList.innerHTML = '<li class="collection-item">No orders found</li>';
            return;
        }

        orders.forEach(order => {
            const li = document.createElement('li');
            li.className = 'collection-item';
            li.innerHTML = `
                <div>
                    <strong>Order #${order.orderNumber}</strong>
                    <span class="secondary-content">${new Date(order.createdAt).toLocaleDateString()}</span>
                    <p>Total: $${order.total.toFixed(2)}</p>
                    <p>Status: ${order.status}</p>
                </div>
            `;
            orderList.appendChild(li);
        });
    }

    // Store addresses globally
    let addresses = [];

    // Load user addresses
    async function loadUserAddresses() {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Important for session cookies
            });

            if (response.ok) {
                const user = await response.json();
                addresses = user.shippingAddresses || [];
                renderAddresses(addresses);
            } else if (response.status === 401) {
                // User not authenticated, redirect to login
                window.location.href = '/index.html';
            } else {
                console.error('Failed to load addresses');
                M.toast({html: 'Failed to load addresses', classes: 'red'});
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
            M.toast({html: 'Error loading addresses', classes: 'red'});
        }
    }

    // Render addresses to the DOM
    function renderAddresses(addresses) {
        const addressList = document.getElementById('addressList');
        addressList.innerHTML = '';

        if (addresses.length === 0) {
            addressList.innerHTML = '<li class="collection-item">No addresses found</li>';
            return;
        }

        addresses.forEach((address, index) => {
            const li = document.createElement('li');
            li.className = 'collection-item';
            li.innerHTML = `
                <div>
                    <strong>${address.street}, ${address.city}</strong>
                    <span class="secondary-content">
                        <a href="#!" class="edit-address" data-index="${index}"><i class="material-icons">edit</i></a>
                        <a href="#!" class="delete-address" data-index="${index}"><i class="material-icons">delete</i></a>
                    </span>
                    <p>${address.state}, ${address.zipCode}, ${address.country}</p>
                </div>
            `;
            addressList.appendChild(li);
        });
    }

    // Open address modal for adding/editing
    function openAddressModal(index = null) {
        const modalTitle = document.getElementById('addressModalTitle');
        const addressForm = document.getElementById('addressForm');
        const addressIndex = document.getElementById('addressIndex');

        if (index !== null) {
            const address = addresses[index];
            modalTitle.textContent = 'Edit Address';
            addressIndex.value = index;
            addressForm.modalAddressStreet.value = address.street;
            addressForm.modalAddressCity.value = address.city;
            addressForm.modalAddressState.value = address.state;
            addressForm.modalAddressZipCode.value = address.zipCode;
            addressForm.modalAddressCountry.value = address.country;
        } else {
            modalTitle.textContent = 'Add Address';
            addressIndex.value = '';
            addressForm.reset();
        }

        M.updateTextFields();
        const modal = M.Modal.getInstance(document.getElementById('addressModal'));
        modal.open();
    }

    // Save address
    async function saveAddress() {
        const index = document.getElementById('addressIndex').value;
        const address = {
            street: document.getElementById('modalAddressStreet').value,
            city: document.getElementById('modalAddressCity').value,
            state: document.getElementById('modalAddressState').value,
            zipCode: document.getElementById('modalAddressZipCode').value,
            country: document.getElementById('modalAddressCountry').value
        };

        if (!address.street || !address.city || !address.state || !address.zipCode || !address.country) {
            M.toast({html: 'Please fill all address fields', classes: 'red'});
            return;
        }

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ address, index })
            });

            if (response.ok) {
                M.toast({html: 'Address saved successfully', classes: 'green'});
                loadUserAddresses();
                
                // Close modal
                const modal = M.Modal.getInstance(document.getElementById('addressModal'));
                if (modal) modal.close();
            } else {
                const error = await response.json();
                M.toast({html: error.error || 'Error saving address', classes: 'red'});
            }
        } catch (error) {
            console.error('Error saving address:', error);
            M.toast({html: 'Error saving address', classes: 'red'});
        }
    }

    // Event listeners
    document.getElementById('addAddressBtn').addEventListener('click', () => openAddressModal());
    document.getElementById('saveAddressBtn').addEventListener('click', saveAddress);

    // Delete address
    async function deleteAddress(index) {
        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            const response = await fetch(`/api/user/address/${index}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                M.toast({html: 'Address deleted successfully', classes: 'green'});
                loadUserAddresses();
            } else {
                const error = await response.json();
                M.toast({html: error.error || 'Error deleting address', classes: 'red'});
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            M.toast({html: 'Error deleting address', classes: 'red'});
        }
    }

    document.getElementById('addressList').addEventListener('click', (e) => {
        if (e.target.closest('.edit-address')) {
            const index = e.target.closest('.edit-address').dataset.index;
            openAddressModal(index);
        } else if (e.target.closest('.delete-address')) {
            const index = e.target.closest('.delete-address').dataset.index;
            deleteAddress(index);
        }
    });

    // Delete account
    async function deleteAccount() {
        // Double confirmation for account deletion
        const firstConfirm = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!firstConfirm) return;

        const secondConfirm = confirm('Are you ABSOLUTELY SURE? All your data including order history will be permanently deleted.');
        if (!secondConfirm) return;

        try {
            const response = await fetch('/api/user/account', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                M.toast({html: 'Account deleted successfully', classes: 'green', displayLength: 3000});
                
                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);
            } else {
                const error = await response.json();
                M.toast({html: error.error || 'Error deleting account', classes: 'red'});
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            M.toast({html: 'Error deleting account', classes: 'red'});
        }
    }

    // Event listener for delete account button
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }

    // Initialize
    loadUserProfile(); // Load data from backend
    loadOrderHistory(); // Load order history
    loadUserAddresses(); // Load addresses
    setInitialEmail(); // Set email as fallback

    // Event Listeners
    personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    shippingAddressForm.addEventListener('submit', handleShippingAddressSubmit);
    paymentMethodForm.addEventListener('submit', handlePaymentMethodSubmit);
    paymentMethodSelect.addEventListener('change', handlePaymentMethodChange);

    // Handle payment method change
    function handlePaymentMethodChange() {
        const selectedMethod = paymentMethodSelect.value;
        if (selectedMethod === 'credit_card') {
            creditCardSection.classList.remove('hide');
        } else {
            creditCardSection.classList.add('hide');
        }
        // Update Materialize labels to ensure proper rendering
        M.updateTextFields();
    }

    // Handle personal info form submission
    async function handlePersonalInfoSubmit(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: profileEmailInput.value,
            phone: document.getElementById('phone').value
        };

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                M.toast({html: 'Personal information updated successfully', classes: 'green'});
                
                // Update navigation email if changed
                const userEmailElement = document.getElementById('userEmail');
                if (userEmailElement) {
                    userEmailElement.textContent = formData.email;
                }
            } else if (response.status === 401) {
                M.toast({html: 'Please login to save changes', classes: 'red'});
            } else {
                const error = await response.json();
                M.toast({html: error.error || 'Error updating personal information', classes: 'red'});
            }
        } catch (error) {
            console.error('Error updating personal info:', error);
            M.toast({html: 'Error updating personal information', classes: 'red'});
        }
    }

    // Handle shipping address form submission
    async function handleShippingAddressSubmit(e) {
        e.preventDefault();
        
        const formData = {
            shippingAddress: {
                street: document.getElementById('addressStreet').value,
                city: document.getElementById('addressCity').value,
                state: document.getElementById('addressState').value,
                zipCode: document.getElementById('addressZipCode').value,
                country: document.getElementById('addressCountry').value
            }
        };

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                M.toast({html: 'Shipping address updated successfully', classes: 'green'});
            } else if (response.status === 401) {
                M.toast({html: 'Please login to save changes', classes: 'red'});
            } else {
                const error = await response.json();
                M.toast({html: error.error || 'Error updating shipping address', classes: 'red'});
            }
        } catch (error) {
            console.error('Error updating shipping address:', error);
            M.toast({html: 'Error updating shipping address', classes: 'red'});
        }
    }

    // Handle payment method form submission
    async function handlePaymentMethodSubmit(e) {
        e.preventDefault();
        
        const formData = {
            paymentMethod: document.getElementById('paymentMethod').value
        };

        if (formData.paymentMethod === 'credit_card') {
            formData.creditCard = {
                cardHolderName: document.getElementById('cardHolderName').value,
                cardNumber: document.getElementById('cardNumber').value,
                expiryDate: document.getElementById('expiryDate').value
            };
        }

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                M.toast({html: 'Payment method updated successfully', classes: 'green'});
            } else if (response.status === 401) {
                M.toast({html: 'Please login to save changes', classes: 'red'});
            } else {
                const error = await response.json();
                M.toast({html: error.error || 'Error updating payment method', classes: 'red'});
            }
        } catch (error) {
            console.error('Error updating payment method:', error);
            M.toast({html: 'Error updating payment method', classes: 'red'});
        }
    }
});