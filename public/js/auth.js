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
        // Display user email with dropdown for logout
        authNav.innerHTML = `
          <li>
            <a href="#" class="dropdown-trigger" data-target="auth-dropdown">${data.email}</a>
            <ul id="auth-dropdown" class="dropdown-content">
              <li><a href="/seller.html">Add Product</a></li>
              <li><a href="#" id="logout">Logout</a></li>
            </ul>
          </li>
        `;
        // Initialize Materialize dropdown with hover
        const dropdowns = document.querySelectorAll('.dropdown-trigger');
        M.Dropdown.init(dropdowns, {
          hover: true,
          coverTrigger: false,
          constrainWidth: false
        });
        // Handle logout
        document.getElementById('logout').addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('token');
          M.toast({ html: 'Logged out successfully!', classes: 'green' });
          window.location.href = '/login.html';
        });
      } else {
        // Invalid token, clear it and show login
        localStorage.removeItem('token');
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