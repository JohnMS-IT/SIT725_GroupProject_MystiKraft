document.addEventListener('DOMContentLoaded', () => {
  // Initialize Materialize components
  M.AutoInit();

  const productGrid = document.getElementById('product-grid');
  const token = localStorage.getItem('token');

  if (!token) {
    M.toast({ html: 'Please log in to view your products', classes: 'red', displayLength: 4000 });
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 2000);
    return;
  }

  // Fetch seller's products
  const fetchProducts = async () => {
    try {
      console.log('Fetching seller products');
      const response = await fetch('/api/products/my-products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Fetch products response status:', response.status);
      const products = await response.json();
      console.log('Fetch products response data:', products);

      if (response.ok) {
        displayProducts(products);
      } else {
        M.toast({ html: products.message || 'Failed to fetch products', classes: 'red', displayLength: 4000 });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      M.toast({ html: `Server error: ${error.message}`, classes: 'red', displayLength: 4000 });
    }
  };

  // Display products in grid
  const displayProducts = (products) => {
    productGrid.innerHTML = '';
    if (products.length === 0) {
      productGrid.innerHTML = '<p>No products found.</p>';
      return;
    }
    
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'col s12 m4';
      card.innerHTML = `
        <div class="card">
          <div class="card-image">
            <img src="${product.image}" alt="${product.name}" class="responsive-img">
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
      productGrid.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id');
        showEditForm(productId, products.find(p => p._id === productId));
      });
    });

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
            <input id="price-${productId}" type="number" step="0.01" value="${product.price}" required>
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
    document.body.appendChild(modal);

    // Initialize modal and select
    M.Modal.init(modal);
    M.FormSelect.init(document.querySelector(`#category-${productId}`));
    const instance = M.Modal.getInstance(modal);
    instance.open();

    // Handle form submission
    document.getElementById(`edit-form-${productId}`).addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('name', document.getElementById(`name-${productId}`).value);
      formData.append('slug', document.getElementById(`slug-${productId}`).value);
      formData.append('price', document.getElementById(`price-${productId}`).value);
      formData.append('category', document.getElementById(`category-${productId}`).value);
      formData.append('description', document.getElementById(`description-${productId}`).value);
      const imageInput = document.getElementById(`image-${productId}`);
      if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
      }

      try {
        console.log('Updating product:', productId);
        const response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        console.log('Update response status:', response.status);
        const data = await response.json();
        console.log('Update response data:', data);

        if (response.ok) {
          M.toast({ html: 'Product updated successfully', classes: 'green', displayLength: 4000 });
          instance.close();
          fetchProducts();
        } else {
          M.toast({ html: data.message || 'Failed to update product', classes: 'red', displayLength: 4000 });
        }
      } catch (error) {
        console.error('Error updating product:', error);
        M.toast({ html: `Server error: ${error.message}`, classes: 'red', displayLength: 4000 });
      }
    });
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      console.log('Deleting product:', productId);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);

      if (response.ok) {
        M.toast({ html: 'Product deleted successfully', classes: 'green', displayLength: 4000 });
        fetchProducts();
      } else {
        M.toast({ html: data.message || 'Failed to delete product', classes: 'red', displayLength: 4000 });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      M.toast({ html: `Server error: ${error.message}`, classes: 'red', displayLength: 4000 });
    }
  };

  // Fetch products on page load
  fetchProducts();
});