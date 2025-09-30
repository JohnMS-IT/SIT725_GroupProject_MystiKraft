
// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  // Handle login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();// Prevent default form submission
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        // Send login request
        const response = await fetch('/api/auth/login', {
          method: 'POST',// POST request to login endpoint
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });// Log response status
        const data = await response.json();
        console.log('Login response:', data);
        // Handle response
        if (response.ok) {// Save token and redirect on success
          localStorage.setItem('token', data.token);
          M.toast({ html: 'Login successful!', classes: 'green' });
          window.location.href = '/index.html'; // Redirect to index.html
        } else {// Show error message on failure
          M.toast({ html: data.message || 'Login failed', classes: 'red' });
        }
      } catch (error) {
        console.error('Error logging in:', error);
        M.toast({ html: 'Server error', classes: 'red' });
      }
    });
  }
});