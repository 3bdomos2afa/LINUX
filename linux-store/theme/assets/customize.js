/* LINUX — two-sided artwork, exact size variants and native page scrolling. */
(function () {
  'use strict';
  const L = window.LINUX;
  const root = document.querySelector('[data-customize]');
  if (!root || !root.querySelector('[data-cz-form]')) return;
  const meta = JSON.parse(root.querySelector('[data-product-json]')?.textContent || '{}');
  const catalog = JSON.parse(root.querySelector('[data-cz-catalog]')?.textContent || '{}');
  const mapping = JSON.parse(root.querySelector('[data-cz-config]')?.textContent || '{}');
  const model = L.customizeModel;
  const strings = { ...meta.strings, ...JSON.parse(root.querySelector('[data-cz-strings]')?.textContent || '{}') };
  const MAX = Number(root.dataset.maxMb || 10) * 1024 * 1024;
  const MIN_EMB = Number(root.dataset.minEmbroidery || 10);
  const MAX_QTY = Number(root.dataset.maxQty || 50);
  const tiers = model.tiersFrom(mapping.tiers).filter((tier) => tier.quantity <= MAX_QTY);
  const AREA = meta.area || {};
  const SCALE_MIN = 10, SCALE_MAX = 90;
  const SIDES = ['front', 'back'];

  const q = (s) => root.querySelector(s);
  const qa = (s) => Array.from(root.querySelectorAll(s));
  const canvas = q('[data-cz-canvas]'), garment = q('[data-cz-garment]');
  const empty = q('[data-cz-pick]'), emptyLabel = q('[data-cz-empty-label]'), err = q('[data-cz-error]');
  const garmentProp = q('[data-cz-garment-prop]'), colorProp = q('[data-cz-color-prop]'), methodProp = q('[data-cz-method-prop]'), sidesProp = q('[data-cz-sides-prop]'), sizesProp = q('[data-cz-sizes-prop]');
  const qtyField = q('[data-cz-qty-field]'), qtyInput = q('[data-cz-qty]'), sizesList = q('[data-cz-sizes-list]'), sizeTpl = q('[data-cz-size-row]');
  const scale = q('[data-cz-scale]'), scaleOut = q('[data-cz-scale-out]'), rotate = q('[data-cz-rotate]'), rotateOut = q('[data-cz-rotate-out]');
  const form = q('[data-cz-form]'), submitErr = q('[data-cz-submit-error]'), total = q('[data-cz-total]'), breakdown = q('[data-cz-breakdown]');
  const minNotice = q('[data-cz-min-notice]'), eta = q('[data-cz-eta]'), idInput = q('[data-variant-id]'), atcPrice = q('[data-atc-price]'), wa = q('[data-cz-wa]');
  const tools = q('[data-cz-tools]'), hint = q('[data-cz-hint]'), area = q('[data-cz-area]'), colorLabel = q('[data-cz-color-label]'), fine = q('[data-cz-fine]'), fineSide = q('[data-cz-fine-side]');
  const firstColor = q('[data-cz-color].is-active') || q('[data-cz-color]');
  const editToggle = q('[data-cz-edit-toggle]');
  const photos = qa('[data-cz-photo]');
  const mocks = qa('[data-cz-mock]');

  // per-side design state
  const design = {};
  SIDES.forEach((side) => {
    design[side] = { x: 50, y: 42, s: 42, r: 0, has: false, file: null,
      el: q(`[data-cz-design="${side}"]`), img: q(`[data-cz-design="${side}"] img`), input: q(`[data-cz-file="${side}"]`),
      drop: q(`[data-cz-drop="${side}"]`), row: q(`[data-cz-file-row="${side}"]`), pos: q(`[data-cz-pos="${side}"]`), mock: q(`[data-cz-mockup="${side}"]`), dot: q(`[data-cz-side-dot="${side}"]`) };
  });

  const state = {
    side: root.dataset.side || 'back', shape: root.dataset.shape || 'hoodie',
    label: q('[data-cz-garment-opt].is-active')?.dataset.label || 'Hoodie',
    colorKey: firstColor?.dataset.czColor, color: firstColor?.dataset.czColorName || '', colorValue: firstColor?.dataset.czVariantKey || '', hex: firstColor?.dataset.czTone || '#181818',
    method: 'Print', qty: 1, sizes: [], unit: meta.price || 0, editing: false,
  };
  const cur = () => design[state.side];
  const sideName = (s) => (s === 'back' ? strings.back : strings.front) || s;

  /* ---- Print area per garment/side: [cx, cy, w, h] in % of the stage ---- */
  function printArea(side = state.side) { const a = (AREA[state.shape] || {})[side]; return a || [50, 45, 52, 52]; }
  function paintArea() {
    const [cx, cy, w, h] = printArea();
    area.style.left = cx + '%'; area.style.top = cy + '%'; area.style.width = w + '%'; area.style.height = h + '%';
  }
  function clampPos(d, side) {
    const [cx, cy, w, h] = printArea(side);
    const half = d.s / 2;
    d.x = Math.max(cx - w / 2 + Math.min(half, w / 2) * .35, Math.min(cx + w / 2 - Math.min(half, w / 2) * .35, d.x));
    d.y = Math.max(cy - h / 2 + Math.min(half, h / 2) * .35, Math.min(cy + h / 2 - Math.min(half, h / 2) * .35, d.y));
  }
  function centerInArea(d = cur(), side = state.side) { const [cx, cy] = printArea(side); d.x = cx; d.y = cy; }

  /* ---- Variant / price ---- */
  function pickVariant(size) {
    return model.variantFor(catalog[state.shape], { color: state.colorValue || state.color, method: state.method, size }, mapping);
  }
  const selectedVariants = () => state.sizes.slice(0, state.qty).map(pickVariant);
  const interpolate = (text, values) => Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`[${key}]`, value), text || '');
  let priceSignature = '';

  function paintPricing() {
    const selected = selectedVariants();
    const signature = `${state.shape}|${state.method}|${state.colorKey}|${state.qty}|${state.sizes.slice(0, state.qty).join(',')}`;
    const priced = model.quote(selected, tiers);
    idInput.value = selected[0]?.available ? selected[0].id : '';
    q('[data-cz-submit]').disabled = root.dataset.preparing === 'true' || !priced || SIDES.some((side) => design[side].loading);
    q('[data-cz-availability]').hidden = !!priced;
    if (signature === priceSignature) return;
    priceSignature = signature;
    sizesList.querySelectorAll('.cz__size-row').forEach((row, index) => {
      row.classList.toggle('is-unavailable', !selected[index]?.available);
      row.querySelectorAll('input').forEach((input) => {
        input.disabled = !pickVariant(input.value)?.available;
        input.closest('label').classList.toggle('is-disabled', input.disabled);
      });
    });
    const amount = priced ? L.money(priced.total) : '—';
    if (total) total.textContent = amount;
    if (atcPrice) { atcPrice.textContent = amount; atcPrice.hidden = !!priced?.estimated; }
    state.unit = priced?.unit || 0;
    q('[data-cz-unit]').textContent = priced ? L.money(priced.unit) : '—';
    q('[data-cz-summary-qty]').textContent = L.digits(state.qty);
    q('[data-cz-unit-label]').textContent = priced?.estimated ? strings.estimated_unit_price : strings.unit_price;
    q('[data-cz-total-label]').textContent = priced?.estimated ? strings.estimated_total : strings.total;
    q('[data-cz-savings-row]').hidden = !priced?.savings;
    q('[data-cz-savings]').textContent = priced ? L.money(priced.savings) : '';
    q('[data-cz-pricing-hint]').textContent = tiers.length || priced?.savings ? strings.pricing_more : strings.pricing_standard;
    q('[data-cz-pricing-note]').hidden = !tiers.length;
    const next = q('[data-cz-next-tier]');
    next.hidden = !priced?.next;
    next.textContent = priced?.next ? interpolate(strings.next_tier, { count: L.digits(priced.next.quantity), percent: L.digits(priced.next.discount) }) : '';
    const list = q('[data-cz-price-tiers]');
    list.hidden = !tiers.length;
    list.replaceChildren();
    tiers.filter((tier) => tier.quantity <= MAX_QTY).forEach((tier) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'cz__price-tier';
      button.classList.toggle('is-active', priced?.tier?.quantity === tier.quantity);
      button.setAttribute('aria-pressed', String(priced?.tier?.quantity === tier.quantity));
      button.textContent = interpolate(strings.tier_label, { count: L.digits(tier.quantity), percent: L.digits(tier.discount) });
      button.addEventListener('click', () => setQty(tier.quantity));
      list.append(button);
    });
    if (breakdown) breakdown.textContent = '';
  }

  /* ---- Photo / mockup layers ---- */
  function photoFor(side = state.side) {
    const want = `${state.colorKey}|${state.shape}-${side}`;
    return photos.find((img) => img.dataset.czPhoto === want) || photos.find((img) => img.dataset.czPhoto === `shared|${state.shape}-${side}`);
  }
  function showLayer(side = state.side) {
    const photo = photoFor(side);
    photos.forEach((img) => { img.hidden = img !== photo; });
    if (photo && !photo.getAttribute('src')) photo.src = photo.dataset.src;
    mocks.forEach((m) => { m.hidden = !!photo || m.dataset.czMock !== `${state.shape}-${side}`; });
    garment.style.setProperty('--gc', state.hex);
    garment.classList.toggle('has-photo', !!photo);
    const hex = state.hex.replace('#', ''); const n = parseInt(hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex, 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    garment.classList.toggle('is-light', lum > .6);
    return photo;
  }

  function paintDesign(side) {
    const d = design[side];
    clampPos(d, side);
    d.el.style.setProperty('--dx', d.x + '%'); d.el.style.setProperty('--dy', d.y + '%');
    d.el.style.setProperty('--ds', d.s); d.el.style.setProperty('--dr', d.r + 'deg');
    d.el.hidden = !(d.has && side === state.side);
    d.pos.value = `x:${Math.round(d.x)},y:${Math.round(d.y)},scale:${Math.round(d.s)},rotate:${Math.round(d.r)}`;
    d.pos.disabled = !d.has;
    d.drop.hidden = d.has; d.row.hidden = !d.has;
    d.drop.setAttribute('aria-busy', String(!!d.loading));
    q(`[data-cz-upload="${side}"] [data-cz-upload-status]`).hidden = !d.loading;
    if (d.dot) d.dot.hidden = !d.has;
  }

  function paint() {
    SIDES.forEach(paintDesign);
    const d = cur();
    garmentProp.value = state.label;
    methodProp.value = state.method;
    colorProp.value = state.color;
    const withDesign = SIDES.filter((s) => design[s].has);
    sidesProp.value = withDesign.length === 2 ? (strings.both || 'Front + Back') : withDesign.map(sideName).join('');
    if (scale) { scale.value = Math.round(d.s); if (scaleOut) scaleOut.value = L.digits(Math.round(d.s)) + '%'; }
    if (rotate) { rotate.value = Math.round(d.r); if (rotateOut) rotateOut.value = L.digits(Math.round(d.r)) + '°'; }
    root.dataset.shape = state.shape; root.dataset.side = state.side;
    showLayer(); paintArea();
    empty.hidden = d.has;
    if (emptyLabel) emptyLabel.textContent = (strings.uploadSide || 'Upload [side] design').replace('[side]', sideName(state.side));
    if (fineSide) fineSide.textContent = sideName(state.side);
    if (fine) fine.classList.toggle('is-disabled', !d.has);
    qtyField.value = state.qty;
    sizesProp.value = state.sizes.slice(0, state.qty).map((sz, i) => `${i + 1}:${sz}`).join(', ');
    paintPricing();
    const short = state.method === 'Embroidery' && state.qty < MIN_EMB;
    minNotice.hidden = state.method !== 'Embroidery';
    minNotice.classList.toggle('is-blocking', short);
    if (eta) eta.textContent = state.method === 'Embroidery' ? (strings.etaEmbroidery || '') : (strings.etaPrint || '');
    if (tools) tools.hidden = !d.has || !state.editing;
    if (hint) hint.textContent = d.has ? (state.editing ? strings.edit_hint : strings.browse_hint) : strings.hint;
    canvas.classList.toggle('is-editing', state.editing && d.has);
    editToggle.hidden = !d.has;
    editToggle.textContent = state.editing ? strings.finish_editing : strings.edit_design;
    editToggle.setAttribute('aria-pressed', String(state.editing));
    if (colorLabel) colorLabel.textContent = q('[data-cz-color].is-active')?.getAttribute('aria-label') || state.color;
    if (wa) {
      const methodLabel = q('[data-cz-method].is-active strong')?.textContent || state.method;
      const txt = `${strings.wa || ''} ${state.label} · ${colorLabel.textContent} · ${methodLabel} · ${sidesProp.value || '-'} · ${L.digits(state.qty)} (${state.sizes.slice(0, state.qty).join(', ')})`;
      wa.href = wa.href.replace(/\?text=.*$/, '') + '?text=' + encodeURIComponent(txt.trim());
    }
  }

  /* ---- Sizes ---- */
  function renderSizes() {
    sizesList.innerHTML = '';
    priceSignature = '';
    for (let i = 0; i < state.qty; i++) {
      const row = sizeTpl.content.firstElementChild.cloneNode(true);
      // Piece captions are shopper-facing: same numerals as the price under them.
      row.querySelector('.cz__size-n').textContent = (strings.piece || 'Piece [n]').replace('[n]', L.digits(i + 1));
      const inputs = row.querySelectorAll('input');
      inputs.forEach((inp) => { inp.name = `cz-size-${i}`; inp.checked = false; });
      row.querySelector('[role="radiogroup"]').setAttribute('aria-label', row.querySelector('.cz__size-n').textContent);
      const want = state.sizes[i];
      const match = want && Array.from(inputs).find((inp) => inp.value === want);
      const available = Array.from(inputs).filter((input) => pickVariant(input.value)?.available);
      const chosen = match || available[Math.min(1, available.length - 1)];
      if (chosen) { chosen.checked = true; state.sizes[i] = chosen.value; }
      else state.sizes[i] = want || '';
      row.addEventListener('change', (e) => { if (e.target.matches('input')) { state.sizes[i] = e.target.value; paint(); } });
      sizesList.appendChild(row);
    }
  }
  function setQty(n) {
    state.qty = Math.max(1, Math.min(MAX_QTY, Math.round(Number(n) || 1)));
    qtyInput.value = state.qty;
    L.numberInputs?.sync(qtyInput);
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

  /* ---- Side tabs ---- */
  function setSide(side, animate = true) {
    if (state.side === side) return;
    qa('[data-cz-side]').forEach((b) => { const on = b.dataset.czSide === side; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
    state.side = side;
    state.editing = false;
    if (animate) { garment.classList.remove('is-flip'); void garment.offsetWidth; garment.classList.add('is-flip'); }
    paint();
    L.buzz();
  }
  qa('[data-cz-side]').forEach((btn) => btn.addEventListener('click', () => setSide(btn.dataset.czSide)));
  editToggle.addEventListener('click', () => { state.editing = !state.editing; paint(); });

  /* ---- Upload (per side) ---- */
  function showError(msg) { err.textContent = msg; err.hidden = !msg; }
  function setFile(side, file) {
    showError('');
    if (!file) return;
    const d = design[side];
    if (file.size > MAX) { showError(strings.fileTooBig); d.input.value = ''; return; }
    if (!/^image\/(png|jpe?g|svg\+xml|webp)$/.test(file.type)) { showError(strings.fileType); d.input.value = ''; return; }
    const url = URL.createObjectURL(file);
    const request = {}; d.request = request; d.loading = true; paint();
    const image = new Image();
    image.onload = () => {
      if (d.request !== request) { URL.revokeObjectURL(url); return; }
      if (d.url) URL.revokeObjectURL(d.url);
      d.url = url; d.img.src = url; d.loading = false;
      centerInArea(d, side); d.s = 42; d.r = 0; d.has = true; d.file = file;
      state.editing = false;
      if (state.side !== side) setSide(side, false);
      const thumb = d.row.querySelector('[data-cz-thumb]'); if (thumb) thumb.src = url;
      d.row.querySelector('[data-cz-filename]').textContent = file.name;
      d.row.querySelector('[data-cz-filesize]').textContent = `${L.digits(Math.ceil(file.size / 1024))} ${strings.kilobytes}`;
      d.el.classList.remove('is-pop'); void d.el.offsetWidth; d.el.classList.add('is-pop');
      paint(); L.buzz();
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      if (d.request !== request) return;
      d.loading = false; d.input.value = ''; showError(strings.file_invalid); paint();
    };
    image.src = url;
  }
  function clearFile(side) {
    const d = design[side];
    d.request = null; d.loading = false;
    if (d.url) URL.revokeObjectURL(d.url);
    d.url = null;
    d.input.value = ''; d.img.removeAttribute('src'); d.has = false; d.file = null; d.pos.value = '';
    state.editing = false;
    if (d.mock) d.mock.value = '';
    paint();
  }
  SIDES.forEach((side) => {
    const d = design[side];
    d.input.addEventListener('change', () => setFile(side, d.input.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => d.drop.addEventListener(ev, (e) => { e.preventDefault(); d.drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((ev) => d.drop.addEventListener(ev, (e) => { e.preventDefault(); d.drop.classList.remove('is-over'); }));
    d.drop.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) { try { d.input.files = e.dataTransfer.files; } catch {} setFile(side, f); } });
    q(`[data-cz-remove="${side}"]`).addEventListener('click', () => clearFile(side));
    q(`[data-cz-edit="${side}"]`).addEventListener('click', () => { setSide(side); state.editing = true; paint(); canvas.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  });
  empty.addEventListener('click', () => cur().input.click());
  canvas.addEventListener('dragover', (e) => { e.preventDefault(); canvas.classList.add('is-over'); });
  canvas.addEventListener('dragleave', () => canvas.classList.remove('is-over'));
  canvas.addEventListener('drop', (e) => { e.preventDefault(); canvas.classList.remove('is-over'); const f = e.dataTransfer.files[0]; if (f) { try { cur().input.files = e.dataTransfer.files; } catch {} setFile(state.side, f); } });

  /* ---- Gestures: drag to move, knobs to scale / rotate ---- */
  let gesture = null;
  const stageRect = () => garment.getBoundingClientRect();
  const angleTo = (e, r, d) => Math.atan2(e.clientY - (r.top + r.height * d.y / 100), e.clientX - (r.left + r.width * d.x / 100)) * 180 / Math.PI;
  const distTo = (e, r, d) => Math.hypot(e.clientX - (r.left + r.width * d.x / 100), e.clientY - (r.top + r.height * d.y / 100));
  const norm = (deg) => ((deg + 180) % 360 + 360) % 360 - 180;

  SIDES.forEach((side) => {
    const d = design[side]; const el = d.el;
    el.addEventListener('pointerdown', (e) => {
      if (!state.editing || root.dataset.preparing === 'true') return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      const knob = e.target.closest('[data-cz-knob]');
      const r = stageRect();
      gesture = knob
        ? { kind: knob.dataset.czKnob, r, s0: d.s, r0: d.r, a0: angleTo(e, r, d), d0: distTo(e, r, d) }
        : { kind: 'move', r, ox: e.clientX, oy: e.clientY, sx: d.x, sy: d.y };
      el.classList.add('is-dragging'); el.setPointerCapture(e.pointerId); e.preventDefault();
    });
    el.addEventListener('pointermove', (e) => {
      if (!gesture || !state.editing) return;
      const g = gesture;
      if (g.kind === 'move') { d.x = g.sx + (e.clientX - g.ox) / g.r.width * 100; d.y = g.sy + (e.clientY - g.oy) / g.r.height * 100; }
      else if (g.kind === 'scale') d.s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, g.s0 * (distTo(e, g.r, d) / Math.max(1, g.d0))));
      else if (g.kind === 'rotate') { let r = g.r0 + (angleTo(e, g.r, d) - g.a0); if (e.shiftKey) r = Math.round(r / 15) * 15; d.r = norm(r); }
      paint();
    });
    ['pointerup', 'pointercancel'].forEach((ev) => el.addEventListener(ev, () => { gesture = null; el.classList.remove('is-dragging'); }));
    el.addEventListener('keydown', (e) => {
      if (!state.editing || root.dataset.preparing === 'true') return;
      const step = e.shiftKey ? 5 : 1; let used = true;
      switch (e.key) {
        case 'ArrowLeft': d.x -= step; break;
        case 'ArrowRight': d.x += step; break;
        case 'ArrowUp': d.y -= step; break;
        case 'ArrowDown': d.y += step; break;
        case '+': case '=': d.s = Math.min(SCALE_MAX, d.s + step * 2); break;
        case '-': case '_': d.s = Math.max(SCALE_MIN, d.s - step * 2); break;
        case '[': d.r = norm(d.r - step * 3); break;
        case ']': d.r = norm(d.r + step * 3); break;
        case 'Delete': case 'Backspace': clearFile(side); break;
        default: used = false;
      }
      if (used) { e.preventDefault(); paint(); }
    });
  });
  scale && scale.addEventListener('input', () => { cur().s = Number(scale.value); paint(); });
  rotate && rotate.addEventListener('input', () => { cur().r = Number(rotate.value); paint(); });

  /* ---- Toolbar ---- */
  qa('[data-cz-tool]').forEach((b) => b.addEventListener('click', () => {
    const d = cur();
    switch (b.dataset.czTool) {
      case 'zoom-in': d.s = Math.min(SCALE_MAX, d.s + 4); break;
      case 'zoom-out': d.s = Math.max(SCALE_MIN, d.s - 4); break;
      case 'rotate-l': d.r = norm(d.r - 15); break;
      case 'rotate-r': d.r = norm(d.r + 15); break;
      case 'center': centerInArea(d); break;
      case 'reset': centerInArea(d); d.s = 42; d.r = 0; break;
      case 'fit': { const [, , w, h] = printArea(); centerInArea(d); d.s = Math.min(SCALE_MAX, Math.min(w, h) * .92); d.r = 0; break; }
      case 'replace': d.input.click(); return;
      case 'remove': clearFile(state.side); return;
    }
    paint(); L.buzz();
  }));

  /* ---- Garment / colour ---- */
  qa('[data-cz-garment-opt]').forEach((btn) => btn.addEventListener('click', () => {
    if (!catalog[btn.dataset.czGarmentOpt]) return;
    qa('[data-cz-garment-opt]').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    state.shape = btn.dataset.czGarmentOpt; state.label = btn.dataset.label || state.shape;
    garment.classList.remove('is-swap'); void garment.offsetWidth; garment.classList.add('is-swap');
    SIDES.forEach((s) => centerInArea(design[s], s));
    paint(); L.buzz();
  }));
  qa('[data-cz-color]').forEach((btn) => btn.addEventListener('click', () => {
    qa('[data-cz-color]').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
    state.colorKey = btn.dataset.czColor; state.color = btn.dataset.czColorName || ''; state.colorValue = btn.dataset.czVariantKey || state.color; state.hex = btn.dataset.czTone || '#181818';
    garment.classList.remove('is-swap'); void garment.offsetWidth; garment.classList.add('is-swap');
    paint(); L.buzz();
  }));

  /* ---- Mockups: one composited JPEG per side that has a design ---- */
  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const image = new Image(); image.crossOrigin = 'anonymous';
      const timeout = setTimeout(() => reject(new Error(strings.mockup_failed)), 10000);
      image.onload = () => { clearTimeout(timeout); resolve(image); };
      image.onerror = () => { clearTimeout(timeout); reject(new Error(strings.mockup_failed)); };
      image.src = src;
    });
  }
  async function buildMockup(side) {
    const d = design[side];
    if (!d.has || !d.mock) return null;
    const photo = photoFor(side);
    const size = 1000;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0b2a1c'; ctx.fillRect(0, 0, size, size);
    try {
      let base = null;
      if (photo) base = await loadImg(photo.dataset.src);
      else {
        const svg = mocks.find((m) => m.dataset.czMock === `${state.shape}-${side}`)?.querySelector('svg');
        if (svg) { const clone = svg.cloneNode(true); clone.querySelectorAll('[fill="var(--gc)"]').forEach((el) => el.setAttribute('fill', state.hex)); clone.setAttribute('width', size); clone.setAttribute('height', size); const u = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' })); base = await loadImg(u); URL.revokeObjectURL(u); }
      }
      if (!base) throw new Error(strings.mockup_failed);
      const fit = Math.min(size / base.naturalWidth, size / base.naturalHeight);
      const width = base.naturalWidth * fit, height = base.naturalHeight * fit;
      ctx.drawImage(base, (size - width) / 2, (size - height) / 2, width, height);
      const dw = size * d.s / 100 * .66;
      const dh = dw * (d.img.naturalHeight / Math.max(1, d.img.naturalWidth));
      ctx.save(); ctx.translate(size * d.x / 100, size * d.y / 100); ctx.rotate(d.r * Math.PI / 180);
      ctx.drawImage(d.img, -dw / 2, -dh / 2, dw, dh); ctx.restore();
      const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', .85));
      if (!blob) throw new Error(strings.mockup_failed);
      const file = new File([blob], `mockup-${state.shape}-${side}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      return file;
    } catch { throw new Error(strings.mockup_failed); }
  }

  /* Group identical pieces so large orders do not upload the same artwork per piece. */
  let preparedItems = null, requestGroup = null, requestSignature = '';
  const lock = (busy) => {
    root.dataset.preparing = String(busy);
    root.setAttribute('aria-busy', String(busy));
    q('[data-cz-submit]').classList.toggle('is-loading', busy);
    if (busy) q('[data-cz-submit]').disabled = true;
  };
  for (const event of ['click', 'keydown', 'change', 'input', 'drop']) {
    root.addEventListener(event, (e) => {
      if (root.dataset.preparing !== 'true') return;
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
  }
  form.getCartItems = () => {
    if (!preparedItems) throw new Error(strings.selection_unavailable);
    return preparedItems;
  };
  form.onCartAddSuccess = () => { requestGroup = null; requestSignature = ''; };
  form.refreshProduct = () => { preparedItems = null; lock(false); paint(); };
  form.addEventListener('submit', (e) => {
    if (preparedItems) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (root.dataset.preparing === 'true') return;
    let msg = '';
    const any = SIDES.some((s) => design[s].has);
    const groups = model.groupPieces(selectedVariants(), state.sizes.slice(0, state.qty));
    if (!any) msg = strings.needDesign;
    else if (state.method === 'Embroidery' && state.qty < MIN_EMB) msg = strings.minEmbroidery;
    else if (!groups) msg = strings.selection_unavailable;
    else if (SIDES.some((side) => design[side].loading)) return;
    if (msg) { submitErr.textContent = msg; submitErr.hidden = false; (any ? sizesList : q('[data-cz-upload]')).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    submitErr.hidden = true;
    const signature = JSON.stringify([state.shape, state.colorKey, state.method, state.qty, state.sizes.slice(0, state.qty), q('[data-cz-notes]').value, SIDES.map((side) => [design[side].url, design[side].pos.value])]);
    if (!requestGroup || signature !== requestSignature) { requestGroup = crypto.randomUUID(); requestSignature = signature; }
    lock(true);
    const properties = { Garment: state.shape === 'tee' ? 'T-shirt' : 'Hoodie', Colour: state.color, Method: state.method, Sides: SIDES.filter((side) => design[side].has).map((side) => side === 'front' ? 'Front' : 'Back').join(' + '), Notes: q('[data-cz-notes]').value, _customize_group: requestGroup };
    Promise.all(SIDES.map(buildMockup)).then((files) => {
      SIDES.forEach((side, index) => {
        const d = design[side], label = side === 'front' ? 'Front' : 'Back';
        if (!d.has) return;
        properties[`${label} design`] = d.file;
        properties[`${label} mockup`] = files[index];
        properties[`${label} position`] = d.pos.value;
      });
      preparedItems = groups.map((group) => ({ id: group.id, quantity: group.quantity, properties: { ...properties, Size: group.size, Piece: group.pieces.join(', ') } }));
      q('[data-cz-submit]').disabled = false;
      form.requestSubmit();
    }).catch((error) => {
      preparedItems = null; lock(false); paint();
      submitErr.textContent = error.message || strings.mockup_failed; submitErr.hidden = false;
    });
  }, true);

  L.on('cart:updated', (cart) => {
    for (const product of Object.values(catalog)) {
      for (const variant of product?.variants || []) variant.cart_quantity = (cart.items || []).filter((item) => Number(item.variant_id) === Number(variant.id)).reduce((count, item) => count + item.quantity, 0);
    }
    priceSignature = ''; paint();
  });

  renderSizes();
  SIDES.forEach((s) => centerInArea(design[s], s));
  paint();
})();
