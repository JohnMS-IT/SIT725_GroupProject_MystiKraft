class ProductFilter {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentCategory = 'all';
    this.currentPrice = 300;
  }

  // Load all products from API
  async loadAllProducts() {
    try {
      const response = await fetch('/api/products');
      this.products = await response.json();
      this.filteredProducts = [...this.products];
      this.renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('Failed to load products. Please try again.');
    }
  }

  // Filter by category
  async filterByCategory(category) {
    this.currentCategory = category;
    try {
      const response = await fetch(`/api/products/category/${category}`);
      this.filteredProducts = await response.json();
      this.applyPriceFilter();
      this.renderProducts();
    } catch (error) {
      console.error('Error filtering by category:', error);
      this.showError('Failed to filter by category. Please try again.');
    }
  }

  // Filter by price
  filterByPrice(maxPrice) {
    this.currentPrice = maxPrice;
    document.getElementById('currentPrice').textContent = `$${maxPrice}`;
    this.applyPriceFilter();
    this.renderProducts();
  }

  // Apply price filter to current products
  applyPriceFilter() {
    if (this.currentPrice < 300) {
      this.filteredProducts = this.filteredProducts.filter(
        product => product.price <= this.currentPrice
      );
    }
  }

  // Clear all filters
  clearFilters() {
    this.currentCategory = 'all';
    this.currentPrice = 300;
    document.getElementById('priceRange').value = 300;
    document.getElementById('currentPrice').textContent = '$300';
    this.loadAllProducts();
  }

  // Render products to DOM
  renderProducts() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    if (this.filteredProducts.length === 0) {
      container.innerHTML = '<p class="text-center">No products found matching your criteria.</p>';
      return;
    }

    this.filteredProducts.forEach(product => {
      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 col-12';
      
      col.innerHTML = `
        <div class="card p-3 text-center">
          <img src="/images/shoes/${product.image}" alt="${product.name}" class="product-hover" style="height: 200px; object-fit: cover;">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">$${product.price}</p>
          <p class="card-text small text-muted">${product.description || ''}</p>
          <button class="btn btn-primary" onclick="addToCart('${product._id}')">Add to Cart</button>
        </div>
      `;
      
      container.appendChild(col);
    });
  }

  // Show error message
  showError(message) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = `<p class="text-center text-danger">${message}</p>`;
  }
}

// Global functions for HTML onclick events
const productFilter = new ProductFilter();

function loadAllProducts() {
  productFilter.loadAllProducts();
}

function filterByCategory(category) {
  productFilter.filterByCategory(category);
}

function filterByPrice(price) {
  productFilter.filterByPrice(price);
}

function clearFilters() {
  productFilter.clearFilters();
}

function addToCart(productId) {
  // Cart functionality can be added here
  console.log('Adding to cart:', productId);
  alert('Product added to cart! (This is a demo)');
}
