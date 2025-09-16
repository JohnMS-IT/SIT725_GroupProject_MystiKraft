// Handles product listing page: category filters, infinite scroll, and rendering product cards

// Helper to fetch JSON safely
/*async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// References to DOM elements
const grid = document.getElementById('product-grid');      // where product cards will be inserted
const sentinel = document.getElementById('load-more-sentinel'); // invisible div at bottom (for infinite scroll)
const chips = document.querySelectorAll('.category-chip'); // category filter chips

// Pagination state
let page = 1;
let pages = 1;
let currentCategory = ''; // which category is selected (default: all)

// Highlight the active category chip
function setActiveChip() {
  chips.forEach(c => c.classList.remove('active')); // reset all
  const active = document.querySelector(`.category-chip[data-cat="${currentCategory}"]`);
  if (active) active.classList.add('active');
}

// Load a single page of products from backend
async function loadPage() {
  if (page > pages) return; // no more pages

  const url = `/api/products?category=${encodeURIComponent(currentCategory)}&page=${page}&limit=6`;
  const data = await fetchJSON(url);

  // Update pagination
  pages = data.pages;
  page += 1;

  // Render products into grid
  renderItems(data.items);
}

// Render an array of product objects into cards
function renderItems(items) {
  const html = items.map(p => `
    <div class="col s12 m6 l4">
      <div class="card center-align">
        <div class="card-image">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="card-content">
          <span class="card-title">${p.name}</span>
          <p>$${p.price.toFixed(2)}</p>
        </div>
        <div class="card-action">
          <a href="product.html?slug=${encodeURIComponent(p.slug)}" class="btn black">View</a>
        </div>
      </div>
    </div>  
  `).join('');
  grid.insertAdjacentHTML('beforeend', html);
}

// Infinite scroll: observe sentinel element, load more when visible
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) loadPage();
  }
}, { rootMargin: '400px' }); // start loading before bottom reached
io.observe(sentinel);

// Category filter switching
chips.forEach(chip => chip.addEventListener('click', () => {
  currentCategory = chip.dataset.cat || ''; // new category
  grid.innerHTML = ''; // clear grid
  page = 1; pages = 1; // reset pagination
  setActiveChip();
  loadPage();
}));

// Initialize page
setActiveChip();
loadPage();*/
document.addEventListener('DOMContentLoaded', () => {
  const chips = document.querySelectorAll('.category-chip');
  const grid = document.getElementById('product-grid');

  const fetchProducts = async (category = '') => {
    const res = await fetch(`/api/products${category ? `?category=${category}` : ''}`);
    const products = await res.json();
    renderProducts(products);
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
// Category chip click handler 
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const category = chip.dataset.cat;
      fetchProducts(category);
    });
  });

  fetchProducts(); // Load all products initially
});

