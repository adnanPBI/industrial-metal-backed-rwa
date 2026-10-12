(() => {
  'use strict';
  const key = 'reservechain.theme';
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem(key); } catch (_) {}
  let current = saved === 'light' || saved === 'dark'
    ? saved
    : (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  function apply(theme) {
    current = theme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f9fd' : '#020916');
    document.querySelectorAll('button[data-theme-toggle]').forEach(button => {
      const target = theme === 'light' ? 'blue glass' : 'soft white';
      button.setAttribute('aria-label', 'Switch to ' + target + ' theme');
      button.setAttribute('title', 'Switch to ' + target + ' theme');
      const icon=button.querySelector('[data-theme-icon]');
      const label=button.querySelector('[data-theme-label]');
      if (icon) icon.textContent=theme === 'light' ? '☾' : '☀';
      if (label) label.textContent=theme === 'light' ? 'Blue glass' : 'Soft white';
    });
    document.querySelectorAll('img[data-theme-logo]').forEach(image => {
      const src = theme === 'light' ? image.dataset.lightSrc : image.dataset.darkSrc;
      if (src && image.getAttribute('src') !== src) image.setAttribute('src',src);
    });
  }
  function set(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    apply(theme);
    try { localStorage.setItem(key,theme); } catch (_) {}
  }
  document.addEventListener('click', e => {
    const button=e.target.closest?.('button[data-theme-toggle]');
    if (button) set(current === 'light' ? 'dark' : 'light');
  });
  document.addEventListener('DOMContentLoaded', () => apply(current));
  apply(current);
  window.ReserveChainTheme = { get:() => current, set, refresh:() => apply(current) };
})();
