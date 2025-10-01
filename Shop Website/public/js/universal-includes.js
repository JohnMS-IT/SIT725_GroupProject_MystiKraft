// Universal Includes - Load common styles and scripts for all pages
(function() {
  // Add dark mode CSS to all pages
  const darkModeLink = document.createElement('link');
  darkModeLink.rel = 'stylesheet';
  darkModeLink.href = 'css/dark-mode.css';
  document.head.appendChild(darkModeLink);

  // Load required scripts
  const scripts = [
    'js/dark-mode.js',
    'js/cart-count.js',
    'js/wishlist-count.js',
    'js/auth.js'
  ];

  scripts.forEach(src => {
    // Check if script already loaded
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
})();

