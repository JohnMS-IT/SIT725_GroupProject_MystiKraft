// Authentication functionality for Materialize
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    initializeMaterializeComponents();
    
    // Switch to register form
    document.getElementById('showRegister').addEventListener('click', function() {
        document.getElementById('loginForm').classList.add('hide');
        document.getElementById('registerForm').classList.remove('hide');
    });
    
    // Switch to login form
    document.getElementById('showLogin').addEventListener('click', function() {
        document.getElementById('registerForm').classList.add('hide');
        document.getElementById('loginForm').classList.remove('hide');
    });
    
    // Handle login form submit
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // include cookies for session
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Close login modal using Materialize
                const modal = M.Modal.getInstance(document.getElementById('loginModal'));
                if (modal) modal.close();
                
                // Show success message using Materialize toast
                M.toast({html: 'Login successful!', classes: 'green'});
                
                // Update UI
                updateAuthUI(data.user);
            } else {
                M.toast({html: 'Login failed: ' + data.message, classes: 'red'});
            }
        } catch (error) {
            M.toast({html: 'Login failed. Please try again.', classes: 'red'});
            console.error('Login error:', error);
        }
    });
    
    // Handle register form submit
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            M.toast({html: 'Passwords do not match', classes: 'red'});
            return;
        }
        
        if (password.length < 6) {
            M.toast({html: 'Password must be at least 6 characters', classes: 'red'});
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                M.toast({html: 'Registration successful! Please check your email for verification.', classes: 'green'});
                // Switch back to login form
                document.getElementById('registerForm').classList.add('hide');
                document.getElementById('loginForm').classList.remove('hide');
                
                // Clear form
                document.getElementById('registerForm').reset();
            } else {
                M.toast({html: 'Registration failed: ' + data.message, classes: 'red'});
            }
        } catch (error) {
            M.toast({html: 'Registration failed. Please try again.', classes: 'red'});
            console.error('Registration error:', error);
        }
    });
    
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', async function(e) {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                M.toast({html: 'Logged out successfully', classes: 'green'});
                // Update UI
                updateAuthUI(null);
            } else {
                M.toast({html: 'Logout failed: ' + data.message, classes: 'red'});
            }
        } catch (error) {
            M.toast({html: 'Logout failed. Please try again.', classes: 'red'});
            console.error('Logout error:', error);
        }
    });
    
    // Check authentication status on page load
    checkAuthStatus();
});

// Initialize Materialize components
function initializeMaterializeComponents() {
    // Initialize modals
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    
    // Initialize dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdowns, {
        alignment: 'right',
        constrainWidth: false
    });
}

// Check if user is logged in
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                updateAuthUI(data.user);
            } else {
                updateAuthUI(null);
            }
        } else {
            updateAuthUI(null);
        }
    } catch (error) {
        console.error('Auth status check failed:', error);
        updateAuthUI(null);
    }
}

// Update UI based on authentication state
function updateAuthUI(user) {
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userEmail = document.getElementById('userEmail');
    
    if (user) {
        // User logged in
        if (authLinks) authLinks.classList.add('hide');
        if (userMenu) userMenu.classList.remove('hide');
        if (userEmail) userEmail.textContent = user.email;
        
        // Save user info in localStorage
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        // User not logged in
        if (authLinks) authLinks.classList.remove('hide');
        if (userMenu) userMenu.classList.add('hide');
        
        // Remove user info from localStorage
        localStorage.removeItem('user');
    }
}

// Utility function to get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Utility function to check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('user') !== null;
}