document.addEventListener('DOMContentLoaded', () => {
  const addProductForm = document.getElementById('add-product-form');
  const cancelButton = document.getElementById('cancel-product');

  // Initialize Materialize select
  const selects = document.querySelectorAll('select');
  M.FormSelect.init(selects);

  // Handle cancel button
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      window.location.href = '/index.html';
    });
  }

  // Handle form submission
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const slug = document.getElementById('slug').value;
      const price = parseFloat(document.getElementById('price').value);
      const category = document.getElementById('category').value;
      const image = document.getElementById('image').files[0];
      const description = document.getElementById('description').value;

      if (!image) {
        M.toast({ html: 'Please select an image', classes: 'red' });
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('image', image);
      formData.append('description', description);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await response.json();

        if (response.ok) {
          M.toast({ html: 'Product added successfully!', classes: 'green' });
          addProductForm.reset();
        } else {
          M.toast({ html: data.message || 'Failed to add product', classes: 'red' });
        }
      } catch (error) {
        console.error('Error adding product:', error);
        M.toast({ html: 'Server error', classes: 'red' });
      }
    });
  }
});