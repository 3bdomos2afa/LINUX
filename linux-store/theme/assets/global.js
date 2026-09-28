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
      .replace(/{{\s*amount\s*}}/g, two)
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

  L.toast = function (message, { type = 'success', image, action, duration = 3600 } = {}) {
    const stack = document.querySelector('.toast-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = `toast glass glass--solid toast--${type}`;
    el.setAttribute('role', 'status');
    const icon = type === 'error'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>';
    el.innerHTML = `${image ? `<img class="toast__img" src="${image}" alt="">` : `<span class="toast__icon">${icon}</span>`}<span class="toast__msg">${message}</span>${action ? `<a class="toast__action" href="${action.href || '#'}" data-toast-action>${action.label}</a>` : ''}`;
    if (action && action.onClick) el.querySelector('[data-toast-action]').addEventListener('click', (e) => { e.preventDefault(); action.onClick(); });
    stack.appendChild(el);
    while (stack.children.length > 3) stack.firstChild.remove();
    const kill = () => { el.classList.add('is-leaving'); setTimeout(() => el.remove(), 400); };
    const t = setTimeout(kill, duration);
    el.addEventListener('click', () => { clearTimeout(t); kill(); });
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
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
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
      L.toast(L.strings.copied);
    } catch {}
  });
})();
