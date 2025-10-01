// Wishlist Utils for badge updates (API-based)

// Fetch wishlist from backend
async function fetchWishlist() {
  try {
    const res = await fetch('/api/wishlist', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    const wishlist = await res.json();
    return wishlist.items || [];
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    return [];
  }
}

// Update wishlist count badge in navbar
async function updateWishlistCount() {
  const wishlist = await fetchWishlist();
  const count = wishlist.length;
  const el = document.getElementById('wishlist-count');
  if (el) el.textContent = count;
}

// Expose globally
window.WishlistUtils = {
  fetchWishlist,
  updateWishlistCount
};

// Initial update on page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('wishlist-count')) {
    updateWishlistCount();
  }
});

