
// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  // Handle login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        // Send login request
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        console.log('Login response:', data);
        if (response.ok) {
          localStorage.setItem('token', data.token);
          M.toast({ html: 'Login successful!', classes: 'green' });
          window.location.href = '/index.html'; // Redirect to index.html
        } else {
          M.toast({ html: data.message || 'Login failed', classes: 'red' });
        }
      } catch (error) {
        console.error('Error logging in:', error);
        M.toast({ html: 'Server error', classes: 'red' });
      }
    });
  }
});