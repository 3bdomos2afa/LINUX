/* LINUX — seasonal collection: the CSS scene only runs while its section is on
   screen and motion is allowed. Every seasonal section includes this file;
   the guard keeps one instance. */
(function () {
  'use strict';
  if (window.__linuxSeasonal) return;
  window.__linuxSeasonal = true;
  const doc = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const live = new Map();
  const paint = (el) => el.classList.toggle('is-live', !!live.get(el) && !reduce.matches);
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((en) => { live.set(en.target, en.isIntersecting); paint(en.target); }), { rootMargin: '120px 0px' })
    : null;

  function boot(root) {
    root.querySelectorAll('[data-seasonal]').forEach((el) => {
      if (live.has(el)) return;
      live.set(el, !io);
      if (io) io.observe(el); else paint(el);
    });
  }

  // glass.js wires rails once at page load; the theme editor re-renders a
  // section in place, so its new rail needs the same prev/next wiring.
  function wireRail(rail) {
    const track = rail.querySelector('.rail__track');
    const prev = rail.querySelector('[data-rail-prev]');
    const next = rail.querySelector('[data-rail-next]');
    if (!track) return;
    const dir = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 14 : 300);
    const update = () => {
      const pos = Math.abs(track.scrollLeft);
      if (prev) prev.disabled = pos <= 2;
      if (next) next.disabled = pos >= track.scrollWidth - track.clientWidth - 2;
    };
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -step() * dir, behavior: 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: step() * dir, behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    update();
  }

  boot(doc);
  if (reduce.addEventListener) reduce.addEventListener('change', () => live.forEach((_, el) => paint(el)));
  doc.addEventListener('shopify:section:load', (e) => {
    boot(e.target);
    e.target.querySelectorAll('.seasonal [data-rail]').forEach(wireRail);
  });
  doc.addEventListener('shopify:section:unload', (e) => {
    e.target.querySelectorAll('[data-seasonal]').forEach((el) => { if (io) io.unobserve(el); live.delete(el); });
  });
})();
