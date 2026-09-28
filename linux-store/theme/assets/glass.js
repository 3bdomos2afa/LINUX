/* LINUX — Liquid Glass interaction layer
   specular highlight · magnetic buttons · header morph · hero parallax &
   pause · scroll reveal · mega menu keyboard support. Respects reduced motion. */
(function () {
  'use strict';
  const doc = document;
  const L = window.LINUX || (window.LINUX = {});
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  /* Hover-swap card images are only fetched on pointer devices (they never show on touch) */
  if (fine) doc.querySelectorAll('img[data-hover-only][data-src]').forEach((img) => { img.src = img.dataset.src; });
  else doc.querySelectorAll('img[data-hover-only]').forEach((img) => img.remove());

  /* Specular sheen follows the pointer on [data-specular] glass */
  if (fine && !reduce) {
    doc.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest('[data-specular]');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* Magnetic pull on primary CTAs */
  if (fine && !reduce) {
    doc.addEventListener('pointermove', (e) => {
      const btn = e.target.closest && e.target.closest('[data-magnetic]');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.22;
      btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }, { passive: true });
    doc.addEventListener('pointerout', (e) => {
      const btn = e.target.closest && e.target.closest('[data-magnetic]');
      if (btn && !btn.contains(e.relatedTarget)) btn.style.transform = '';
    });
  }

  /* Header: compact capsule on scroll, hide on scroll-down past the fold.
     The tab bar tucks while reading and springs back on scroll-up. */
  const header = doc.querySelector('[data-header]');
  const tabBar = doc.querySelector('[data-tab-bar]');
  const root = doc.documentElement;
  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const goingDown = y > lastY + 2, goingUp = y < lastY - 2;
    if (root) root.classList.toggle('is-scrolled', y > 40);
    if (header) {
      header.classList.toggle('is-compact', y > 48);
      if (goingDown && y > 140 && !doc.body.classList.contains('drawer-open')) header.classList.add('is-hidden');
      else if (goingUp || y <= 140) header.classList.remove('is-hidden');
      const zone = header.closest('[data-header-zone]');
      zone && zone.classList.toggle('is-scrolled', y > 40);
    }
    if (tabBar) {
      if (goingDown && y > 220) tabBar.classList.add('is-tucked');
      else if (goingUp || y <= 220) tabBar.classList.remove('is-tucked');
    }
    lastY = y; ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* Tab bar lens: sits under the current tab, springs to the tapped one before
     navigation (view transitions carry it across pages where supported). */
  if (tabBar) {
    const lens = tabBar.querySelector('.tab-bar__lens');
    const place = (item, animate) => {
      if (!lens) return;
      if (!item || item.classList.contains('tab-bar__item--primary')) { tabBar.classList.remove('has-lens'); return; }
      if (!animate) lens.style.transition = 'none';
      lens.style.setProperty('--lens-x', item.offsetLeft + 'px');
      lens.style.setProperty('--lens-w', item.offsetWidth + 'px');
      tabBar.classList.add('has-lens');
      if (!animate) { void lens.offsetWidth; lens.style.transition = ''; }
    };
    const current = () => tabBar.querySelector('.tab-bar__item.is-active');
    requestAnimationFrame(() => place(current(), false));
    addEventListener('resize', () => place(current(), false));
    tabBar.addEventListener('pointerdown', (e) => {
      const item = e.target.closest('.tab-bar__item');
      if (!item || item.matches('[data-drawer-open]')) return;
      place(item, !reduce);
      L.buzz && L.buzz(6);
    });
    addEventListener('pageshow', (e) => { if (e.persisted) place(current(), false); });
  }

  /* Announcement v2: rotating offers (swipe on phones, arrows on desktop).
     Hidden slides are inert, so only the visible offer is focusable. */
  doc.querySelectorAll('[data-announce]').forEach((bar) => {
    const slides = Array.from(bar.querySelectorAll('[data-announce-slide]'));
    if (slides.length < 2) return;
    const rtl = getComputedStyle(bar).direction === 'rtl';
    const every = Math.max(3, Number(bar.dataset.interval) || 5) * 1000;
    let i = 0, timer = null, paused = false;
    const show = (n) => {
      const prev = slides[i];
      i = (n + slides.length) % slides.length;
      if (prev === slides[i]) return;
      prev.classList.remove('is-active'); prev.classList.add('is-leaving'); prev.setAttribute('aria-hidden', 'true'); prev.inert = true;
      setTimeout(() => prev.classList.remove('is-leaving'), 650);
      slides[i].classList.add('is-active'); slides[i].removeAttribute('aria-hidden'); slides[i].inert = false;
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { stop(); if (!reduce && !paused && !doc.hidden) timer = setInterval(() => show(i + 1), every); };
    const prevBtn = bar.querySelector('[data-announce-prev]');
    const nextBtn = bar.querySelector('[data-announce-next]');
    prevBtn && prevBtn.addEventListener('click', () => { show(i - 1); start(); });
    nextBtn && nextBtn.addEventListener('click', () => { show(i + 1); start(); });
    bar.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { paused = true; stop(); } });
    bar.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { paused = false; start(); } });
    bar.addEventListener('focusin', () => { paused = true; stop(); });
    bar.addEventListener('focusout', (e) => { if (!bar.contains(e.relatedTarget)) { paused = false; start(); } });
    let x0 = null;
    bar.addEventListener('pointerdown', (e) => { x0 = e.clientX; }, { passive: true });
    bar.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) < 30) return;
      show(i + ((dx < 0) !== rtl ? 1 : -1)); start();
    });
    doc.addEventListener('visibilitychange', start);
    start();
  });

  /* Code chips confirm the copy in place (global.js performs the copy) */
  doc.addEventListener('click', (e) => {
    const chip = e.target.closest('.announce__code');
    if (!chip) return;
    chip.classList.add('is-copied');
    setTimeout(() => chip.classList.remove('is-copied'), 1600);
  });

  /* Liquid Glass refraction (Chromium only). backdrop-filter:url() is ignored by
     WebKit/Gecko and would take the blur down with it, so it is only applied
     where it renders. Each [data-lens] surface gets a displacement map sized to
     its own box, so the bent rim keeps a constant width on any shape. */
  (function lensing() {
    const level = (L.settings && L.settings.refraction) || 'subtle';
    if (level === 'off' || typeof navigator === 'undefined' || typeof ResizeObserver === 'undefined' || !window.CSS || !CSS.supports || !root) return;
    const brands = navigator.userAgentData && navigator.userAgentData.brands;
    const chromium = !!(brands && brands.some((b) => /Chromium|Google Chrome|Microsoft Edge|Opera|Samsung/i.test(b.brand)));
    const lowEnd = (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.connection && navigator.connection.saveData);
    if (!chromium || lowEnd || !CSS.supports('backdrop-filter', 'url(#x) blur(1px)')) return;
    if (matchMedia('(prefers-reduced-transparency: reduce)').matches) return;
    const NS = 'http://www.w3.org/2000/svg';
    const defs = doc.createElementNS(NS, 'svg');
    defs.setAttribute('aria-hidden', 'true');
    defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
    defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    doc.body.appendChild(defs);
    const strength = level === 'strong' ? 1.7 : 1;
    let seq = 0;
    const mapFor = (w, h, radius, bezel) => {
      const inner = Math.max(0, radius - bezel);
      const svg = `<svg xmlns="${NS}" width="${w}" height="${h}"><defs><linearGradient id="x"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient><linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(bezel / 2.2).toFixed(1)}"/></filter></defs><rect width="${w}" height="${h}" fill="url(#x)"/><rect width="${w}" height="${h}" fill="url(#y)" style="mix-blend-mode:screen"/><rect x="${bezel}" y="${bezel}" width="${Math.max(1, w - bezel * 2)}" height="${Math.max(1, h - bezel * 2)}" rx="${inner}" fill="#808080" filter="url(#b)"/></svg>`;
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };
    const apply = (el) => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (w < 24 || h < 24) return;
      const cs = getComputedStyle(el);
      const radius = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, h / 2, w / 2);
      const bezel = Math.round(Math.max(6, Math.min(16, h * 0.28)));
      const scale = Math.round(Math.min(34, h * 0.42) * strength);
      let id = el.dataset.lensId;
      if (!id) { id = 'lg-lens-' + (++seq); el.dataset.lensId = id; }
      let f = defs.querySelector('#' + id);
      if (!f) { f = doc.createElementNS(NS, 'filter'); f.id = id; f.setAttribute('color-interpolation-filters', 'sRGB'); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '100%'); f.setAttribute('height', '100%'); defs.appendChild(f); }
      f.innerHTML = `<feImage href="${mapFor(w, h, radius, bezel)}" x="0" y="0" width="${w}" height="${h}" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>`;
      const blur = el.matches('.glass--solid, .tab-bar, .header') ? 14 : 8;
      const value = `blur(${blur}px) url(#${id}) saturate(175%) brightness(1.04)`;
      el.style.setProperty('-webkit-backdrop-filter', value);
      el.style.setProperty('backdrop-filter', value);
      el.classList.add('is-lensed');
    };
    const pause = (el) => { el.style.removeProperty('backdrop-filter'); el.style.removeProperty('-webkit-backdrop-filter'); el.classList.remove('is-lensed'); };
    const timers = new WeakMap();
    const ro = new ResizeObserver((entries) => entries.forEach(({ target }) => {
      // A stale map during a size transition would tear, so drop to plain blur until it settles.
      pause(target);
      clearTimeout(timers.get(target));
      timers.set(target, setTimeout(() => apply(target), 180));
    }));
    const watch = (el) => { if (el.dataset.lensWatched) return; el.dataset.lensWatched = '1'; ro.observe(el); };
    doc.querySelectorAll('[data-lens]').forEach(watch);
    new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.matches('[data-lens]')) watch(n);
      n.querySelectorAll && n.querySelectorAll('[data-lens]').forEach(watch);
    }))).observe(doc.body, { childList: true, subtree: true });
    root.classList.add('has-refraction');
  })();

  /* Hero video pause/play + Save-Data respect */
  const video = doc.querySelector('[data-hero-video]');
  if (video) {
    const saveData = navigator.connection && navigator.connection.saveData;
    const toggle = doc.querySelector('[data-hero-toggle]');
    let held = reduce || saveData;
    const sync = () => {
      if (!toggle) return;
      toggle.setAttribute('aria-pressed', String(held));
      const label = toggle.querySelector('span');
      if (label) label.textContent = held ? toggle.dataset.labelPlay : toggle.dataset.labelPause;
    };
    toggle && toggle.addEventListener('click', () => { held = !held; if (held) video.pause(); else video.play().catch(() => {}); sync(); });
    sync();
    if (held) { video.pause(); video.removeAttribute('autoplay'); }
    else { video.play().catch(() => {}); }
    // Free the decoder when the hero is off-screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting && !held) video.play().catch(() => {}); else video.pause();
      }), { threshold: 0.05 }).observe(video);
    }
  }

  /* Scroll reveal */
  const revealables = doc.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealables.forEach((el) => io.observe(el));
    // Re-observe elements injected later (rails, search results)
    new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.matches && n.matches('[data-reveal]') && !n.classList.contains('is-in')) io.observe(n);
      n.querySelectorAll && n.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    }))).observe(doc.body, { childList: true, subtree: true });
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* Split headlines into words so they can rise one by one */
  doc.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const outer = doc.createElement('span'); outer.className = 'w'; outer.style.setProperty('--w', i);
      const inner = doc.createElement('span'); inner.textContent = w;
      outer.appendChild(inner); el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(doc.createTextNode(' '));
    });
    el.dataset.splitDone = '1';
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
  });

  /* Count-up numbers when they scroll into view: <strong data-count>4,000</strong> */
  if ('IntersectionObserver' in window && !reduce) {
    const displayDigits = window.LINUX?.digits || ((value) => String(value));
    const asciiDigits = (value) => String(value).replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
    const cio = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      const el = en.target, raw = el.textContent.trim();
      const m = asciiDigits(raw).match(/^([^\d]*)([\d,.٬٫]+)(.*)$/);
      if (!m || /[A-Za-z]/.test(m[1] + m[3])) return;
      const number = m[2].replace(/٬/g, ',').replace(/٫/g, '.');
      const target = parseFloat(number.replace(/,/g, ''));
      if (!Number.isFinite(target)) return;
      const decimals = (number.split('.')[1] || '').length;
      const group = m[2].includes('٬') ? '٬' : m[2].includes(',') ? ',' : '';
      const decimal = m[2].includes('٫') ? '٫' : '.';
      const t0 = performance.now(), dur = 1200;
      const fmt = (v) => {
        let [whole, fraction] = v.toFixed(decimals).split('.');
        if (group) whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
        return displayDigits(m[1] + whole + (fraction ? decimal + fraction : '') + m[3]);
      };
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(target * e); if (p < 1) requestAnimationFrame(tick); else el.textContent = raw; };
      requestAnimationFrame(tick);
    }), { threshold: 0.4 });
    doc.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));
  }

  /* 3D tilt + glare on cards (pointer devices only) */
  if (fine && !reduce) {
    let tiltEl = null;
    doc.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest('[data-tilt]');
      if (tiltEl && tiltEl !== el) { tiltEl.classList.remove('is-tilting'); tiltEl.style.removeProperty('--rx'); tiltEl.style.removeProperty('--ry'); }
      tiltEl = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.classList.add('is-tilting');
      el.style.setProperty('--ry', ((px - .5) * 8).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((.5 - py) * 8).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    }, { passive: true });
    doc.addEventListener('pointerleave', () => { if (tiltEl) { tiltEl.classList.remove('is-tilting'); tiltEl = null; } }, true);
    doc.addEventListener('pointerout', (e) => {
      const el = e.target.closest && e.target.closest('[data-tilt]');
      if (el && !el.contains(e.relatedTarget)) { el.classList.remove('is-tilting'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); if (tiltEl === el) tiltEl = null; }
    });
  }

  /* Elements with data-parallax drift at their own rate while the hero scrolls */
  const parallaxEls = doc.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduce) {
    addEventListener('scroll', () => {
      const y = window.scrollY; if (y > window.innerHeight * 1.2) return;
      parallaxEls.forEach((el) => { el.style.translate = `0 ${(y * parseFloat(el.dataset.parallax || '0.1')).toFixed(1)}px`; });
    }, { passive: true });
  }

  /* Intro curtain: removed once its exit animation ends (or immediately on repeat visits) */
  const curtain = doc.querySelector('.curtain');
  if (curtain) {
    const seen = sessionStorage.getItem('linux:curtain');
    if (seen || reduce) curtain.remove();
    else { sessionStorage.setItem('linux:curtain', '1'); curtain.addEventListener('animationend', (e) => { if (e.animationName === 'curtain-out') curtain.remove(); }); setTimeout(() => curtain.remove(), 2200); }
  }

  /* Mega menu: keyboard + touch open */
  doc.querySelectorAll('[data-mega]').forEach((item) => {
    const link = item.querySelector('.nav-link');
    link.addEventListener('click', (e) => {
      if (!fine || matchMedia('(hover: none)').matches) {
        if (!item.classList.contains('is-open')) { e.preventDefault(); doc.querySelectorAll('[data-mega].is-open').forEach((o) => o !== item && o.classList.remove('is-open')); item.classList.add('is-open'); link.setAttribute('aria-expanded', 'true'); }
      }
    });
    link.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); item.classList.add('is-open'); link.setAttribute('aria-expanded', 'true'); const first = item.querySelector('.mega a'); first && first.focus(); } });
    item.addEventListener('keydown', (e) => { if (e.key === 'Escape') { item.classList.remove('is-open'); link.setAttribute('aria-expanded', 'false'); link.focus(); } });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) { item.classList.remove('is-open'); link.setAttribute('aria-expanded', 'false'); } });
  });
  doc.addEventListener('click', (e) => { if (!e.target.closest('[data-mega]')) doc.querySelectorAll('[data-mega].is-open').forEach((o) => { o.classList.remove('is-open'); o.querySelector('.nav-link').setAttribute('aria-expanded', 'false'); }); });

  /* Rails: prev/next buttons */
  doc.querySelectorAll('[data-rail]').forEach((rail) => {
    const track = rail.querySelector('.rail__track');
    const prev = rail.querySelector('[data-rail-prev]');
    const next = rail.querySelector('[data-rail-next]');
    if (!track) return;
    const dir = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    const step = () => { const first = track.firstElementChild; return first ? first.getBoundingClientRect().width + 20 : 300; };
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -step() * dir, behavior: 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: step() * dir, behavior: 'smooth' }));
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      const pos = Math.abs(track.scrollLeft);
      if (prev) prev.disabled = pos <= 2;
      if (next) next.disabled = pos >= max;
    };
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  });

  /* Hotspots (shop the look) */
  doc.addEventListener('click', (e) => {
    const spot = e.target.closest('[data-hotspot]');
    const openCards = doc.querySelectorAll('.hotspot__card.is-open');
    if (!spot) { if (!e.target.closest('.hotspot__card')) openCards.forEach((c) => c.classList.remove('is-open')); return; }
    const card = spot.nextElementSibling;
    openCards.forEach((c) => c !== card && c.classList.remove('is-open'));
    card && card.classList.toggle('is-open');
  });

  /* Marquees only animate while on screen */
  if ('IntersectionObserver' in window) {
    const mio = new IntersectionObserver((entries) => entries.forEach((en) => { en.target.style.animationPlayState = en.isIntersecting ? '' : 'paused'; }), { threshold: 0 });
    doc.querySelectorAll('.marquee__track, .announcement__track').forEach((t) => mio.observe(t));
  }
  /* Announcement duplicates for seamless marquee are in Liquid; pause on hover */
  doc.querySelectorAll('.announcement').forEach((a) => {
    a.addEventListener('pointerenter', () => a.querySelector('.announcement__track').style.animationPlayState = 'paused');
    a.addEventListener('pointerleave', () => a.querySelector('.announcement__track').style.animationPlayState = '');
  });
})();
