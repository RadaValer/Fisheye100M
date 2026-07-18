// Header background on scroll
const header = document.getElementById('site-header');
const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Nav dots — active section on scroll
const navDots = document.querySelectorAll('.nav-dot');
const navSections = Array.from(navDots)
  .map((dot) => document.getElementById(dot.dataset.section))
  .filter(Boolean);
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navDots.forEach((dot) => dot.classList.toggle('is-active', dot.dataset.section === id));
      }
    });
  },
  { rootMargin: '-45% 0px -45% 0px' }
);
navSections.forEach((section) => navObserver.observe(section));

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
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
revealEls.forEach((el) => revealObserver.observe(el));

// Spec tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    tabPanels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === target));
  });
});
