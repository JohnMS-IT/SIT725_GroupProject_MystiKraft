// cart-count.js
async function fetchCart() {
  try {
    const res = await fetch('/api/cart');
    if (!res.ok) throw new Error('Failed to fetch cart');
    const cart = await res.json();
    return cart.items || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function updateCartCount() {
  const cart = await fetchCart();
  const count = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

function notifyCartChange(message, success = true) {
  if (M && M.toast) {
    M.toast({
      html: message,
      classes: success ? 'green darken-1' : 'orange darken-1',
      displayLength: 5000 // Display for 5 seconds
    });
  } else {
    alert(message);
  }
}

// Stock alert handler
function handleStockAlert(alert) {
  
  // Check if we are on admin page - if yes, don't show notifications to users
  if (window.location.pathname.includes('admin.html')) {
    console.log('Admin page detected, skipping user notification');
    return;
  }
  
  let message = alert.message;
  
  // If the alert doesn't have a message, create one
  if (!message) {
    if (alert.type === 'restocked') {
      message = `We just restocked ${alert.productName}, now have sufficient inventory!`;
    } else if (alert.type === 'low-stock') {
      message = `${alert.productName} is running low, only ${alert.stock} items left!`;
    }
  }
  
  console.log('Showing user notification:', message);
  notifyCartChange(message, alert.type === 'restocked');
}

// Initialize Socket.IO listeners
function initStockAlerts() {
  console.log('Initializing Socket.IO connection...');
  
  const socket = io();
  
  socket.on('connect', () => {
    console.log('Socket.IO connected successfully, connection ID:', socket.id);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket.IO disconnected, reason:', reason);
  });
  
  socket.on('stock-alert', (alert) => {
    console.log('Stock alert received via Socket.IO:', alert);
    handleStockAlert(alert);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });
}

// Manual test function for stock alerts
function testStockAlert(type = 'low-stock') {
  const testAlert = {
    type: type,
    productName: 'Test Product',
    stock: type === 'low-stock' ? 2 : 8,
    message: type === 'low-stock' 
      ? 'Test Product is running low, only 2 items left!' 
      : 'We just restocked Test Product, now have sufficient inventory!'
  };
  console.log('Manual test alert:', testAlert);
  handleStockAlert(testAlert);
  return testAlert;
}

window.CartUtils = {
  fetchCart,
  updateCartCount,
  notifyCartChange,
  handleStockAlert,
  initStockAlerts,
  testStockAlert 
};

window.testStockAlert = testStockAlert;

// Initialize when script loads
console.log('cart-count.js loaded, initializing...');
updateCartCount();
initStockAlerts();