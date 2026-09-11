/* LINUX — Customize studio v3
   Real garment photos per colour/side, a design layer the shopper can drag,
   pinch, wheel-zoom, rotate (knob, slider, keyboard), nudge with arrow keys,
   quantity + a size per piece, print/embroidery rules, and a composited JPEG
   mockup of the finished piece that travels with the order as `Mockup`.
   The mockup is attached as a second file property so Shopify stores it with
   the order. Variant/price comes from the merchant's Customize product: the
   colour maps to its "Color" option and the method to its "Type" option. */
(function () {
  'use strict';
  const L = window.LINUX;
  const root = document.querySelector('[data-customize]');
  if (!root) return;
  const meta = JSON.parse(root.querySelector('[data-product-json]')?.textContent || '{}');
  const variants = JSON.parse(root.querySelector('[data-variants]')?.textContent || '[]');
  const strings = meta.strings || {};
  const MAX = Number(root.dataset.maxMb || 10) * 1024 * 1024;
  const MIN_EMB = Number(root.dataset.minEmbroidery || 10);
  const MAX_QTY = Number(root.dataset.maxQty || 50);
  const AREA = meta.area || {};
  const SCALE_MIN = 10, SCALE_MAX = 90;

  const q = (s) => root.querySelector(s);
  const qa = (s) => Array.from(root.querySelectorAll(s));
  const canvas = q('[data-cz-canvas]'), garment = q('[data-cz-garment]'), design = q('[data-cz-design]'), designImg = q('[data-cz-design-img]');
  const empty = q('[data-cz-pick]'), fileInput = q('[data-cz-file]'), drop = q('[data-cz-drop]'), fileRow = q('[data-cz-file-row]'), err = q('[data-cz-error]');
  const posInput = q('[data-cz-pos]'), mockupInput = q('[data-cz-mockup]'), garmentProp = q('[data-cz-garment-prop]'), colorProp = q('[data-cz-color-prop]'), methodProp = q('[data-cz-method-prop]'), sideProp = q('[data-cz-side-prop]'), sizesProp = q('[data-cz-sizes-prop]');
  const qtyField = q('[data-cz-qty-field]'), qtyInput = q('[data-cz-qty]'), sizesList = q('[data-cz-sizes-list]'), sizeTpl = q('[data-cz-size-row]');
  const scale = q('[data-cz-scale]'), scaleOut = q('[data-cz-scale-out]'), rotate = q('[data-cz-rotate]'), rotateOut = q('[data-cz-rotate-out]');
  const form = q('[data-cz-form]'), submitErr = q('[data-cz-submit-error]'), total = q('[data-cz-total]'), breakdown = q('[data-cz-breakdown]');
  const minNotice = q('[data-cz-min-notice]'), eta = q('[data-cz-eta]'), idInput = q('[data-variant-id]'), atcPrice = q('[data-atc-price]'), wa = q('[data-cz-wa]');
  const tools = q('[data-cz-tools]'), hint = q('[data-cz-hint]'), area = q('[data-cz-area]');
  const firstColor = q('[data-cz-color].is-active') || q('[data-cz-color]');

  const state = {
    x: 50, y: 42, s: 42, r: 0,
    side: root.dataset.side || 'back', shape: root.dataset.shape || 'hoodie',
    label: q('[data-cz-garment-opt].is-active')?.dataset.label || 'Hoodie',
    colorKey: firstColor?.dataset.czColor, color: firstColor?.dataset.czColorName || '', colorValue: firstColor?.dataset.czVariantValue || '', hex: firstColor?.dataset.czHex || '#181818',
    method: 'Print', qty: 1, sizes: [], hasDesign: false, unit: meta.price || 0, file: null,
  };

  /* ---- Print area per garment/side: [cx, cy, w, h] in % of the stage ---- */
  function printArea() { const a = (AREA[state.shape] || {})[state.side]; return a || [50, 45, 52, 52]; }
  function paintArea() {
    const [cx, cy, w, h] = printArea();
    area.style.left = cx + '%'; area.style.top = cy + '%'; area.style.width = w + '%'; area.style.height = h + '%';
  }
  function clampPos() {
    const [cx, cy, w, h] = printArea();
    const half = state.s / 2;
    state.x = Math.max(cx - w / 2 + Math.min(half, w / 2) * .35, Math.min(cx + w / 2 - Math.min(half, w / 2) * .35, state.x));
    state.y = Math.max(cy - h / 2 + Math.min(half, h / 2) * .35, Math.min(cy + h / 2 - Math.min(half, h / 2) * .35, state.y));
  }
  function centerInArea() { const [cx, cy] = printArea(); state.x = cx; state.y = cy; }

  /* ---- Variant / price: colour option + method option ---- */
  const lc = (v) => String(v == null ? '' : v).toLowerCase().trim();
  function pickVariant() {
    const wantMethod = lc((meta.methodValues || {})[state.method] || state.method);
    const wantColor = lc(state.colorValue || state.color);
    const has = (v, val) => v.options.some((o) => lc(o) === val);
    let list = variants.filter((v) => has(v, wantMethod));
    if (!list.length) list = variants.slice();
    let byColor = list.filter((v) => has(v, wantColor));
    if (byColor.length) list = byColor;
    return list.find((v) => v.available) || list[0] || variants.find((v) => v.available) || variants[0];
  }

  /* ---- Photo / mockup layers ---- */
  function showLayer() {
    const want = `${state.colorKey}|${state.shape}-${state.side}`;
    let photo = null;
    qa('[data-cz-photo]').forEach((img) => { const on = img.dataset.czPhoto === want; img.hidden = !on; if (on) photo = img; });
    qa('[data-cz-mock]').forEach((m) => { m.hidden = !!photo || m.dataset.czMock !== `${state.shape}-${state.side}`; });
    garment.style.setProperty('--gc', state.hex);
    garment.classList.toggle('has-photo', !!photo);
    const hex = state.hex.replace('#', ''); const n = parseInt(hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex, 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    garment.classList.toggle('is-light', lum > .6);
    return photo;
  }

  function paint() {
    clampPos();
    design.style.setProperty('--dx', state.x + '%');
    design.style.setProperty('--dy', state.y + '%');
    design.style.setProperty('--ds', state.s);
    design.style.setProperty('--dr', state.r + 'deg');
    posInput.value = `x:${Math.round(state.x)},y:${Math.round(state.y)},scale:${Math.round(state.s)},rotate:${Math.round(state.r)},side:${state.side}`;
    garmentProp.value = state.label;
    methodProp.value = state.method;
    sideProp.value = state.side === 'back' ? (strings.back || 'Back') : (strings.front || 'Front');
    colorProp.value = state.color;
    if (scale) { scale.value = Math.round(state.s); if (scaleOut) scaleOut.value = Math.round(state.s) + '%'; }
    if (rotate) { rotate.value = Math.round(state.r); if (rotateOut) rotateOut.value = Math.round(state.r) + '°'; }
    root.dataset.shape = state.shape; root.dataset.side = state.side;
    showLayer(); paintArea();
    qtyField.value = state.qty;
    sizesProp.value = state.sizes.map((sz, i) => `${i + 1}:${sz}`).join(', ');
    const v = pickVariant();
    if (v) { state.unit = v.price; idInput.value = v.id; }
    const sum = state.unit * state.qty;
    if (total) total.textContent = L.money(sum);
    if (atcPrice) atcPrice.textContent = L.money(sum);
    if (breakdown) breakdown.textContent = state.qty > 1 && strings.perPiece ? strings.perPiece.replace('[price]', L.money(state.unit)) : '';
    const short = state.method === 'Embroidery' && state.qty < MIN_EMB;
    minNotice.hidden = state.method !== 'Embroidery';
    minNotice.classList.toggle('is-blocking', short);
    if (eta) eta.textContent = state.method === 'Embroidery' ? (strings.etaEmbroidery || '') : (strings.etaPrint || '');
    if (tools) tools.hidden = !state.hasDesign;
    if (hint) hint.textContent = state.hasDesign ? (strings.hintDesign || strings.hint || '') : (strings.hint || '');
    if (wa) {
      const txt = `${strings.wa || ''} ${state.label} · ${state.color} · ${state.method} · ${state.qty} pcs${state.sizes.length ? ' (' + state.sizes.join(', ') + ')' : ''}`;
      wa.href = wa.href.replace(/\?text=.*$/, '') + '?text=' + encodeURIComponent(txt.trim());
    }
  }

  /* ---- Sizes: one row per piece ---- */
  function renderSizes() {
    const prev = state.sizes.slice();
    sizesList.innerHTML = '';
    state.sizes = [];
    for (let i = 0; i < state.qty; i++) {
      const row = sizeTpl.content.firstElementChild.cloneNode(true);
      row.querySelector('.cz__size-n').textContent = (strings.piece || 'Piece [n]').replace('[n]', i + 1);
      const inputs = row.querySelectorAll('input');
      inputs.forEach((inp) => { inp.name = `cz-size-${i}`; inp.checked = false; });
      const want = prev[i];
      const match = want && Array.from(inputs).find((inp) => inp.value === want);
      const chosen = match || inputs[Math.min(1, inputs.length - 1)];
      chosen.checked = true; state.sizes.push(chosen.value);
      row.addEventListener('change', (e) => { if (e.target.matches('input')) { state.sizes[i] = e.target.value; paint(); } });
      sizesList.appendChild(row);
    }
    q('[data-cz-sizes]').classList.toggle('is-many', state.qty > 6);
  }
  function setQty(n) {
    state.qty = Math.max(1, Math.min(MAX_QTY, Math.round(Number(n) || 1)));
    qtyInput.value = state.qty;
    qa('[data-cz-qty-set]').forEach((c) => c.classList.toggle('is-active', Number(c.dataset.czQtySet) === state.qty));
    renderSizes(); paint();
  }
  qa('[data-cz-qty-step]').forEach((b) => b.addEventListener('click', () => { setQty(state.qty + Number(b.dataset.czQtyStep)); L.buzz(); }));
  qa('[data-cz-qty-set]').forEach((b) => b.addEventListener('click', () => { setQty(b.dataset.czQtySet); L.buzz(); }));
  qtyInput.addEventListener('change', () => setQty(qtyInput.value));

  /* ---- Method ---- */
  qa('[data-cz-method]').forEach((b) => b.addEventListener('click', () => {
    qa('[data-cz-method]').forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    state.method = b.dataset.czMethod;
    if (state.method === 'Embroidery' && state.qty < MIN_EMB) { minNotice.hidden = false; minNotice.classList.add('is-pulse'); setTimeout(() => minNotice.classList.remove('is-pulse'), 700); }
    paint(); L.buzz();
  }));

  /* ---- Upload ---- */
  function showError(msg) { err.textContent = msg; err.hidden = !msg; }
  function setFile(file) {
    showError('');
    if (!file) return;
    if (file.size > MAX) { showError(strings.fileTooBig); fileInput.value = ''; return; }
    if (!/^image\/(png|jpe?g|svg\+xml|webp)$/.test(file.type)) { showError(strings.fileType); fileInput.value = ''; return; }
    const url = URL.createObjectURL(file);
    designImg.onload = () => {
      // start at a sensible size inside the print area, centred
      centerInArea(); state.s = 42; state.r = 0; state.hasDesign = true; state.file = file;
      design.hidden = false; empty.hidden = true; fileRow.hidden = false; drop.hidden = true;
      design.classList.remove('is-pop'); void design.offsetWidth; design.classList.add('is-pop');
      paint(); L.buzz();
    };
    designImg.src = url; q('[data-cz-thumb]').src = url;
    q('[data-cz-filename]').textContent = file.name; q('[data-cz-filesize]').textContent = (file.size / 1024).toFixed(0) + ' KB';
  }
  function clearFile() {
    fileInput.value = ''; designImg.removeAttribute('src'); design.hidden = true; empty.hidden = false; fileRow.hidden = true; drop.hidden = false;
    state.hasDesign = false; state.file = null; mockupInput.value = ''; paint();
  }
  fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
  empty.addEventListener('click', () => fileInput.click());
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  const takeDrop = (e) => { e.preventDefault(); canvas.classList.remove('is-over'); const f = e.dataTransfer.files[0]; if (f) { try { fileInput.files = e.dataTransfer.files; } catch {} setFile(f); } };
  drop.addEventListener('drop', takeDrop);
  canvas.addEventListener('dragover', (e) => { e.preventDefault(); canvas.classList.add('is-over'); });
  canvas.addEventListener('dragleave', () => canvas.classList.remove('is-over'));
  canvas.addEventListener('drop', takeDrop);
  q('[data-cz-remove]').addEventListener('click', clearFile);

  /* ---- Gestures on the design: drag to move, knobs to scale / rotate ---- */
  let gesture = null, pinch = null;
  const stageRect = () => garment.getBoundingClientRect();
  const angleTo = (e, r) => Math.atan2(e.clientY - (r.top + r.height * state.y / 100), e.clientX - (r.left + r.width * state.x / 100)) * 180 / Math.PI;
  const distTo = (e, r) => Math.hypot(e.clientX - (r.left + r.width * state.x / 100), e.clientY - (r.top + r.height * state.y / 100));

  design.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const knob = e.target.closest('[data-cz-knob]');
    const r = stageRect();
    gesture = knob
      ? { kind: knob.dataset.czKnob, r, s0: state.s, r0: state.r, a0: angleTo(e, r), d0: distTo(e, r) }
      : { kind: 'move', r, ox: e.clientX, oy: e.clientY, sx: state.x, sy: state.y };
    design.classList.add('is-dragging'); design.setPointerCapture(e.pointerId); e.preventDefault();
  });
  design.addEventListener('pointermove', (e) => {
    if (!gesture) return;
    const g = gesture;
    if (g.kind === 'move') {
      state.x = g.sx + (e.clientX - g.ox) / g.r.width * 100;
      state.y = g.sy + (e.clientY - g.oy) / g.r.height * 100;
    } else if (g.kind === 'scale') {
      state.s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, g.s0 * (distTo(e, g.r) / Math.max(1, g.d0))));
    } else if (g.kind === 'rotate') {
      let r = g.r0 + (angleTo(e, g.r) - g.a0);
      if (e.shiftKey) r = Math.round(r / 15) * 15;
      state.r = ((r + 180) % 360 + 360) % 360 - 180;
    }
    paint();
  });
  ['pointerup', 'pointercancel'].forEach((ev) => design.addEventListener(ev, () => { gesture = null; design.classList.remove('is-dragging'); }));
  // Wheel: zoom (Alt/Shift + wheel rotates)
  canvas.addEventListener('wheel', (e) => {
    if (!state.hasDesign) return; e.preventDefault();
    if (e.altKey || e.shiftKey) state.r = ((state.r - Math.sign(e.deltaY) * 3 + 180) % 360 + 360) % 360 - 180;
    else state.s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, state.s - Math.sign(e.deltaY) * 2));
    paint();
  }, { passive: false });
  // Two-finger pinch: scale + rotate at once
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) { const [a, b] = e.touches; pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), ang: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI, s: state.s, r: state.r }; gesture = null; }
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (!pinch || e.touches.length !== 2) return;
    const [a, b] = e.touches;
    const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const ang = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;
    state.s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, pinch.s * d / pinch.d));
    state.r = (((pinch.r + (ang - pinch.ang)) + 180) % 360 + 360) % 360 - 180;
    paint();
  }, { passive: true });
  canvas.addEventListener('touchend', () => { pinch = null; });
  // Keyboard: arrows nudge, +/- scale, [ ] rotate
  design.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 5 : 1; let used = true;
    switch (e.key) {
      case 'ArrowLeft': state.x -= step; break;
      case 'ArrowRight': state.x += step; break;
      case 'ArrowUp': state.y -= step; break;
      case 'ArrowDown': state.y += step; break;
      case '+': case '=': state.s = Math.min(SCALE_MAX, state.s + step * 2); break;
      case '-': case '_': state.s = Math.max(SCALE_MIN, state.s - step * 2); break;
      case '[': state.r -= step * 3; break;
      case ']': state.r += step * 3; break;
      case 'Delete': case 'Backspace': clearFile(); break;
      default: used = false;
    }
    if (used) { e.preventDefault(); paint(); }
  });
  scale && scale.addEventListener('input', () => { state.s = Number(scale.value); paint(); });
  rotate && rotate.addEventListener('input', () => { state.r = Number(rotate.value); paint(); });

  /* ---- Toolbar ---- */
  qa('[data-cz-tool]').forEach((b) => b.addEventListener('click', () => {
    switch (b.dataset.czTool) {
      case 'zoom-in': state.s = Math.min(SCALE_MAX, state.s + 4); break;
      case 'zoom-out': state.s = Math.max(SCALE_MIN, state.s - 4); break;
      case 'rotate-l': state.r = ((state.r - 15 + 180) % 360 + 360) % 360 - 180; break;
      case 'rotate-r': state.r = ((state.r + 15 + 180) % 360 + 360) % 360 - 180; break;
      case 'center': centerInArea(); break;
      case 'reset': centerInArea(); state.s = 42; state.r = 0; break;
      case 'fit': { const [, , w, h] = printArea(); centerInArea(); state.s = Math.min(SCALE_MAX, Math.min(w, h) * .92); state.r = 0; break; }
      case 'replace': fileInput.click(); return;
      case 'remove': clearFile(); return;
    }
    paint(); L.buzz();
  }));

  /* ---- Garment / colour / side ---- */
  qa('[data-cz-garment-opt]').forEach((btn) => btn.addEventListener('click', () => {
    qa('[data-cz-garment-opt]').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    state.shape = btn.dataset.czGarmentOpt; state.label = btn.dataset.label || state.shape;
    garment.classList.remove('is-swap'); void garment.offsetWidth; garment.classList.add('is-swap');
    centerInArea(); paint(); L.buzz();
  }));
  qa('[data-cz-color]').forEach((btn) => btn.addEventListener('click', () => {
    qa('[data-cz-color]').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    state.colorKey = btn.dataset.czColor; state.color = btn.dataset.czColorName || ''; state.colorValue = btn.dataset.czVariantValue || state.color; state.hex = btn.dataset.czHex || '#181818';
    garment.classList.remove('is-swap'); void garment.offsetWidth; garment.classList.add('is-swap');
    paint(); L.buzz();
  }));
  qa('[data-cz-side]').forEach((btn) => btn.addEventListener('click', () => {
    if (state.side === btn.dataset.czSide) return;
    qa('[data-cz-side]').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    state.side = btn.dataset.czSide;
    garment.classList.remove('is-flip'); void garment.offsetWidth; garment.classList.add('is-flip');
    setTimeout(() => { centerInArea(); paint(); }, 180);
    L.buzz();
  }));

  /* ---- Mockup: composite the visible garment + the design into one JPEG ---- */
  function loadImg(src) { return new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
  async function buildMockup() {
    if (!state.hasDesign) return null;
    const photo = showLayer();
    const size = 1000;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0b2a1c'; ctx.fillRect(0, 0, size, size);
    try {
      let base = null;
      if (photo) base = await loadImg(photo.currentSrc || photo.src);
      else {
        const svg = qa('[data-cz-mock]').find((m) => !m.hidden)?.querySelector('svg');
        if (svg) { const clone = svg.cloneNode(true); clone.querySelectorAll('[fill="var(--gc)"]').forEach((el) => el.setAttribute('fill', state.hex)); clone.setAttribute('width', size); clone.setAttribute('height', size); const u = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' })); base = await loadImg(u); URL.revokeObjectURL(u); }
      }
      if (base) ctx.drawImage(base, 0, 0, size, size);
      // design: width = --ds% of the stage × .66 (same as CSS), aspect kept, rotated about its centre
      const dw = size * state.s / 100 * .66;
      const dh = dw * (designImg.naturalHeight / Math.max(1, designImg.naturalWidth));
      ctx.save(); ctx.translate(size * state.x / 100, size * state.y / 100); ctx.rotate(state.r * Math.PI / 180);
      ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh); ctx.restore();
      ctx.fillStyle = 'rgba(244,232,216,.9)'; ctx.font = '600 24px system-ui, sans-serif';
      ctx.fillText(`${state.label} · ${state.color} · ${sideProp.value} · ${state.method} · ×${state.qty} · ${posInput.value}`, 24, size - 28);
      const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', .85));
      if (!blob) return null;
      const file = new File([blob], `mockup-${state.shape}-${state.side}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      try { const dt = new DataTransfer(); dt.items.add(file); mockupInput.files = dt.files; } catch { return null; }
      return file;
    } catch (e) { console.warn('[customize] mockup failed', e); return null; }
  }

  /* ---- Submit guard: design + embroidery minimum, then attach the mockup ---- */
  let mockupReady = false;
  form.addEventListener('submit', (e) => {
    let msg = '';
    if (!state.hasDesign) msg = strings.needDesign;
    else if (state.method === 'Embroidery' && state.qty < MIN_EMB) msg = strings.minEmbroidery;
    if (msg) { e.preventDefault(); e.stopImmediatePropagation(); submitErr.textContent = msg; submitErr.hidden = false; (state.hasDesign ? minNotice : drop).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    submitErr.hidden = true;
    if (!mockupReady) {
      // pause this submit until the composite sits in the hidden file field, then re-fire
      e.preventDefault(); e.stopImmediatePropagation();
      const btn = q('[data-cz-submit]'); btn && btn.classList.add('is-loading');
      buildMockup().then(() => { mockupReady = true; form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }).finally(() => setTimeout(() => { mockupReady = false; }, 0));
    }
  }, true);

  renderSizes();
  centerInArea();
  paint();
})();
