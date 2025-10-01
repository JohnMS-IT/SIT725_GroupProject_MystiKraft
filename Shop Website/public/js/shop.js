document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('product-grid');
  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');
  const sortFilter = document.getElementById('sort-filter');
  const brandFilter = document.getElementById('brand-filter');
  const sizeFilter = document.getElementById('size-filter');
  const colourFilter = document.getElementById('colour-filter');

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
            <button class="btn-floating halfway-fab waves-effect waves-light red wishlist-btn" data-id="${product._id}">
              <i class="material-icons">favorite_border</i>
            </button>
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

    // Bind wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = btn.dataset.id;
        const icon = btn.querySelector('i');
        
        try {
          const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
            credentials: 'include'
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Failed to add to wishlist');
          }
          
          // Change icon to filled heart
          icon.textContent = 'favorite';
          btn.classList.add('pulse');
          
          // Update wishlist count
          if (window.WishlistUtils) {
            window.WishlistUtils.updateWishlistCount();
          }
          
          M.toast({ html: 'Added to wishlist!', classes: 'red darken-1' });
        } catch (err) {
          console.error('Wishlist error:', err);
          M.toast({ html: err.message, classes: 'orange darken-1' });
        }
      });
    });
  };

  const buildQuery = () => {
    const query = [];
    if (categoryFilter.value !== 'all') query.push(`category=${categoryFilter.value}`);
    if (priceFilter.value !== 'all') query.push(`price=${priceFilter.value}`);
    if (brandFilter.value !== 'all') query.push(`brand=${brandFilter.value}`);
    if (sizeFilter.value !== 'all') query.push(`size=${sizeFilter.value}`);
    if (colourFilter.value !== 'all') query.push(`colour=${colourFilter.value}`);
    if (sortFilter.value) query.push(`sort=${sortFilter.value}`);
    return query.length ? `?${query.join('&')}` : '';
  };

  document.getElementById('filter-form').addEventListener('change', () => {
    fetchProducts(buildQuery());
  });

  fetchProducts();
});
