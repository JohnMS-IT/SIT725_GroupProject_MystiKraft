document.addEventListener('DOMContentLoaded', () => {
  // Initialize Materialize components
  M.AutoInit();

  const registerForm = document.getElementById('register-form');
  if (!registerForm) {
    console.error('Register form not found');
    return;
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    // Client-side validation
    if (!email || !password || !role) {
      M.toast({ html: 'Email, password, and role are required', classes: 'red', displayLength: 4000 });
      return;
    }

    if (password.length < 6) {
      M.toast({ html: 'Password must be at least 6 characters', classes: 'red', displayLength: 4000 });
      return;
    }

    try {
      console.log('Register request body:', { email, password, role });
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      console.log('Register response status:', response.status);
      const data = await response.json();
      console.log('Register response data:', data);

      if (response.ok) {
        M.toast({ html: 'Registration successful! Redirecting to login...', classes: 'green', displayLength: 4000 });
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000); // Delay redirect by 2 seconds to show toast
      } else {
        M.toast({ html: data.message || 'Registration failed', classes: 'red', displayLength: 4000 });
      }
    } catch (error) {
      console.error('Error registering:', error);
      M.toast({ html: `Server error: ${error.message}`, classes: 'red', displayLength: 4000 });
    }
  });
});