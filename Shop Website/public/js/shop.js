
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');

  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');
  const sortFilter = document.getElementById('sort-filter');

  // Fetch products with optional query string
  const fetchProducts = async (query = '') => {
    const res = await fetch(`/api/products${query}`);
    const products = await res.json();
    console.log('Fetched products:', products);
    renderProducts(products.items);
  };

  // Render products into the grid
  const renderProducts = (products) => {
    grid.innerHTML = '';
    products.forEach(product => {
      const card = document.createElement('div');
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

    if (category !== 'all') query.push(`category=${category}`);
    if (price !== 'all') query.push(`price=${price}`);
    if (sort) query.push(`sort=${sort}`);

    return query.length ? `?${query.join('&')}` : '';
  };

  // Listen for filter changes
  document.getElementById('filter-form').addEventListener('change', () => {
    const query = buildQuery();
    fetchProducts(query);
  });

  fetchProducts(); // Load all products initially
});
