// wishlist.js - Wishlist page functionality
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('wishlist-container');
  const btnClear = document.getElementById('btn-clear-wishlist');

  let wishlistData = [];

  // Render wishlist items
  const renderWishlist = () => {
    container.innerHTML = '';

    if (!wishlistData.length) {
      container.innerHTML = `
        <div class="center-align section">
          <i class="material-icons large grey-text">favorite_border</i>
          <p class="grey-text">Your wishlist is empty</p>
          <a href="shop.html" class="btn black waves-effect waves-light">Browse Products</a>
        </div>
      `;
      return;
    }

    wishlistData.forEach(item => {
      const product = item.productId;
      if (!product) return;

      const div = document.createElement('div');
      div.className = 'wishlist-item';
      div.innerHTML = `
        <div class="row valign-wrapper">
          <div class="col s3 m2">
            <img src="${product.image}" alt="${product.name}" class="wishlist-img">
          </div>
          <div class="col s6 m7">
            <h6>${product.name}</h6>
            <p class="grey-text">${product.description || ''}</p>
            <p><strong>$${product.price.toFixed(2)}</strong></p>
            ${product.stock > 0 ? '<span class="green-text">In Stock</span>' : '<span class="red-text">Out of Stock</span>'}
          </div>
          <div class="col s3 m3 center-align">
            <button class="btn green waves-effect add-to-cart" data-id="${product._id}" ${product.stock === 0 ? 'disabled' : ''}>
              <i class="material-icons">shopping_cart</i> Add to Cart
            </button>
            <button class="btn-flat red-text remove-from-wishlist" data-id="${product._id}">
              <i class="material-icons">delete</i> Remove
            </button>
          </div>
        </div>
      `;
      container.appendChild(div);
    });

    // Bind add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', async () => {
        const productId = btn.dataset.id;
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 }),
            credentials: 'include'
          });
          
          if (!res.ok) throw new Error('Failed to add to cart');
          
          if (window.CartUtils) {
            window.CartUtils.updateCartCount();
            window.CartUtils.notifyCartChange('Added to cart!');
          } else {
            M.toast({ html: 'Added to cart!', classes: 'green' });
          }
        } catch (err) {
          console.error('Error adding to cart:', err);
          if (window.CartUtils) {
            window.CartUtils.notifyCartChange('Failed to add to cart', false);
          } else {
            M.toast({ html: 'Failed to add to cart', classes: 'red' });
          }
        }
      });
    });

    // Bind remove buttons
    document.querySelectorAll('.remove-from-wishlist').forEach(btn => {
      btn.addEventListener('click', async () => {
        const productId = btn.dataset.id;
        try {
          const res = await fetch(`/api/wishlist/${productId}`, { 
            method: 'DELETE',
            credentials: 'include'
          });
          
          if (!res.ok) throw new Error('Failed to remove from wishlist');
          
          wishlistData = wishlistData.filter(item => item.productId._id !== productId);
          renderWishlist();
          updateWishlistCount();
          M.toast({ html: 'Removed from wishlist', classes: 'orange darken-1' });
        } catch (err) {
          console.error('Error removing from wishlist:', err);
          M.toast({ html: 'Failed to remove', classes: 'red darken-1' });
        }
      });
    });
  };

  // Load wishlist data
  const loadWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist', {
        credentials: 'include'
      });
      const wishlist = await res.json();
      wishlistData = wishlist.items || [];
      renderWishlist();
      updateWishlistCount();
    } catch (err) {
      console.error('Error loading wishlist:', err);
      M.toast({ html: 'Failed to load wishlist', classes: 'red' });
    }
  };

  // Update wishlist count
  const updateWishlistCount = () => {
    const count = wishlistData.length;
    const el = document.getElementById('wishlist-count');
    if (el) el.textContent = count;
  };

  // Clear wishlist
  btnClear.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear your wishlist?')) return;
    
    try {
      const res = await fetch('/api/wishlist', { 
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Failed to clear wishlist');
      
      wishlistData = [];
      renderWishlist();
      updateWishlistCount();
      M.toast({ html: 'Wishlist cleared', classes: 'orange darken-1' });
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      M.toast({ html: 'Failed to clear wishlist', classes: 'red darken-1' });
    }
  });

  loadWishlist();
});

