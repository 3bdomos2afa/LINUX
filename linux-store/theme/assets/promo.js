/* LINUX — promotions: promo popup · video reels · offer spotlight.
   Several sections include this file; the guard keeps one instance. */
(function () {
  'use strict';
  if (window.__linuxPromo) return;
  window.__linuxPromo = true;
  const doc = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
  };

  /* ---- Promo popup ------------------------------------------------------- */
  function initPopup(dlg) {
    if (!dlg || dlg.dataset.ready || typeof dlg.showModal !== 'function') return;
    dlg.dataset.ready = '1';
    const key = 'linux:promo:v' + (dlg.dataset.version || '1');
    const days = Math.max(1, Number(dlg.dataset.days) || 7);
    const open = () => {
      if (dlg.open) return;
      dlg.classList.remove('is-closing');
      dlg.showModal();
      store.set(key, String(Date.now()));
    };
    const close = () => {
      if (!dlg.open) return;
      dlg.classList.add('is-closing');
      setTimeout(() => { dlg.close(); dlg.classList.remove('is-closing'); }, reduce ? 0 : 250);
    };
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    dlg.querySelectorAll('[data-promo-close]').forEach((b) => b.addEventListener('click', close));

    // Returning from a newsletter sign-up: show the confirmation once.
    if (dlg.querySelector('[data-promo-done]')) { open(); return; }
    if (window.Shopify && window.Shopify.designMode) {
      const mine = (e) => dlg.closest('.shopify-section') && dlg.closest('.shopify-section').id === 'shopify-section-' + e.detail.sectionId;
      doc.addEventListener('shopify:section:select', (e) => { if (mine(e)) open(); });
      doc.addEventListener('shopify:section:deselect', (e) => { if (mine(e)) close(); });
      return;
    }
    const last = Number(store.get(key) || 0);
    if (Date.now() - last < days * 864e5) return;
    const trigger = dlg.dataset.trigger || 'both';
    let armed = true;
    const fire = () => {
      if (!armed) return;
      // Never interrupt an open drawer or another dialog; try again shortly.
      if (doc.body.classList.contains('drawer-open') || doc.querySelector('dialog[open]')) { setTimeout(fire, 5000); return; }
      armed = false;
      open();
    };
    if (trigger !== 'exit') setTimeout(fire, Math.max(3, Number(dlg.dataset.delay) || 12) * 1000);
    if (trigger !== 'delay') {
      doc.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY <= 0) fire(); });
      const onScroll = () => {
        if (window.scrollY > (doc.documentElement.scrollHeight - innerHeight) * 0.5) { removeEventListener('scroll', onScroll); fire(); }
      };
      if (matchMedia('(pointer: coarse)').matches) addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /* ---- Video reels: play only on screen, one with sound at a time --------- */
  let io = null;
  function initReels(root) {
    const reels = root.querySelectorAll('[data-reel]');
    if (!reels.length) return;
    const saveData = navigator.connection && navigator.connection.saveData;
    const start = (reel) => {
      const v = reel.querySelector('video');
      if (!v) return;
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      if (reduce || saveData) return;
      const p = v.play();
      if (p && p.then) p.then(() => reel.classList.add('is-playing')).catch(() => {});
    };
    const stop = (reel) => { const v = reel.querySelector('video'); if (v && !v.paused) v.pause(); reel.classList.remove('is-playing'); };
    if ('IntersectionObserver' in window) {
      io = io || new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? start(en.target) : stop(en.target))), { threshold: 0.55 });
      reels.forEach((r) => { if (!r.dataset.watched) { r.dataset.watched = '1'; io.observe(r); } });
    }
    reels.forEach((reel) => {
      const btn = reel.querySelector('[data-reel-sound]');
      if (!btn || btn.dataset.ready) return;
      btn.dataset.ready = '1';
      btn.addEventListener('click', () => {
        const v = reel.querySelector('video');
        if (!v) return;
        const on = btn.getAttribute('aria-pressed') !== 'true';
        doc.querySelectorAll('[data-reel-sound][aria-pressed="true"]').forEach((b) => {
          b.setAttribute('aria-pressed', 'false');
          const other = b.closest('[data-reel]').querySelector('video');
          if (other) other.muted = true;
        });
        if (!v.src && v.dataset.src) v.src = v.dataset.src;
        v.muted = !on;
        btn.setAttribute('aria-pressed', String(on));
        if (on) { v.play().then(() => reel.classList.add('is-playing')).catch(() => {}); }
      });
    });
  }

  /* ---- Offer spotlight: retire the card once its end time has passed ------ */
  function initSpot(el) {
    const end = el.dataset.hideEnded ? Date.parse(el.dataset.hideEnded) : NaN;
    if (!Number.isFinite(end)) return;
    const section = el.closest('.shopify-section') || el;
    const left = end - Date.now();
    if (left <= 0) { if (!(window.Shopify && window.Shopify.designMode)) section.hidden = true; return; }
    if (left < 2147483647) setTimeout(() => { section.hidden = true; }, left + 1500);
  }

  /* Code chips confirm the copy in place (global.js does the copying) */
  doc.addEventListener('click', (e) => {
    const chip = e.target.closest('.offer-code');
    if (!chip) return;
    chip.classList.add('is-copied');
    setTimeout(() => chip.classList.remove('is-copied'), 1600);
  });

  const boot = (root) => {
    root.querySelectorAll('[data-promo]').forEach(initPopup);
    initReels(root);
    root.querySelectorAll('[data-offer-spot]').forEach(initSpot);
  };
  boot(doc);
  doc.addEventListener('shopify:section:load', (e) => boot(e.target));
})();
