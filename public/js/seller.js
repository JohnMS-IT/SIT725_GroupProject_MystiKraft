
// seller.js
// JavaScript for seller functionalities (add product form handling)
document.addEventListener('DOMContentLoaded', () => {
  M.AutoInit(); // Initialize Materialize components (select, etc.)
  // Form elements
  const addProductForm = document.getElementById('add-product-form');// Form element
  const cancelButton = document.getElementById('cancel-product');// Cancel button
  const token = localStorage.getItem('token');
  // Redirect if not logged in
  if (!token) {// Notify and redirect to login
    M.toast({ html: 'Please log in to add products', classes: 'red', displayLength: 2000 });
    setTimeout(() => {// Redirect to login after delay
      window.location.href = '/login.html';
    }, 2000);
    return;
  }
  // Handle form submission
  addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Basic validation
    const price = parseFloat(document.getElementById('price').value);
    if (price < 1) {// Notify if price is invalid
      M.toast({ html: 'Price must be 1 or higher', classes: 'red', displayLength: 2000 });
      return;
    }
    // Prepare form data
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('slug', document.getElementById('slug').value);
    formData.append('price', price);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('image', document.getElementById('image').files[0]);

    try {// Submit to backend
      console.log('Submitting product form');
      const response = await fetch('/api/products', {// POST to /api/products
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      console.log('POST /api/products status:', response.status);
      const data = await response.json();
      console.log('POST /api/products response:', data);

      if (response.ok) {
        M.toast({ html: 'Product added successfully', classes: 'green', displayLength: 4000 });
        addProductForm.reset();
        M.FormSelect.init(document.getElementById('category')); // Reinitialize select
      } else {// Handle API errors
        M.toast({ html: data.message || 'Failed to add product', classes: 'red', displayLength: 4000 });
      }
    } catch (error) {// Handle network/server errors
      console.error('Error adding product:', error);
      M.toast({ html: `Server error: ${error.message}`, classes: 'red', displayLength: 4000 });
    }
  });
  // Handle form cancellation
  cancelButton.addEventListener('click', () => {
    M.toast({ html: 'Form cancelled', classes: 'grey', displayLength: 2000 });
    addProductForm.reset();// Reset form
    M.FormSelect.init(document.getElementById('category')); // Reinitialize select
    setTimeout(() => {// Delay then redirect
      window.location.href = '/shop.html';// Redirect to shop page
    }, 1000);
  });
});