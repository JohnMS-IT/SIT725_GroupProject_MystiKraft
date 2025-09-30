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

    // Initialize
    loadUserProfile(); // Load data from backend
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