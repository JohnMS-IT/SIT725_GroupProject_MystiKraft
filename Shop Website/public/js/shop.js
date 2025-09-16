
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');

  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');
  const sortFilter = document.getElementById('sort-filter');

  // Fetch products with optional query string
  const fetchProducts = async (query = '') => {

    // Fetch products from the server
    const res = await fetch(`/api/products${query}`);
    const products = await res.json();// Log the fetched products for debugging 
    console.log('Fetched products:', products);// Display products in the grid
    renderProducts(products.items);
  };

  // Render products into the grid
  const renderProducts = (products) => {
    grid.innerHTML = '';// Clear existing products
    products.forEach(product => {// Create product card
      const card = document.createElement('div');// Set card class and inner HTML
      // Append card to grid
      card.className = 'col s12 m6 l4';
      card.innerHTML = `
        <div class="card">
          <div class="card-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="card-content">
            <span class="card-title">${product.name}</span>
            <p>${product.description}</p>
            <p><strong>$${product.price}</strong></p>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  // Build query string based on selected filters
  const buildQuery = () => {
    const category = categoryFilter.value;
    const price = priceFilter.value;
    const sort = sortFilter.value;

    const query = [];
    // Only add filters if they are not 'all'
    if (category !== 'all') query.push(`category=${category}`);
    if (price !== 'all') query.push(`price=${price}`);
    if (sort) query.push(`sort=${sort}`);
    
    return query.length ? `?${query.join('&')}` : '';
  };

  // Listen for filter changes
  document.getElementById('filter-form').addEventListener('change', () => {
    const query = buildQuery();// Fetch products with new filters
    fetchProducts(query);
    console.log('Applied filters:', query);// Debug log
  });

  fetchProducts(); // Load all products initially
});
