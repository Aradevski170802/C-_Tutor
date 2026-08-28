(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      const sync = () => {
        const isDark =
          root.getAttribute('data-theme') === 'dark' ||
          (!root.hasAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        toggle.textContent = isDark ? '☀️' : '🌙';
      };
      sync();
      toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') ||
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        sync();
      });
    }

    const navToggle = document.querySelector('[data-nav-toggle]');
    const navLinks = document.querySelector('[data-nav-links]');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    }

    const here = document.body.dataset.page;
    if (here) {
      document.querySelectorAll('[data-nav-links] a').forEach((a) => {
        if (a.dataset.page === here) a.classList.add('active');
      });
    }
  });
})();
