// public/js/modify-products.js
// Handles displaying and modifying products for sellers
document.addEventListener('DOMContentLoaded', () => {
  M.AutoInit();// Initialize Materialize components

  const productGrid = document.getElementById('product-grid');
  const token = localStorage.getItem('token');
  // Redirect to login if not authenticated
  if (!token) {// Notify and redirect to login
    M.toast({ html: 'Please log in to view your products', classes: 'red', displayLength: 1000 });
    setTimeout(() => {// Redirect after 1 seconds to login page
      window.location.href = '/login.html';
    }, 1000);// Stop further execution and processing of this script
    return;
  }

  const fetchProducts = async () => {
    try {// Fetch products for the authenticated seller
      console.log('Fetching seller products');
      const response = await fetch('/api/products/my-products', {// Include auth token in headers
        headers: { 'Authorization': `Bearer ${token}` }// Log the response status
      });
      console.log('Fetch /api/products/my-products status:', response.status);// Parse JSON response
      const products = await response.json();// Log the fetched products
      console.log('Fetch products response data:', products);// Display products if fetch was successful

      if (response.ok) {
        displayProducts(products);// Render products in the UI
      } else {// Show error toast if fetch failed
        M.toast({ html: products.message || 'Failed to fetch products', classes: 'red', displayLength: 1000 });
      }
    } catch (error) {// Log error and show toast
      console.error('Error fetching products:', error);// Show error toast
      M.toast({ html: `Server error: ${error.message}`, classes: 'red', displayLength: 1000 });
    }
  };
  // Render products in the grid
  const displayProducts = (products) => {
    productGrid.innerHTML = '';
    if (products.length === 0) {// Show message if no products found
      productGrid.innerHTML = '<p>No products found.</p>';
      return;
    }
    // Create product cards
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'col s12 m4';
      card.innerHTML = `
        <div class="card">
          <div class="card-image">
            <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
          </div>
          <div class="card-content">
            <span class="card-title">${product.name}</span>
            <p>Price: $${product.price}</p>
            <p>Category: ${product.category}</p>
            <p>${product.description}</p>
          </div>
          <div class="card-action">
            <button class="btn waves-effect waves-light edit-btn" data-id="${product._id}">Edit</button>
            <button class="btn red waves-effect waves-light delete-btn" data-id="${product._id}">Delete</button>
          </div>
        </div>
      `;
      productGrid.appendChild(card);// Add card to the grid
    });
    // Attach event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id');
        showEditForm(productId, products.find(p => p._id === productId));
      });
    });
    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id');
        deleteProduct(productId);
      });
    });
  };
  // Show edit form in a modal
  const showEditForm = (productId, product) => {
    const modalId = `edit-modal-${productId}`;
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h4>Edit Product</h4>
        <form id="edit-form-${productId}">
          <div class="input-field">
            <input id="name-${productId}" type="text" value="${product.name}" required>
            <label for="name-${productId}" class="active">Name</label>
          </div>
          <div class="input-field">
            <input id="slug-${productId}" type="text" value="${product.slug}" required>
            <label for="slug-${productId}" class="active">Slug</label>
          </div>
          <div class="input-field">
            <input id="price-${productId}" type="number" step="0.01" min="1" value="${product.price}" required>
            <label for="price-${productId}" class="active">Price</label>
          </div>
          <div class="input-field">
            <select id="category-${productId}" required>
              <option value="shoes" ${product.category === 'shoes' ? 'selected' : ''}>Shoes</option>
              <option value="tops" ${product.category === 'tops' ? 'selected' : ''}>Tops</option>
              <option value="bottoms" ${product.category === 'bottoms' ? 'selected' : ''}>Bottoms</option>
              <option value="accessories" ${product.category === 'accessories' ? 'selected' : ''}>Accessories</option>
            </select>
            <label>Category</label>
          </div>
          <div class="input-field">
            <textarea id="description-${productId}" class="materialize-textarea" required>${product.description}</textarea>
            <label for="description-${productId}" class="active">Description</label>
          </div>
          <div class="file-field input-field">
            <div class="btn">
              <span>Image</span>
              <input type="file" id="image-${productId}" accept="image/*">
            </div>
            <div class="file-path-wrapper">
              <input class="file-path validate" type="text" placeholder="Upload new image (optional)">
            </div>
          </div>
          <button class="btn waves-effect waves-light" type="submit">Save Changes</button>
          <button class="btn grey waves-effect waves-light modal-close" type="button">Cancel</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);// Append modal to body
    // Initialize and open modal
    M.Modal.init(modal);
    // Reinitialize select element
    M.FormSelect.init(document.querySelector(`#category-${productId}`));
    const instance = M.Modal.getInstance(modal);// Open the modal
    instance.open();
    // Handle form submission
    document.getElementById(`edit-form-${productId}`).addEventListener('submit', async (e) => {
      e.preventDefault();// Validate price
      const price = parseFloat(document.getElementById(`price-${productId}`).value);
      if (price < 1) {// Notify if price is invalid and stop submission
        M.toast({ html: 'Price must be 1 or higher', classes: 'red', displayLength: 2000 });
        return;
      }
      // Prepare form data
      const formData = new FormData();// Append updated fields
      formData.append('name', document.getElementById(`name-${productId}`).value);
      formData.append('slug', document.getElementById(`slug-${productId}`).value);
      formData.append('price', price);// Append category and description
      formData.append('category', document.getElementById(`category-${productId}`).value);// Append description
      formData.append('description', document.getElementById(`description-${productId}`).value);// Append image file if selected
      const imageInput = document.getElementById(`image-${productId}`);// Append image file if selected
      if (imageInput.files[0]) {// Append image file if selected
        formData.append('image', imageInput.files[0]);
      }

      try {// Send update request to backend
        console.log('Updating product:', productId);// Log form data keys
        const response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',// Include auth token in
          headers: { 'Authorization': `Bearer ${token}` },// Set request method and headers
          body: formData
        });// Log response status
        console.log('Update response status:', response.status);
        const data = await response.json();
        console.log('Update response data:', data);
        // Handle response
        if (response.ok) {// Show success toast and refresh products
          M.toast({ html: 'Product updated successfully', classes: 'green', displayLength: 2000 });
          instance.close();
          fetchProducts();
        } else {// Show error toast if update failed
          M.toast({ html: data.message || 'Failed to update product', classes: 'red', displayLength: 2000 });
        }
      } catch (error) {// Log error and show toast
        console.error('Error updating product:', error);
        M.toast({ html: `Server error: ${error.message}`, classes: 'red', displayLength: 2000 });
      }
    });
  };
  // Delete product
  const deleteProduct = async (productId) => {// Confirm deletion
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {// Send delete request to backend
      console.log('Deleting product:', productId);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',// Include auth token in headers
        headers: { 'Authorization': `Bearer ${token}` }
      });// Log response status
      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);
      // Handle response
      if (response.ok) {// Show success toast and refresh products
        M.toast({ html: 'Product deleted successfully', classes: 'green', displayLength: 2000 });
        fetchProducts();
      } else {// Show error toast if deletion failed
        M.toast({ html: data.message || 'Failed to delete product', classes: 'red', displayLength: 2000 });
      }
    } catch (error) {// Log error and show toast
      console.error('Error deleting product:', error);
      M.toast({ html: `Server error: ${error.message}`, classes: 'red', displayLength: 2000 });
    }
  };

  fetchProducts();// Initial fetch of products on page load
});