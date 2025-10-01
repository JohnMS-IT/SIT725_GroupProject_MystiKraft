// Recently Viewed Products - localStorage based tracking

class RecentlyViewed {
  constructor(maxItems = 6) {
    this.maxItems = maxItems;
    this.storageKey = 'recently_viewed';
  }

  // Get recently viewed products
  getRecentlyViewed() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error reading recently viewed:', err);
      return [];
    }
  }

  // Add product to recently viewed
  addProduct(product) {
    try {
      let recent = this.getRecentlyViewed();
      
      // Remove if already exists (to move to front)
      recent = recent.filter(p => p._id !== product._id);
      
      // Add to beginning
      recent.unshift({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        viewedAt: new Date().toISOString()
      });
      
      // Limit to max items
      if (recent.length > this.maxItems) {
        recent = recent.slice(0, this.maxItems);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(recent));
    } catch (err) {
      console.error('Error saving recently viewed:', err);
    }
  }

  // Clear recently viewed
  clear() {
    localStorage.removeItem(this.storageKey);
  }

  // Render recently viewed products
  async renderRecentlyViewed(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const recent = this.getRecentlyViewed();
    
    if (recent.length === 0) {
      container.innerHTML = '<p class="grey-text center-align">No recently viewed products</p>';
      return;
    }

    container.innerHTML = '';
    
    recent.forEach(product => {
      const col = document.createElement('div');
      col.className = 'col s12 m6 l4';
      col.innerHTML = `
        <div class="card">
          <div class="card-image">
            <img src="${product.image}" alt="${product.name}" style="height: 200px; object-fit: cover;">
          </div>
          <div class="card-content">
            <span class="card-title">${product.name}</span>
            <p><strong>$${product.price}</strong></p>
          </div>
          <div class="card-action">
            <a href="product.html?id=${product._id}" class="btn-flat">View Product</a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }
}

// Create global instance
window.RecentlyViewed = new RecentlyViewed();

