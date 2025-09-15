// public/js/product.js
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const qs = new URLSearchParams(location.search);
const slug = qs.get('slug');

const title = document.getElementById('p-title');
const price = document.getElementById('p-price');
const image = document.getElementById('p-image');
const desc  = document.getElementById('p-desc');

function getCart() {
  return JSON.parse(localStorage.getItem('bag') || '[]');
}
function setCart(c) {
  localStorage.setItem('bag', JSON.stringify(c));
}

async function init() {
  if (!slug) {
    title.textContent = "Product not found";
    return;
  }

  try {
    const p = await fetchJSON(`/api/products/${encodeURIComponent(slug)}`);

    title.textContent = p.name;
    price.textContent = `$${p.price.toFixed(2)}`;
    image.src = p.image;
    image.alt = p.name;
    desc.textContent = p.description || '';

    // Add to Bag
    document.getElementById('btn-add').addEventListener('click', () => {
      const cart = getCart();
      const existing = cart.find(i => i.slug === p.slug);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ slug: p.slug, name: p.name, price: p.price, image: p.image, qty: 1 });
      }
      setCart(cart);
      alert("✅ Added to bag");
    });

    // Checkout
    document.getElementById('btn-checkout').addEventListener('click', () => {
      const cart = getCart();
      if (!cart.length) {
        alert("👜 Your bag is empty");
        return;
      }
      alert(`🛒 Checkout placeholder. You have ${cart.reduce((s,i)=>s+i.qty,0)} items in your bag.`);
    });

  } catch (err) {
    title.textContent = "Error loading product";
    console.error(err);
  }
}

init();
