// auth.js - Handles user authentication state and UI updates
// Initialize Materialize components
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Materialize dropdowns with hover
  const dropdowns = document.querySelectorAll('.dropdown-trigger');
  M.Dropdown.init(dropdowns, {
    hover: true, // Open dropdown on hover
    coverTrigger: false, // Dropdown appears below trigger
    constrainWidth: false, // Allow dropdown to be wider than trigger
    closeOnClick: true // Close dropdown when an item is clicked
  });
  // Elements
  const authNav = document.getElementById('auth-nav');
  const loginLink = document.getElementById('login-link');
  const userDropdownTrigger = document.getElementById('user-dropdown-trigger');
  const addProductsLink = document.getElementById('add-products-link');
  const modifyProductsLink = document.getElementById('modify-products-link');
  const logoutBtn = document.getElementById('logout-btn');

  if (!authNav) {
    console.error('Auth navigation element not found');
    return;
  }

  // Check authentication status
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, showing Account link');
      if (loginLink) loginLink.classList.remove('hide');
      if (userDropdownTrigger) userDropdownTrigger.classList.add('hide');
      return;
    }

    try {// Log token presence
      console.log('Fetching user data with token:', token.substring(0, 10) + '...');
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });// Log status
      console.log('Auth response status:', response.status);
      const data = await response.json();// Log response data
      console.log('Auth response data:', data);

      if (response.ok) {
        // User is logged in
        if (loginLink) loginLink.classList.add('hide');
        if (userDropdownTrigger) {
          userDropdownTrigger.classList.remove('hide');
          userDropdownTrigger.textContent = data.email; // Show email in dropdown trigger
        }
        // Show "Add Products" and "Modify Products" only for sellers
        if (data.role === 'seller') {
          if (addProductsLink) addProductsLink.classList.remove('hide');// Show for sellers
          if (modifyProductsLink) modifyProductsLink.classList.remove('hide');
        } else {// Hide for non-sellers
          if (addProductsLink) addProductsLink.classList.add('hide');
          if (modifyProductsLink) modifyProductsLink.classList.add('hide');
        }
      } else {// Invalid token or error
        console.log('Invalid token, clearing localStorage');
        localStorage.removeItem('token');// Clear invalid token
        if (loginLink) loginLink.classList.remove('hide');
        if (userDropdownTrigger) userDropdownTrigger.classList.add('hide');// Hide user dropdown on error
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('token');// Clear invalid token
      if (loginLink) loginLink.classList.remove('hide');
      if (userDropdownTrigger) userDropdownTrigger.classList.add('hide');// Hide user dropdown on error
    }
  };

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Logging out');// Clear token and update UI
      localStorage.removeItem('token');// Show toast and redirect
      M.toast({ html: 'Logged out successfully', classes: 'green', displayLength: 1000 });
      setTimeout(() => {
        window.location.href = '/index.html';// Redirects back to home page
      }, 1000);
    });
  }

  // Run auth check on page load
  checkAuth();
});