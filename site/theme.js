(function () {
  var themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  var rootEl = document.documentElement;
  themeToggle.addEventListener('click', function () {
    var next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    rootEl.setAttribute('data-theme', next);
    localStorage.setItem('fisheye-theme', next);
  });
})();
