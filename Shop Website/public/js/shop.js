document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');
  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');
  const sortFilter = document.getElementById('sort-filter');

  // Fetch products
  const fetchProducts = async (query = '') => {
    try {
      const res = await fetch(`/api/products${query}`);
      const products = await res.json();
      renderProducts(products.items);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

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
          <div class="card-action">
            <button class="btn green add-to-cart-btn" data-id="${product._id}">Add to Bag</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Bind add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const productId = btn.dataset.id;
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
          });
          if (!res.ok) throw new Error('Failed to add to cart');
          const cart = await res.json();
          window.CartUtils.updateCartCount();
          window.CartUtils.notifyCartChange('Added to bag!');
        } catch (err) {
          console.error(err);
          window.CartUtils.notifyCartChange('Failed to add to cart', false);
        }
      });
    });
  };

  const buildQuery = () => {
    const query = [];
    if (categoryFilter.value !== 'all') query.push(`category=${categoryFilter.value}`);
    if (priceFilter.value !== 'all') query.push(`price=${priceFilter.value}`);
    if (sortFilter.value) query.push(`sort=${sortFilter.value}`);
    return query.length ? `?${query.join('&')}` : '';
  };

  document.getElementById('filter-form').addEventListener('change', () => {
    fetchProducts(buildQuery());
  });

  fetchProducts();
});
