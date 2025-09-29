document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        M.toast({ html: 'Login successful!', classes: 'green' });
        window.location.href = '/index.html'; // Redirect to homepage
      } else {
        M.toast({ html: data.message || 'Login failed', classes: 'red' });
      }
    } catch (error) {
      console.error('Login error:', error);
      M.toast({ html: 'Server error', classes: 'red' });
    }
  });
});