// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
  // Switch to register form
  document.getElementById('showRegister').addEventListener('click', function() {
    document.getElementById('loginForm').classList.add('d-none');
    document.getElementById('registerForm').classList.remove('d-none');
  });
  
  // Switch to login form
  document.getElementById('showLogin').addEventListener('click', function() {
    document.getElementById('registerForm').classList.add('d-none');
    document.getElementById('loginForm').classList.remove('d-none');
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
        // Close login modal if it exists
        const modalEl = document.getElementById('loginModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        
        // Update UI
        updateAuthUI(data.user);
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      alert('Login failed. Please try again.');
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
      alert('Passwords do not match');
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
        alert('Registration successful! Please check your email for verification.');
        // Switch back to login form
        document.getElementById('registerForm').classList.add('d-none');
        document.getElementById('loginForm').classList.remove('d-none');
      } else {
        alert('Registration failed: ' + data.message);
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
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
        // Update UI
        updateAuthUI(null);
      } else {
        alert('Logout failed: ' + data.message);
      }
    } catch (error) {
      alert('Logout failed. Please try again.');
      console.error('Logout error:', error);
    }
  });
  
  // Check authentication status on page load
  checkAuthStatus();
});

// Check if user is logged in
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/user', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      updateAuthUI(data.user);
    }
  } catch (error) {
    console.error('Auth status check failed:', error);
  }
}

// Update UI based on authentication state
function updateAuthUI(user) {
  const authLinks = document.getElementById('authLinks'); // login/register buttons
  const userMenu = document.getElementById('userMenu');   // user menu
  const userEmail = document.getElementById('userEmail'); // display user email
  
  if (user) {
    // User logged in
    authLinks.classList.add('d-none');
    userMenu.classList.remove('d-none');
    userEmail.textContent = user.email;
    
    // Save user info in localStorage
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    // User not logged in
    authLinks.classList.remove('d-none');
    userMenu.classList.add('d-none');
    
    // Remove user info from localStorage
    localStorage.removeItem('user');
  }
}