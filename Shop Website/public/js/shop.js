// public/js/shop.js
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const grid = document.getElementById('product-grid');
const sentinel = document.getElementById('load-more-sentinel');
const chips = document.querySelectorAll('.category-chip');

let page = 1;
let pages = 1;
let currentCategory = '';

function setActiveChip() {
  chips.forEach(c => c.classList.remove('active'));
  const active = document.querySelector(`.category-chip[data-cat="${currentCategory}"]`);
  if (active) active.classList.add('active');
}

async function loadPage() {
  if (page > pages) return;

  const url = `/api/products?category=${encodeURIComponent(currentCategory)}&page=${page}&limit=6`;
  const data = await fetchJSON(url);

  pages = data.pages;
  page += 1;

  renderItems(data.items);
}

function renderItems(items) {
  const html = items.map(p => `
    <div class="col-lg-4 col-md-6 col-12">
      <div class="card p-3 text-center">
        <img src="${p.image}" alt="${p.name}">
        <h5 class="card-title mt-2">${p.name}</h5>
        <p class="card-text">$${p.price.toFixed(2)}</p>
        <a href="product.html?slug=${encodeURIComponent(p.slug)}" class="btn btn-sm btn-dark">View</a>
      </div>
    </div>
  `).join('');
  grid.insertAdjacentHTML('beforeend', html);
}

// Infinite scroll
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) loadPage();
  }
}, { rootMargin: '400px' });
io.observe(sentinel);

// Category switching
chips.forEach(chip => chip.addEventListener('click', () => {
  currentCategory = chip.dataset.cat || '';
  grid.innerHTML = '';
  page = 1; pages = 1;
  setActiveChip();
  loadPage();
}));

// Init
setActiveChip();
loadPage();
