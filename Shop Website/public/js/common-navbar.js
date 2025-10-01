// Common Navbar for all pages - Vanilla JavaScript
(function() {
  const navbarHTML = `
    <nav class="white z-depth-1">
      <div class="nav-wrapper container">
        <a href="index.html" class="brand-logo">
          <img src="images/Logo/Logo.jpg" alt="MystiKraft Logo" style="height: 40px; vertical-align: middle;">
          MystiKraft
        </a>
        
        <!-- Burger icon for mobile -->
        <a href="#" data-target="mobile-nav" class="sidenav-trigger right" aria-label="Open navigation">
          <i class="material-icons black-text">menu</i>
        </a>

        <!-- Desktop links -->
        <ul class="right hide-on-med-and-down">
          <li><a href="index.html" class="black-text">Home</a></li>
          <li><a href="shop.html" class="black-text">Shop</a></li>
          <li><a href="about.html" class="black-text">About</a></li>
          <li><a href="contact.html" class="black-text">Contact</a></li>
          <li><a href="search.html" class="black-text">Search</a></li>
          <li>
            <a href="wishlist.html" class="black-text" title="Wishlist">
              <i class="material-icons">favorite</i>
              <span id="wishlist-count" class="new badge red">0</span>
            </a>
          </li>
          <li>
            <a href="cart.html" class="black-text" title="My Cart">
              <i class="material-icons">shopping_cart</i>
              <span id="cart-count" class="new badge">0</span>
            </a>
          </li>
          <li>
            <a href="#!" id="dark-mode-toggle" class="black-text" title="Toggle Dark Mode">
              <i class="material-icons">dark_mode</i>
            </a>
          </li>
          <li id="authLinks"><a href="#loginModal" class="modal-trigger black-text">Login</a></li>
          <li id="userMenu" class="hide">
            <a class="dropdown-trigger black-text" href="#!" data-target="dropdown1">
              <span id="userEmail">User</span>
              <i class="material-icons right">arrow_drop_down</i>
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- User Dropdown -->
    <ul id="dropdown1" class="dropdown-content">
      <li><a href="profile.html">Profile</a></li>
      <li><a href="#" id="logoutBtn">Logout</a></li>
    </ul>

    <!-- Mobile sidenav -->
    <ul class="sidenav" id="mobile-nav">
      <li><a href="index.html">Home</a></li>
      <li><a href="shop.html">Shop</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li><a href="search.html">Search</a></li>
      <li><a href="wishlist.html"><i class="material-icons">favorite</i> Wishlist</a></li>
      <li><a href="cart.html"><i class="material-icons">shopping_cart</i> My Cart</a></li>
      <li class="divider" tabindex="-1"></li>
      <li id="mobileAuthLinks"><a href="#loginModal" class="modal-trigger">Login</a></li>
      <li id="mobileUserEmail" class="hide"><a href="profile.html"><span id="mobileUserLabel">User</span></a></li>
      <li id="mobileLogout" class="hide"><a href="#" id="logoutBtnMobile">Logout</a></li>
    </ul>

    <!-- Login/Register Modal -->
    <div id="loginModal" class="modal">
      <div class="modal-content">
        <h4>Login</h4>
        <form id="loginForm">
          <div class="input-field">
            <input type="email" id="email" required>
            <label for="email">Email</label>
          </div>
          <div class="input-field">
            <input type="password" id="password" required>
            <label for="password">Password</label>
          </div>
          <button type="submit" class="btn waves-effect waves-light">Login</button>
          <button type="button" class="btn-flat" id="showRegister">Register</button>
        </form>

        <form id="registerForm" class="hide">
          <div class="input-field">
            <input type="email" id="registerEmail" required>
            <label for="registerEmail">Email</label>
          </div>
          <div class="input-field">
            <input type="password" id="registerPassword" required>
            <label for="registerPassword">Password</label>
          </div>
          <div class="input-field">
            <input type="password" id="confirmPassword" required>
            <label for="confirmPassword">Confirm Password</label>
          </div>
          <button type="submit" class="btn waves-effect waves-light">Register</button>
          <button type="button" class="btn-flat" id="showLogin">Login</button>
        </form>
      </div>
    </div>
  `;

  // Insert navbar after page load
  document.addEventListener('DOMContentLoaded', function() {
    // Check if navbar-container exists, if yes, inject navbar there
    const navContainer = document.getElementById('navbar-container');
    if (navContainer) {
      navContainer.innerHTML = navbarHTML;
    }
    
    // Initialize Materialize components after navbar is injected
    setTimeout(() => {
      M.Sidenav.init(document.querySelectorAll('.sidenav'), { edge: 'left' });
      M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {
        alignment: 'right',
        constrainWidth: false,
        coverTrigger: false
      });
      M.Modal.init(document.querySelectorAll('.modal'));
    }, 100);
  });
})();

