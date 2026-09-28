/* LINUX ad kit runtime.
   render.mjs injects copy.json as <script id="kit-data">; this fills [data-k] text, [data-src]/[data-bg]
   images, [data-list] repeaters and [data-icon] icons, shrinks [data-fit] text until it fits, then sets
   window.__kitReady. window.__kitAudit() reports overflow, off-canvas and story safe-zone problems. */
(() => {
  const ICONS = {
    arrow: 'M5 12h14|M13 6l6 6-6 6',
    chev: 'M7 5l6 7-6 7|M13 5l6 7-6 7',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    sparkle: 'M12 2.5c.6 4.9 2.6 6.9 7.5 7.5-4.9.6-6.9 2.6-7.5 7.5-.6-4.9-2.6-6.9-7.5-7.5 4.9-.6 6.9-2.6 7.5-7.5z',
    truck: 'M2.5 6.5h11v10h-11z|M13.5 10h4.2l3.3 3.4v3.1h-7.5|M5 17.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0|M15.5 17.5a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
    cash: 'M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z|M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z',
    swap: 'M4 8.5h14l-3.5-3.5|M20 15.5H6l3.5 3.5',
    bolt: 'M13.5 2.5 5 13.5h6.5l-1 8 8.5-11h-6.5z',
    pin: 'M12 21.5s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z|M12 7a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z',
    copy: 'M9.5 9.5h9a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2z|M15 9.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3.5',
    needle: 'M19.5 4.5 7 17|M16.5 3.5l4 4|M3.5 20.5c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0',
    print: 'M6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4z|M4 15.5l4.5-4.5 4 4 2.5-2.5 5 5|M15.5 8.5h.01',
    tag: 'M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3-8.7 8.7z|M8 7.2a.8.8 0 1 0 0 1.6a.8.8 0 1 0 0-1.6z',
  };
  const FILLED = new Set(['sparkle']);
  const root = document.documentElement;
  const node = document.getElementById('kit-data');
  if (!node) {
    document.body.insertAdjacentHTML('beforeend', '<p style="position:fixed;z-index:99;inset:auto 0 0;padding:14px 18px;background:#8fcb5a;color:#021a12;font:600 20px system-ui">Template preview — run <code>node linux-store/marketing/render.mjs</code> to fill it from copy.json.</p>');
    return;
  }

  const kit = JSON.parse(node.textContent);
  const loc = kit.copy[kit.lang] || {};
  const scopes = [loc[kit.creative] || {}, loc.common || {}, kit.copy.shared || {}];
  const dig = (obj, key) => key.split('.').reduce((o, p) => (o == null ? undefined : o[p]), obj);
  const get = (key) => {
    for (const scope of scopes) {
      const v = dig(scope, key);
      if (v !== undefined) return v;
    }
    return undefined;
  };
  // Paths in copy.json are relative to marketing/, pages resolve from marketing/templates/.
  const asset = (p) => (/^(?:[a-z]+:|\/)/i.test(p) ? p : `../${p}`);
  const empty = (v) => v == null || v === '' || (Array.isArray(v) && !v.length);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const rich = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');

  root.lang = kit.lang;
  root.dir = loc.dir || (kit.lang === 'ar' ? 'rtl' : 'ltr');
  if (kit.layer) root.dataset.layer = kit.layer;
  if (kit.matte) root.dataset.matte = kit.matte;

  const setText = (el, v) => {
    if (empty(v)) el.hidden = true;
    else el.innerHTML = rich(v);
  };
  const setSrc = (el, v) => {
    if (empty(v)) el.hidden = true;
    else el.src = asset(v);
  };
  const setIcon = (el, name) => {
    const d = ICONS[name];
    if (!d) {
      el.hidden = true;
      return;
    }
    el.setAttribute('viewBox', '0 0 24 24');
    el.setAttribute('aria-hidden', 'true');
    el.classList.add('i');
    el.classList.toggle('is-fill', FILLED.has(name));
    el.innerHTML = d.split('|').map((p) => `<path d="${p}"/>`).join('');
  };

  // Repeaters first, so their fields resolve against each item rather than the page.
  document.querySelectorAll('[data-list]').forEach((list) => {
    const tpl = list.querySelector('[data-item]');
    const items = get(list.dataset.list);
    if (!tpl) return;
    tpl.remove();
    if (!Array.isArray(items) || !items.length) {
      list.hidden = true;
      return;
    }
    items.forEach((item, i) => {
      const el = tpl.cloneNode(true);
      el.removeAttribute('data-item');
      el.style.setProperty('--i', i);
      el.style.setProperty('--n', items.length);
      const field = (k) => (k === '.' ? item : item && typeof item === 'object' ? item[k] : undefined);
      el.querySelectorAll('[data-f]').forEach((n) => setText(n, field(n.dataset.f)));
      el.querySelectorAll('[data-f-src]').forEach((n) => setSrc(n, field(n.dataset.fSrc)));
      el.querySelectorAll('[data-f-icon]').forEach((n) => setIcon(n, field(n.dataset.fIcon)));
      list.append(el);
    });
  });
  document.querySelectorAll('[data-k]').forEach((el) => setText(el, get(el.dataset.k)));
  document.querySelectorAll('[data-src]').forEach((el) => setSrc(el, get(el.dataset.src)));
  document.querySelectorAll('[data-icon]').forEach((el) => setIcon(el, el.dataset.icon));
  const backgrounds = [];
  document.querySelectorAll('[data-bg]').forEach((el) => {
    const v = get(el.dataset.bg);
    if (empty(v) || kit.matte) return;
    el.style.backgroundImage = `url("${asset(v)}")`;
    backgrounds.push(asset(v));
  });
  document.querySelectorAll('[data-hide-empty]').forEach((el) => {
    if (![...el.querySelectorAll('[data-k],[data-f]')].some((n) => !n.hidden)) el.hidden = true;
  });
  if (kit.layer) {
    document.querySelectorAll('.stage [data-layer]').forEach((el) => el.classList.toggle('is-active', el.dataset.layer === kit.layer));
  }

  const issues = [];
  const label = (el) => el.dataset.k || el.dataset.f || el.className;
  const fit = (el) => {
    const lines = Number(el.dataset.fit) || 1;
    const start = parseFloat(getComputedStyle(el).fontSize);
    const min = start * (Number(el.dataset.fitMin) || 0.5);
    let size = start;
    const fits = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || size * 1.2;
      return el.scrollWidth <= el.clientWidth + 1 && el.getBoundingClientRect().height <= lh * lines + 2;
    };
    while (!fits() && size > min) {
      size = Math.max(min, size * 0.96);
      el.style.fontSize = `${size}px`;
    }
    if (!fits()) issues.push(`does-not-fit ${label(el)} (still too long at ${Math.round(size)}px)`);
  };

  const decode = (img) => (img.complete && img.naturalWidth ? Promise.resolve() : img.decode()).catch(() => issues.push(`image-failed ${img.getAttribute('src')}`));
  const preload = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = () => {
        issues.push(`image-failed ${url}`);
        resolve();
      };
      img.src = url;
    });
  const images = [...document.images].filter((img) => !img.hidden && img.getAttribute('src'));
  Promise.all([...document.fonts].map((f) => f.load().catch(() => issues.push(`font-failed ${f.family} ${f.weight}`))))
    .then(() => document.fonts.ready)
    .then(() => Promise.all([...images.map(decode), ...backgrounds.map(preload)]))
    .then(() => document.querySelectorAll('[data-fit]').forEach(fit))
    .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    .then(() => {
      window.__kitReady = true;
      root.dataset.ready = '1';
    });

  window.__kitAudit = () => {
    const W = innerWidth;
    const H = innerHeight;
    const out = [...issues];
    document.querySelectorAll('[data-k],[data-f],.audit').forEach((el) => {
      if (el.closest('[hidden],[data-no-audit]') || (el.matches('[data-k],[data-f]') && !el.textContent.trim())) return;
      if (kit.layer && !el.closest('.is-active')) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const name = label(el);
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).display !== 'inline') out.push(`overflow ${name}`);
      if (r.left < -0.5 || r.top < -0.5 || r.right > W + 0.5 || r.bottom > H + 0.5) out.push(`off-canvas ${name}`);
      if (kit.safe && (r.top < kit.safe.top || r.bottom > H - kit.safe.bottom)) {
        out.push(`outside-safe-zone ${name} (${Math.round(r.top)}–${Math.round(r.bottom)}px)`);
      }
    });
    return out;
  };
})();
