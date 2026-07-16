const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    loginError.hidden = false;
    return;
  }

  loginError.hidden = true;
  localStorage.setItem('fisheye-auth', 'true');
  localStorage.setItem('fisheye-operator-email', email);
  window.location.href = 'dashboard.html';
});
