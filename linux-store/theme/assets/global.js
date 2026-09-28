/* LINUX — global utilities: event bus, fetch, money, focus trap, toast */
(function () {
  'use strict';
  const L = (window.LINUX = window.LINUX || {});
  const S = L.settings || {};

  const listeners = new Map();
  L.on = (ev, fn) => { if (!listeners.has(ev)) listeners.set(ev, new Set()); listeners.get(ev).add(fn); return () => listeners.get(ev).delete(fn); };
  L.emit = (ev, data) => { (listeners.get(ev) || []).forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } }); };

  /* Word-level Arabic fallback for client-rendered product titles (mirrors snippets/product-title.liquid) */
  L.title = (title) => {
    if (!L.words || /[\u0600-\u06FF]/.test(title)) return title;
    return String(title).split(' ').map((w) => L.words[w.toLowerCase()] || w).join(' ');
  };
  /* Arabic-Indic numerals, so a price painted by JS looks exactly like the same
     price painted by Liquid (see snippets/money.liquid) instead of switching
     numeral sets when a variant changes. */
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const arDigits = (s) => String(s).replace(/\d/g, (d) => AR_DIGITS[d]);
  L.money = function (cents) {
    if (cents == null || isNaN(cents)) return '';
    const n = Number(cents) / 100;
    const two = n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Arabic: "١,١٥٠ جنيه" (mirrors snippets/money.liquid); other locales: the shop's money format
    if (S.locale === 'ar') return arDigits(two.replace(/\.00$/, '')) + ' ' + (S.currencyAr || 'جنيه');
    const fmt = S.moneyFormat || 'LE {{amount}}';
    return fmt
      .replace(/{{\s*amount_no_decimals\s*}}/g, Math.round(n).toLocaleString('en-US'))
      .replace(/{{\s*amount_no_trailing_zeros\s*}}/g, two.replace(/\.00$/, ''))
      .replace(/{{\s*amount_with_comma_separator\s*}}/g, n.toFixed(2).replace('.', ','))
      .replace(/{{\s*amount\s*}}/g, two.replace(/\.00$/, ''))
      .replace(/<[^>]+>/g, '');
  };

  L.fetchJSON = async function (url, opts = {}) {
    const res = await fetch(url, { credentials: 'same-origin', ...opts, headers: { Accept: 'application/json', ...(opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) } });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    if (!res.ok) { const err = new Error((data && (data.description || data.message)) || (L.strings && L.strings.error) || res.statusText || 'Request failed'); err.status = res.status; err.body = data; throw err; }
    return data;
  };

  L.debounce = (fn, wait = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; };

  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  L.trapFocus = function (container) {
    if (!container) return () => {};
    const items = () => Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const list = items(); if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    container.addEventListener('keydown', onKey);
    const first = items().find((el) => !el.hasAttribute('data-drawer-close')) || items()[0];
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
    return () => container.removeEventListener('keydown', onKey);
  };

  /* Notifications — a "Dynamic Island" capsule that drops in at the top,
     morphing out of a small pill. Swipe up or tap × to dismiss; hovering or
     touching pauses the timer. API: L.toast(message, { type, icon, image,
     action: { label, href, onClick }, duration }) */
  const TOAST_ICONS = {
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    error: '<path d="M12 8v5M12 16.5h.01"/><circle cx="12" cy="12" r="9"/>',
    ticket: '<path d="M4 6h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7a1 1 0 0 1 1-1Z"/><path d="M14.5 6.5v1.5M14.5 11.2v1.6M14.5 16v1.5"/>',
    heart: '<path d="m12 20-7.3-7.1a5 5 0 0 1 7.1-7.1l.2.2.2-.2a5 5 0 0 1 7.1 7.1L12 20Z" fill="currentColor"/>',
    bag: '<path d="M5 8h14l1 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L5 8Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>',
    bell: '<path d="M6 9.8a6 6 0 0 1 12 0c0 4.4 1.7 5.9 2 6.4H4c.3-.5 2-2 2-6.4Z"/><path d="M10 19.5a2 2 0 0 0 4 0"/>',
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  L.toast = function (message, { type = 'success', icon, image, action, duration = 3600 } = {}) {
    const stack = document.querySelector('.toast-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const glyph = TOAST_ICONS[icon] || TOAST_ICONS[type === 'error' ? 'error' : 'check'];
    const lead = image
      ? `<img class="toast__img" src="${esc(image)}" alt="" width="36" height="44">`
      : `<span class="toast__icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyph}</svg></span>`;
    // Messages are theme strings that may carry markup (e.g. a bold amount); callers never pass shopper input.
    el.innerHTML = `${lead}<span class="toast__msg">${message}</span>${action ? `<a class="toast__action" href="${esc(action.href || '#')}" data-toast-action>${esc(action.label)}</a>` : ''}<button class="toast__close" type="button" aria-label="${esc((L.strings && L.strings.close) || '×')}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button><span class="toast__timer" aria-hidden="true"></span>`;
    el.style.setProperty('--toast-d', duration + 'ms');
    if (action && action.onClick) el.querySelector('[data-toast-action]').addEventListener('click', (e) => { e.preventDefault(); action.onClick(); kill(); });
    stack.prepend(el);
    while (stack.children.length > 3) stack.lastElementChild.remove();
    let left = duration, started = Date.now(), t = null, gone = false;
    const kill = (up) => {
      if (gone) return; gone = true; clearTimeout(t);
      el.classList.add(up ? 'is-flung' : 'is-leaving');
      setTimeout(() => el.remove(), 420);
    };
    const run = () => { started = Date.now(); t = setTimeout(kill, left); el.classList.remove('is-paused'); };
    const hold = () => { clearTimeout(t); left = Math.max(900, left - (Date.now() - started)); el.classList.add('is-paused'); };
    el.addEventListener('pointerenter', hold);
    el.addEventListener('pointerleave', () => { if (!gone) run(); });
    el.querySelector('.toast__close').addEventListener('click', () => kill());
    let y0 = null;
    el.addEventListener('pointerdown', (e) => { y0 = e.clientY; hold(); });
    el.addEventListener('pointermove', (e) => { if (y0 !== null) el.style.transform = `translateY(${Math.min(0, e.clientY - y0)}px)`; });
    const release = (e) => {
      if (y0 === null) return;
      const dy = e.clientY - y0; y0 = null; el.style.transform = '';
      if (dy < -24) kill(true); else if (!gone) run();
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    run();
    L.buzz && L.buzz(type === 'error' ? [12, 60, 12] : 8);
    return el;
  };

  // Haptic-ish feedback on supported devices for primary actions
  L.buzz = (ms = 8) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch {} };

  /* Arabic-Indic numerals for anything a script prints beside a price
     (percentages, counts), so numbers never mix numeral sets on the page. */
  L.digits = (value) => (S.locale === 'ar' ? arDigits(value) : String(value));

  // Shopify Section Rendering helper
  L.renderSection = async function (sectionId, url = window.location.pathname) {
    const u = new URL(url, window.location.origin);
    u.searchParams.set('section_id', sectionId);
    const res = await fetch(u.toString(), { credentials: 'same-origin' });
    if (!res.ok) throw new Error('section render failed');
    const html = await res.text();
    const tpl = document.createElement('div');
    tpl.innerHTML = html;
    return tpl;
  };

  /* Verify each declared Arabic face directly; same-width cuts are valid. */
  if (S.locale === 'ar' && document.fonts) {
    const cuts = [
      { weight: 400, file: 'thmanyahsans-Regular.woff2' },
      { weight: 500, file: 'thmanyahsans-Medium.woff2' },
      { weight: 900, file: 'thmanyahsans-Black.woff2' }
    ];
    const guard = async () => {
      const sample = 'معمول يفضل معاك ٢٤٩';
      const missing = await Promise.all(cuts.map(async ({ weight, file }) => {
        const descriptor = `${weight} 16px "Thmanyah Sans"`;
        try {
          const faces = await document.fonts.load(descriptor, sample);
          const loaded = faces.some((face) =>
            face.family.replaceAll('"', '').toLowerCase() === 'thmanyah sans' &&
            face.weight === String(weight) && face.status === 'loaded'
          );
          return loaded && document.fonts.check(descriptor, sample) ? null : file;
        } catch {
          return file;
        }
      }));
      const failed = missing.filter(Boolean);
      if (failed.length) console.warn(`[LINUX] Thmanyah Sans font cuts did not load: ${failed.join(', ')}. Check these theme assets.`);
    };
    document.fonts.ready.then(guard);
  }

  /* Campaign countdowns use one absolute, timezone-qualified end timestamp. */
  (function initCountdowns() {
    const nodes = document.querySelectorAll('[data-countdown]');
    if (!nodes.length) return;
    const pad = (n) => String(n).padStart(2, '0');
    const parseEnd = (raw) => {
      if (typeof raw !== 'string') return null;
      const value = raw.trim();
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|[+-]\d{2}:\d{2})$/i);
      if (!match) return null;
      const [, year, month, day, hour, minute, second, zone] = match;
      const y = Number(year), mo = Number(month), d = Number(day);
      const h = Number(hour), m = Number(minute), s = Number(second);
      if (h > 23 || m > 59 || s > 59) return null;
      const civil = new Date(0);
      civil.setUTCFullYear(y, mo - 1, d);
      civil.setUTCHours(h, m, s, 0);
      if (civil.getUTCFullYear() !== y || civil.getUTCMonth() !== mo - 1 || civil.getUTCDate() !== d) return null;
      if (zone.toUpperCase() !== 'Z') {
        const offset = zone.match(/[+-](\d{2}):(\d{2})/);
        const offsetHours = Number(offset[1]), offsetMinutes = Number(offset[2]);
        if (offsetHours > 14 || offsetMinutes > 59 || (offsetHours === 14 && offsetMinutes !== 0)) return null;
      }
      const timestamp = Date.parse(value);
      return Number.isFinite(timestamp) ? timestamp : null;
    };
    const timers = Array.from(nodes, (el) => {
      const active = el.querySelector('[data-countdown-active]');
      const expired = el.querySelector('[data-countdown-expired]');
      if (expired) expired.remove();
      return {
        el,
        end: parseEnd(el.dataset.countdownEnd),
        active,
        expired,
        d: active && active.querySelector('[data-cd="days"]'),
        h: active && active.querySelector('[data-cd="hours"]'),
        m: active && active.querySelector('[data-cd="minutes"]'),
        s: active && active.querySelector('[data-cd="seconds"]'),
        finished: false
      };
    });

    const paint = () => {
      const now = Date.now();
      timers.forEach((t) => {
        if (t.end === null || !t.active || t.finished) return;
        const left = t.end - now;
        if (left <= 0) {
          t.active.remove();
          if (t.expired) {
            t.el.appendChild(t.expired);
            t.el.hidden = false;
          }
          t.finished = true;
          return;
        }
        const secs = Math.ceil(left / 1000);
        // With a days unit the hours wrap at 24; without one they keep counting (72:10:05).
        const d = t.d ? Math.floor(secs / 86400) : 0;
        const h = t.d ? Math.floor((secs % 86400) / 3600) : Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (t.d) t.d.textContent = L.digits(pad(d));
        if (t.h) t.h.textContent = L.digits(pad(h));
        if (t.m) t.m.textContent = L.digits(pad(m));
        if (t.s) t.s.textContent = L.digits(pad(s));
        t.el.hidden = false;
      });
    };

    paint();
    setInterval(paint, 1000);
  })();

  // Copy-to-clipboard for share buttons
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    try {
      if (navigator.share && btn.dataset.share !== undefined) { await navigator.share({ title: document.title, url: btn.dataset.copy }); return; }
      await navigator.clipboard.writeText(btn.dataset.copy);
      L.toast(btn.dataset.copyLabel || L.strings.copied, { icon: btn.dataset.copyLabel ? 'ticket' : 'check' });
    } catch {}
  });
})();
