// public/js/auth.js
// Handle user authentication state and UI updates
document.addEventListener('DOMContentLoaded', async () => {
  const authNav = document.getElementById('auth-nav');
  const token = localStorage.getItem('token');

  if (!authNav) return;

  if (token) {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Display user email and logout option
        authNav.innerHTML = `
          <li>
            <a href="/seller.html">${data.email}</a>
            <a href="#" id="logout">Logout</a>
          </li>
        `;
        // Handle logout
        document.getElementById('logout').addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('token');
          M.toast({ html: 'Logged out successfully!', classes: 'green' });
          window.location.href = '/login.html';
        });
        // Redirect from login/register if already logged in
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
          window.location.href = '/seller.html';
        }
      } else {
        // Invalid token, clear it and show login
        localStorage.removeItem('token')
        authNav.innerHTML = '<a href="/login.html">Account</a>';
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      authNav.innerHTML = '<a href="/login.html">Account</a>';
    }
  } else {
    authNav.innerHTML = '<a href="/login.html">Account</a>';
  }
});