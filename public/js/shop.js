document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');
  const sortFilter = document.getElementById('sort-filter');
  const filterForm = document.getElementById('filter-form');
  const sentinel = document.getElementById('load-more-sentinel');

  if (!productGrid) {
    console.error('Product grid not found in shop.html');
    M.toast({ html: 'Page error: Product grid missing', classes: 'red' });
    return;
  }

  let page = 1;
  let isLoading = false;

  const fetchProducts = async (reset = false) => {
    if (isLoading) return;
    isLoading = true;
    if (reset) {
      page = 1;
      productGrid.innerHTML = '';
    }

    const category = categoryFilter.value;
    const price = priceFilter.value;
    const sort = sortFilter.value;
    let query = `page=${page}`;
    if (category !== 'all') query += `&category=${category}`;
    if (price !== 'all') query += `&price=${price}`;
    if (sort) query += `&sort=${sort}`;

    try {
      console.log('Fetching products with query:', query);
      const response = await fetch(`/api/products?${query}`);
      console.log('Fetch /api/products status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const products = await response.json();
      console.log('Products fetched:', products);

      if (products.length === 0 && page === 1) {
        productGrid.innerHTML = '<p>No products available.</p>';
        M.toast({ html: 'No products found', classes: 'yellow' });
      } else {
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
      }
      page++;
      isLoading = false;
    } catch (error) {
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
    }
  }, { threshold: 0.1 });

  if (sentinel) {
    observer.observe(sentinel);
  } else {
    console.error('Sentinel not found for infinite scrolling');
  }
});