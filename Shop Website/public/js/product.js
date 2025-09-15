// Handles individual product page: fetch product details, add to cart, checkout placeholder

// Helper to fetch JSON safely
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Get product slug from URL (e.g. product.html?slug=nike-air)
const qs = new URLSearchParams(location.search);
const slug = qs.get('slug');

// References to DOM elements
const title = document.getElementById('p-title');
const price = document.getElementById('p-price');
const image = document.getElementById('p-image');
const desc  = document.getElementById('p-desc');

// Helpers to work with localStorage cart
function getCart() {
  return JSON.parse(localStorage.getItem('bag') || '[]');
}
function setCart(c) {
  localStorage.setItem('bag', JSON.stringify(c));
  if (window.CartUtils) {
    window.CartUtils.updateCartCount(); // update navbar badge
  }
}

// Main init function
async function init() {
  if (!slug) {
    title.textContent = "Product not found";
    return;
  }

  try {
    // Fetch product details from backend
    const p = await fetchJSON(`/api/products/${encodeURIComponent(slug)}`);

    // Update page with product info
    title.textContent = p.name;
    price.textContent = `$${p.price.toFixed(2)}`;
    image.src = p.image;
    image.alt = p.name;
    desc.textContent = p.description || '';

    // Add to Bag button
    document.getElementById('btn-add').addEventListener('click', () => {
      const cart = getCart();
      const existing = cart.find(i => i.slug === p.slug);
      if (existing) {
        existing.qty += 1; // increase if already there
      } else {
        cart.push({ slug: p.slug, name: p.name, price: p.price, image: p.image, qty: 1 });
      }
      setCart(cart);

      // Toast feedback
      if (window.CartUtils) {
        window.CartUtils.notifyCartChange(`${p.name} added to bag!`);
      }
    });

    // Checkout button (placeholder)
    document.getElementById('btn-checkout').addEventListener('click', () => {
      const cart = getCart();
      if (!cart.length) {
        if (window.CartUtils) {
          window.CartUtils.notifyCartChange(" Your bag is empty", false);
        }
        return;
      }
      const totalItems = cart.reduce((s,i)=>s+i.qty,0);
      if (window.CartUtils) {
        window.CartUtils.notifyCartChange(`Checkout placeholder. You have ${totalItems} items in your bag.`);
      }
    });

  } catch (err) {
    title.textContent = "Error loading product";
    console.error(err);
  }
}

// Run init on load
init();
