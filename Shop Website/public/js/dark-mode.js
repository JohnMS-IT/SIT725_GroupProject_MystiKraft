// Dark Mode Toggle for MystiKraft
(function() {
  // Check saved preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  // Apply theme on page load immediately (before DOM loads)
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
    if (document.body) {
      document.body.classList.add('dark-mode');
    }
  }

  // Update toggle button icon if it exists
  function updateToggleIcon() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.textContent = document.body.classList.contains('dark-mode') ? 'light_mode' : 'dark_mode';
      }
    }
  }

  // Toggle dark mode
  function toggleDarkMode(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateToggleIcon();
    
    // Show toast notification
    if (typeof M !== 'undefined' && M.toast) {
      M.toast({
        html: isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled',
        classes: isDark ? 'grey darken-3' : 'blue-grey lighten-4 black-text'
      });
    }
    
    return false;
  }

  // Expose globally
  window.DarkMode = {
    toggle: toggleDarkMode,
    updateToggleIcon: updateToggleIcon
  };

  // Initialize toggle button when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Ensure dark mode is applied to body
    if (savedTheme === 'dark' && !document.body.classList.contains('dark-mode')) {
      document.body.classList.add('dark-mode');
    }
    
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
      // Remove any existing listeners
      toggleBtn.addEventListener('click', toggleDarkMode);
      updateToggleIcon();
    }
  });
})();

