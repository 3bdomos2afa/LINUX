/* LINUX — cart: AJAX add/change, drawer refresh via Section Rendering API,
   free-shipping island + offer strip in the drawer, upsell rail, quick add
   from cards. */
(function () {
  'use strict';
  const L = window.LINUX;
  const S = L.settings || {};
  const root = S.root && S.root !== '/' ? S.root.replace(/\/$/, '') : '';
  const strings = L.strings || {};
  const ar = (document.documentElement.lang || '').toLowerCase().startsWith('ar');
  const invalidSelection = L.strings?.err_invalid || (ar ? 'اختار منتج متاح وكمية صحيحة.' : 'Choose an available item and a valid quantity.');
  function showError(message) {
    const text = document.createElement('span');
    text.textContent = message || strings.error || invalidSelection;
    L.toast(text.innerHTML, { type: 'error' });
  }

  const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData;
  const isFile = (value) => typeof File !== 'undefined' && value instanceof File;
  let customizedAddQueue = Promise.resolve();

  function serializeCustomizedAdd(operation) {
    const pending = customizedAddQueue.then(operation, operation);
    customizedAddQueue = pending.catch(() => {});
    return pending;
  }

  function customizedKey(item) {
    const properties = item.properties || {};
    const group = properties._customize_group;
    const size = properties.Size;
    const variant = item.variant_id ?? item.id;
    if (group == null || String(group).trim() === '' || size == null || String(size).trim() === '' || variant == null) return null;
    return JSON.stringify([String(group), String(variant), String(size)]);
  }

  function customizedCartCounts(cart) {
    const counts = new Map();
    (cart.items || []).forEach((line) => {
      const key = customizedKey(line);
      const quantity = Number(line.quantity);
      if (!key || !Number.isSafeInteger(quantity) || quantity < 1) return;
      counts.set(key, (counts.get(key) || 0) + quantity);
    });
    return counts;
  }

  function sameProperties(a, b) {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    return aKeys.length === bKeys.length && aKeys.every((key, index) => {
      if (key !== bKeys[index]) return false;
      const left = a[key], right = b[key];
      return Object.is(left, right) || (!isFile(left) && !isFile(right) && String(left) === String(right));
    });
  }

  function customizedJobs(items) {
    const jobs = new Map();
    for (const item of items) {
      const properties = item.properties || {};
      const id = item.variant_id ?? item.id;
      const quantity = Number(item.quantity);
      const key = customizedKey(item);
      if (!key || id == null || !Number.isSafeInteger(quantity) || quantity < 1) {
        throw new Error(ar
          ? 'لازم يكون للتصميم والمقاس والكمية رقم ثابت قبل رفع الملفات.'
          : 'File-backed custom items need a persistent design ID, size, variant, and positive quantity.');
      }
      const current = jobs.get(key);
      if (current && (!sameProperties(current.item.properties || {}, properties)
        || String(current.item.selling_plan || '') !== String(item.selling_plan || ''))) {
        throw new Error(ar
          ? 'بيانات القطع اللي ليها نفس التصميم والمقاس مش متطابقة، فمتضافش حاجة.'
          : 'Custom items with the same design, size, and variant have different properties; nothing was added.');
      }
      if (current) current.quantity += quantity;
      else jobs.set(key, { key, id, item, quantity });
    }
    return Array.from(jobs.values());
  }

  function customizedStatus(jobs, counts) {
    let confirmedQuantity = 0;
    let totalQuantity = 0;
    let confirmedGroups = 0;
    jobs.forEach((job) => {
      const quantity = Math.min(job.quantity, counts.get(job.key) || 0);
      confirmedQuantity += quantity;
      totalQuantity += job.quantity;
      if (quantity >= job.quantity) confirmedGroups++;
    });
    return { confirmedQuantity, totalQuantity, confirmedGroups, totalGroups: jobs.length };
  }

  function customAddMessage(status, causeText = '') {
    const confirmed = L.digits ? L.digits(status.confirmedQuantity) : String(status.confirmedQuantity);
    const total = L.digits ? L.digits(status.totalQuantity) : String(status.totalQuantity);
    const reason = causeText ? ` (${causeText})` : '';
    return ar
      ? `${(L.strings?.err_partial || 'مقدرناش نضيف كل القطع: اتضاف [confirmed] من [total] بس. ما حاولناش تاني لوحدنا — بص على الشنطة وجرّب تاني وهنضيف الناقص بس.').replace('[confirmed]', confirmed).replace('[total]', total)}${reason}`
      : `${(L.strings?.err_partial || 'Could not add every custom piece. [confirmed] of [total] requested pieces are confirmed in your bag. No write was retried; review your bag, then retry to add only the missing quantities.').replace('[confirmed]', confirmed).replace('[total]', total)}${reason}`;
  }

  function customAddFailure(cause, jobs, cart, counts) {
    const status = customizedStatus(jobs, counts);
    const causeText = cause && cause.message ? cause.message : '';
    const error = new Error(customAddMessage(status, causeText));
    error.cartAdded = false;
    error.cartAdd = {
      ...status,
      cart,
      complete: false,
      causeText,
      targets: jobs.map(({ key, quantity }) => ({ key, quantity })),
    };
    return error;
  }

  function cartAddResponseMatches(result, variantId) {
    const lines = Array.isArray(result?.items) ? result.items : (result?.id != null ? [result] : []);
    return lines.some((line) => String(line.variant_id ?? line.id) === String(variantId));
  }

  async function addCustomizedFiles(items) {
    const jobs = customizedJobs(items);
    return serializeCustomizedAdd(async () => {
      const cart = await api.get();
      if (!Array.isArray(cart?.items)) throw new Error(strings.error || invalidSelection);
      const counts = customizedCartCounts(cart);
      const pending = jobs.map((job) => ({ ...job, quantity: Math.max(0, job.quantity - (counts.get(job.key) || 0)) }))
        .filter((job) => job.quantity > 0);
      if (!pending.length) return cart;

      const responses = [];
      for (const job of pending) {
        try {
          const body = new FormData();
          body.append('id', String(job.id));
          body.append('quantity', String(job.quantity));
          if (job.item.selling_plan) body.append('selling_plan', String(job.item.selling_plan));
          Object.entries(job.item.properties || {}).forEach(([key, value]) => {
            if (value == null) return;
            body.append(`properties[${key}]`, isFile(value) ? value : String(value));
          });
          const result = await L.fetchJSON(`${root}/cart/add.js`, { method: 'POST', body });
          if (!cartAddResponseMatches(result, job.id)) {
            throw new Error(L.strings?.err_confirm_size || (ar ? 'معرفناش نتأكد إن أحد المقاسات اتضاف.' : 'Could not confirm one customized size was added.'));
          }
          responses.push(result);
          counts.set(job.key, (counts.get(job.key) || 0) + job.quantity);
        } catch (cause) {
          let currentCart = null;
          try {
            const latest = await api.get();
            if (Array.isArray(latest?.items)) currentCart = latest;
          } catch {}
          const latestCounts = currentCart ? customizedCartCounts(currentCart) : counts;
          const status = customizedStatus(jobs, latestCounts);
          if (currentCart && status.confirmedQuantity >= status.totalQuantity) return currentCart;
          throw customAddFailure(cause, jobs, currentCart, latestCounts);
        }
      }
      if (responses.length === 1) return responses[0];
      return { items: responses.flatMap((result) => Array.isArray(result?.items) ? result.items : [result]) };
    });
  }

  const api = {
    get: () => L.fetchJSON(`${root}/cart.js`),
    add: async (items) => {
      const formData = isFormData(items);
      const hasFile = !formData && Array.isArray(items)
        && items.some((item) => Object.values(item.properties || {}).some(isFile));
      if (hasFile) return addCustomizedFiles(items);

      const body = formData ? items : JSON.stringify({ items });
      const result = await L.fetchJSON(`${root}/cart/add.js`, { method: 'POST', body });
      const added = result?.items || (result?.id ? [result] : []);
      if (!Array.isArray(added) || !added.length || (!formData
        && (added.length !== items.length || items.some((item) => !added.some((line) => String(line.id) === String(item.id)))))) {
        throw new Error(L.strings?.err_check_bag || (ar ? 'بص على الشنطة قبل ما تجرّب تاني.' : 'Could not confirm the add. Check your bag before trying again.'));
      }
      return result;
    },
    change: (id, quantity) => L.fetchJSON(`${root}/cart/change.js`, { method: 'POST', body: JSON.stringify({ id, quantity }) }),
    update: (payload) => L.fetchJSON(`${root}/cart/update.js`, { method: 'POST', body: JSON.stringify(payload) }),
  };

  // Counts print in the same numerals as the prices around them (L.digits is a
  // no-op outside Arabic), so the badge never mixes numeral sets with the total.
  const asNumber = (text) => Number(String(text).replace(/[\u0660-\u0669]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  function paintCount(n) {
    const label = L.digits ? L.digits(n) : String(n);
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      if (el.textContent !== label) {
        const grew = asNumber(el.textContent) < n;
        el.textContent = label;
        if (grew && el.classList.contains('badge')) { el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); }
      }
      if (el.classList.contains('badge')) el.hidden = n === 0;
    });
  }

  let drawerRenderStarted = 0;
  let drawerRenderApplied = 0;
  async function refresh(cart) {
    cart = cart && cart.items ? cart : await api.get();
    if (!Array.isArray(cart?.items)) throw new Error(strings.error || invalidSelection);
    paintCount(cart.item_count);
    const drawer = document.querySelector('[data-drawer="cart"]');
    if (drawer) {
      const renderId = ++drawerRenderStarted;
      const fresh = await L.renderSection('cart-drawer');
      const regions = ['meter', 'body', 'foot'].map((region) => ({
        region,
        live: drawer.querySelector(`[data-cart-region="${region}"]`),
        next: fresh.querySelector(`[data-cart-region="${region}"]`),
      }));
      if (regions.some(({ live, next }) => !live || !next)) throw new Error(strings.error || invalidSelection);
      if (renderId > drawerRenderApplied) {
        regions.forEach(({ region, live, next }) => {
          if (region === 'meter') live.classList.toggle('is-live', next.classList.contains('is-live'));
          live.innerHTML = next.innerHTML;
        });
        drawerRenderApplied = renderId;
      }
    }
    const page = document.querySelector('[data-cart-page][data-section-id]');
    if (page) {
      const fresh = await L.renderSection(page.dataset.sectionId);
      const next = fresh.querySelector('[data-cart-page]');
      if (!next) throw new Error(strings.error || invalidSelection);
      page.innerHTML = next.innerHTML;
    }
    L.emit('cart:updated', cart);
    loadUpsell(cart);
    return cart;
  }

  async function add(items, { open = true, image } = {}) {
    L.buzz();
    let added = false;
    try {
      await api.add(items);
      added = true;
      const cart = await refresh();
      const flying = L.flyToBag ? L.flyToBag(image, { toDrawer: open && S.cartType !== 'page' }) : 0;
      if (flying && open && S.cartType !== 'page') await new Promise((done) => setTimeout(done, flying));
      if (S.cartType === 'page') {
        L.toast(strings.added, { image, action: { label: strings.view_bag, href: S.cartUrl } });
      } else if (open) {
        L.drawers && L.drawers.open('cart');
      } else {
        L.toast(strings.added, { image, action: { label: strings.view_bag, onClick: () => L.drawers.open('cart') } });
      }
      return cart;
    } catch (e) {
      if (added) {
        e.cartAdded = true;
        e.message = L.strings?.err_refresh || (ar ? 'القطع اتضافت، بس الشنطة متحدّثتش. افتحها قبل ما تضيف تاني.' : 'Items were added, but the cart could not refresh. View your cart before adding again.');
      }
      else {
        if (e.cartAdd) {
          let currentCart = e.cartAdd.cart;
          try {
            if (!currentCart) currentCart = await api.get();
            await refresh(currentCart);
          } catch {
            if (!currentCart) {
              try { currentCart = await refresh(); } catch {}
            }
          }
          if (currentCart) {
            const status = customizedStatus(e.cartAdd.targets, customizedCartCounts(currentCart));
            Object.assign(e.cartAdd, status, { cart: currentCart });
            e.message = customAddMessage(e.cartAdd, e.cartAdd.causeText);
            if (status.confirmedQuantity >= status.totalQuantity) {
              e.cartAdded = true;
              if (S.cartType === 'page') {
                L.toast(strings.added, { image, action: { label: strings.view_bag, href: S.cartUrl } });
              } else if (open) {
                L.drawers && L.drawers.open('cart');
              } else {
                L.toast(strings.added, { image, action: { label: strings.view_bag, onClick: () => L.drawers.open('cart') } });
              }
              return currentCart;
            }
          }
        } else {
          try { await refresh(); } catch {}
          const check = L.strings?.err_check_bag || (ar ? 'بص على الشنطة قبل ما تجرّب تاني.' : 'Check your bag before trying again.');
          if (!e.message?.includes(check)) e.message = `${e.message || strings.error || invalidSelection} ${check}`;
        }
      }
      showError(e.message);
      e.__toasted = true;
      throw e;
    }
  }

  // Brief ✓ on the button that triggered an add
  function flashSuccess(btn) {
    if (!btn) return;
    const label = btn.querySelector('[data-atc-text]');
    const prev = label ? label.textContent : null;
    btn.classList.add('is-success');
    const success = strings.added || '';
    if (label) label.textContent = success;
    setTimeout(() => { btn.classList.remove('is-success'); if (label && label.textContent === success && prev != null) label.textContent = prev; }, 1400);
  }

  // Product forms (PDP, quick view, customize)
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-product-form]');
    if (!form || e.defaultPrevented) return;
    e.preventDefault();
    if (form.dataset.cartSubmitting === '1') return;
    const btn = form.querySelector('[type="submit"]');
    const error = form.querySelector('[data-product-error]');
    if (error) { error.hidden = true; error.textContent = ''; }
    const wasDisabled = btn?.disabled;
    let cartAdded = false;
    form.dataset.cartSubmitting = '1';
    form.setAttribute('aria-busy', 'true');
    try {
      // Re-resolve now, not from a hidden ID left behind by an earlier selection.
      const fd = new FormData(form);
      if (form.closest('[data-product]:not([data-customize])') && !form.getCartItems) throw new Error(invalidSelection);
      const items = form.getCartItems ? form.getCartItems(fd) : null;
      const id = items ? items[0]?.id : Number(fd.get('id'));
      const quantity = items ? items[0]?.quantity : Number(fd.get('quantity') || 1);
      if (!id || !Number.isSafeInteger(quantity) || quantity < 1 || (!items && wasDisabled)) throw new Error(invalidSelection);
      if (btn) { btn.classList.add('is-loading'); btn.disabled = true; }
      const hasFile = Array.from(fd.values()).some((v) => v instanceof File && v.size > 0);
      if (hasFile && !items) {
        // Shopify accepts multipart on /cart/add.js and stores file properties
        // on the line item — used by the Customize studio for the artwork.
        fd.delete('form_type'); fd.delete('utf8');
        fd.set('id', id); fd.set('quantity', quantity);
        await add(fd, { image: form.dataset.image });
      } else {
        const properties = Object.create(null);
        for (const [k, v] of fd.entries()) { const m = k.match(/^properties\[(.+)\]$/); if (m && typeof v === 'string' && v) properties[m[1]] = v; }
        await add(items || [{ id, quantity, properties, ...(fd.get('selling_plan') ? { selling_plan: fd.get('selling_plan') } : {}) }], { image: form.dataset.image });
      }
      cartAdded = true;
      if (btn) btn.dataset.cartSuccess = '1';
    } catch (err) {
      cartAdded = err.cartAdded === true;
      if (error) { error.textContent = err.message || strings.error || invalidSelection; error.hidden = false; }
      if (!err.__toasted) showError(err.message);
    }
    finally {
      delete form.dataset.cartSubmitting;
      form.removeAttribute('aria-busy');
      if (btn) { btn.classList.remove('is-loading'); btn.disabled = wasDisabled; }
      if (cartAdded && form.onCartAddSuccess) form.onCartAddSuccess();
      if (form.refreshProduct) form.refreshProduct({ added: cartAdded });
      if (btn?.dataset.cartSuccess) { delete btn.dataset.cartSuccess; flashSuccess(btn); }
    }
  });

  // Discount codes (Shopify Cart AJAX API, 2025: POST /cart/update.js { discount })
  async function applyDiscount(codes, wrap) {
    const err = wrap && wrap.querySelector('[data-discount-error]');
    const btn = wrap && wrap.querySelector('[data-discount-apply]');
    btn && btn.classList.add('is-loading');
    try {
      const cart = await api.update({ discount: codes.join(',') });
      const bad = (cart.discount_codes || []).filter((c) => !c.applicable).map((c) => c.code);
      if (bad.length) await api.update({ discount: (cart.discount_codes || []).filter((c) => c.applicable).map((c) => c.code).join(',') });
      await refresh(); // re-renders the footer, so surface the message on the fresh node
      const scope = wrap && wrap.closest('[data-drawer], [data-cart-page]');
      const freshErr = (scope || document).querySelector('[data-discount-error]');
      if (freshErr) {
        if (bad.length) { freshErr.textContent = (strings.discount_invalid || 'Code not valid') + ': ' + bad.join(', '); freshErr.hidden = false; }
        else freshErr.hidden = true;
      }
      if (!bad.length) L.toast(strings.discount_applied || 'Applied', { icon: 'ticket' });
      L.buzz();
    } catch (e) { if (err) { err.textContent = e.message || strings.error; err.hidden = false; } }
    finally { btn && btn.classList.remove('is-loading'); }
  }
  function currentCodes(wrap) { return Array.from(wrap.querySelectorAll('[data-discount-remove]')).map((b) => b.dataset.discountRemove); }
  document.addEventListener('click', (e) => {
    const apply = e.target.closest('[data-discount-apply]');
    const remove = e.target.closest('[data-discount-remove]');
    if (!apply && !remove) return;
    const wrap = e.target.closest('[data-cart-discount]');
    if (apply) {
      const input = wrap.querySelector('[data-discount-input]');
      const code = (input.value || '').trim().toUpperCase();
      if (!code) { input.focus(); return; }
      applyDiscount([...new Set([...currentCodes(wrap), code])], wrap);
    } else {
      applyDiscount(currentCodes(wrap).filter((c) => c !== remove.dataset.discountRemove), wrap);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('[data-discount-input]')) { e.preventDefault(); e.target.closest('[data-cart-discount]').querySelector('[data-discount-apply]').click(); }
  });

  // Quick add (cards, upsell)
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    if (btn.disabled || btn.classList.contains('is-loading')) return;
    btn.classList.add('is-loading'); btn.disabled = true;
    const card = btn.closest('[data-product-card]');
    const img = card && card.querySelector('.card__img--main');
    try { await add([{ id: Number(btn.dataset.quickAdd), quantity: 1 }], { open: !btn.closest('[data-drawer="cart"]'), image: img && img.currentSrc }); }
    catch {} finally { btn.classList.remove('is-loading'); btn.disabled = false; }
  });

  // Quantity + remove
  document.addEventListener('click', async (e) => {
    const q = e.target.closest('[data-qty-change]');
    const rm = e.target.closest('[data-line-remove]');
    if (!q && !rm) return;
    const key = (q || rm).dataset.key;
    const line = (q || rm).closest('[data-line]');
    let qty = 0;
    if (q) { const input = line.querySelector('[data-qty-input]'); qty = Math.max(0, Number(input.value) + Number(q.dataset.qtyChange)); input.value = qty; }
    line && line.classList.add('is-removing');
    if (qty === 0) line && (line.style.height = line.offsetHeight + 'px');
    try { const cart = await api.change(key, qty); await refresh(cart); }
    catch (err) { showError(err.message); line && line.classList.remove('is-removing'); }
  });
  document.addEventListener('change', async (e) => {
    const input = e.target.closest('[data-qty-input]');
    if (!input) return;
    try { const cart = await api.change(input.dataset.key, Math.max(0, Number(input.value))); await refresh(cart); }
    catch (err) { showError(err.message); }
  });
  document.addEventListener('change', L.debounce(async (e) => {
    const note = e.target.closest('[data-cart-note]');
    if (!note) return;
    try { await api.update({ note: note.value }); } catch {}
  }, 400));

  // Upsell: complete the look — recommendations for the first line item
  let upsellFor = null;
  async function loadUpsell(cart) {
    const wrap = document.querySelector('[data-cart-upsell]');
    if (!wrap) return;
    const list = wrap.querySelector('[data-cart-upsell-list]');
    if (!cart || !cart.items || !cart.items.length) { wrap.hidden = true; upsellFor = null; return; }
    const pid = cart.items[0].product_id;
    const inCart = new Set(cart.items.map((i) => i.product_id));
    if (upsellFor === pid && list.children.length) { wrap.hidden = false; return; }
    try {
      const data = await L.fetchJSON(`${root}/recommendations/products.json?product_id=${pid}&limit=6&intent=complementary`);
      const picks = (data.products || []).filter((p) => !inCart.has(p.id) && p.available).slice(0, 3);
      if (!picks.length) { wrap.hidden = true; return; }
      list.innerHTML = picks.map((p) => {
        const v = p.variants.find((x) => x.available) || p.variants[0];
        const img = p.featured_image ? (typeof p.featured_image === 'string' ? p.featured_image : p.featured_image.src) : '';
        const src = img && img.includes('cdn.shopify.com') ? img.replace(/(\.[a-z]+)(\?|$)/, '_200x$1$2') : img;
        return `<div class="upsell glass glass--clear"><a href="${p.url}"><img src="${src}" alt="" width="56" height="68" loading="lazy"></a><div><strong>${L.title(p.title)}</strong><span class="price"><span class="price__current">${L.money(v.price)}</span></span></div><button class="btn btn--cream btn--sm" type="button" data-quick-add="${v.id}" aria-label="${strings.add_to_bag}">+</button></div>`;
      }).join('');
      upsellFor = pid; wrap.hidden = false;
    } catch { wrap.hidden = true; }
  }

  L.cart = { api, add, refresh };
  api.get().then((c) => { paintCount(c.item_count); }).catch(() => {});
  L.on('drawer:open', ({ name }) => { if (name === 'cart') api.get().then(loadUpsell).catch(() => {}); });
})();
