const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

function t(key) {
  return window.FisheyeI18n ? window.FisheyeI18n.t(key) : key;
}

function currentLang() {
  return window.FisheyeI18n ? window.FisheyeI18n.getLang() : 'ro';
}

function mediaIcon(type) {
  if (type === 'video') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5Z" fill="currentColor" stroke="none"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h11l2-2h3v14H4z"/><circle cx="12" cy="14" r="3.5"/></svg>';
}

async function renderBuildLog() {
  const container = document.getElementById('build-timeline');
  let steps = [];
  try {
    steps = await window.FisheyeApi.getBuildLog();
  } catch (err) {
    steps = [];
  }
  const lang = currentLang();

  container.innerHTML = steps.map((step, i) => `
    <article class="build-step reveal">
      <div class="build-marker">${String(i + 1).padStart(2, '0')}</div>
      <div class="build-body">
        <div class="build-meta"><span class="build-date">${step.date[lang] || step.date.ro}</span></div>
        <h3>${step.title[lang] || step.title.ro}</h3>
        <p>${step.desc[lang] || step.desc.ro}</p>
        <div class="build-media">
          <span class="build-media-badge">${step.media === 'video' ? t('build.mediaVideo') : t('build.mediaPhoto')}</span>
          ${mediaIcon(step.media)}
        </div>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

document.addEventListener('DOMContentLoaded', renderBuildLog);
window.addEventListener('fisheye-lang-changed', renderBuildLog);
