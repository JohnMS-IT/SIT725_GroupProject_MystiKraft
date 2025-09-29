document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // Send registration request
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      // Handle response
      if (response.ok) {
        // Automatically log in the user after successful registration
        localStorage.setItem('token', data.token);
        M.toast({ html: 'Registration successful!', classes: 'green' });
        window.location.href = '/index.html'; // Redirect to homepage upon successful registration
      } else {
        M.toast({ html: data.message || 'Registration failed', classes: 'red' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      M.toast({ html: 'Server error', classes: 'red' });
    }
  });
});