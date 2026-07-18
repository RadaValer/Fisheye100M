const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const submitBtn = loginForm.querySelector('button[type="submit"]');

function t(key) {
  return window.FisheyeI18n ? window.FisheyeI18n.t(key) : key;
}

function showError(key) {
  loginError.textContent = t(key);
  loginError.hidden = false;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showError('login.error');
    return;
  }

  loginError.hidden = true;
  submitBtn.disabled = true;

  try {
    await window.FisheyeApi.login(email, password);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showError('login.invalidCredentials');
    submitBtn.disabled = false;
  }
});
