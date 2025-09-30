// shop.js - Handles product listing, filtering, sorting, and infinite scrolling
document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');
  const sortFilter = document.getElementById('sort-filter');
  const filterForm = document.getElementById('filter-form');
  const sentinel = document.getElementById('load-more-sentinel');
  // Ensure elements exist
  if (!productGrid) {
    console.error('Product grid not found in shop.html');// Log error
    M.toast({ html: 'Page error: Product grid missing', classes: 'red' });// Notify user
    return;
  }
  // Pagination state
  let page = 1;
  let isLoading = false;
  // Fetch products from backend
  const fetchProducts = async (reset = false) => {
    if (isLoading) return;
    isLoading = true;
    if (reset) {
      page = 1;
      productGrid.innerHTML = '';
    }
    // Build query parameters
    const category = categoryFilter.value;
    const price = priceFilter.value;
    const sort = sortFilter.value;
    let query = `page=${page}`;
    if (category !== 'all') query += `&category=${category}`;
    if (price !== 'all') query += `&price=${price}`;
    if (sort) query += `&sort=${sort}`;

    try {// Debug log
      console.log('Fetching products with query:', query);
      const response = await fetch(`/api/products?${query}`);
      console.log('Fetch /api/products status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }// Parse JSON
      const products = await response.json();
      console.log('Products fetched:', products);

      if (products.length === 0 && page === 1) {
        productGrid.innerHTML = '<p>No products available.</p>';
        M.toast({ html: 'No products found', classes: 'yellow' });
      } else {// Append products to grid
        productGrid.innerHTML += products.map(product => `
          <div class="col s12 m4">
            <div class="card">
              <div class="card-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='/images/placeholder.jpg'">
              </div>
              <div class="card-content">
                <span class="card-title">${product.name}</span>
                <p>${product.description}</p>
                <p>Price: $${product.price}</p>
              </div>
              <div class="card-action">
                <button class="btn">Add to Cart</button>
              </div>
            </div>
          </div>
        `).join('');
      }// Increment page for next fetch
      page++;
      isLoading = false;
    } catch (error) {// Handle errors
      console.error('Error fetching products:', error);
      M.toast({ html: `Server error: ${error.message}`, classes: 'red' });
      isLoading = false;
    }
  };

  // Initial fetch
  fetchProducts(true);

  // Handle filter changes
  filterForm.addEventListener('change', () => {
    fetchProducts(true);
  });

  // Infinite scrolling
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchProducts();
    }// Observe sentinel with threshold
  }, { threshold: 0.1 });
  //Start observing if sentinel exists
  if (sentinel) {
    observer.observe(sentinel);
  } else {// Log error if sentinel missing
    console.error('Sentinel not found for infinite scrolling');
  }
});