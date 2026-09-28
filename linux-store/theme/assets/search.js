/* LINUX — predictive search via /search/suggest.json */
(function () {
  'use strict';
  const L = window.LINUX;
  const S = L.settings || {};
  const root = S.root && S.root !== '/' ? S.root.replace(/\/$/, '') : '';
  // Catalog titles are English; map common Arabic (and Franco) words so a shopper typing
  // «هودي» still finds the hoodies. Tokens are replaced, not appended, because Shopify search
  // requires every term to match. Spelling variants (أ/إ/آ, ى, ة, tashkeel, «ال») are normalised.
  const norm = (w) => w.replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase();
  const WORDS = {
    hoodie: ['هودي', 'هوديز', 'هوديه', 'hodie', 'hoody', 'hoodies'],
    shirt: ['تيشيرت', 'تيشيرتات', 'تيشرت', 'تشيرت', 'تي', 'شيرت', 'قميص', 'tshirt', 't-shirt', 'tee'],
    cap: ['كاب', 'طاقيه'], anime: ['انمي', 'انيمي'], sada: ['ساده', 'سادا'],
    flower: ['ورد', 'ورده', 'ورود', 'فلاور'], customize: ['تخصيص', 'تصميمك', 'بتصميمك', 'كستم', 'كاستم'],
    black: ['اسود', 'سودا', 'سوداء'], white: ['ابيض', 'بيضا', 'بيضاء'], beige: ['بيج'],
    burgundy: ['نبيتي', 'برجندي', 'خمري', 'عنابي'], winter: ['شتوي', 'شتا', 'شتاء'], summer: ['صيفي', 'صيف'],
  };
  const LOOKUP = {};
  Object.entries(WORDS).forEach(([en, list]) => list.forEach((w) => { LOOKUP[norm(w)] = en; }));
  const translate = (q) => String(q || '').trim().split(/\s+/).filter(Boolean).map((w) => {
    const n = norm(w);
    return LOOKUP[n] || (n.startsWith('ال') && LOOKUP[n.slice(2)]) || w;
  }).join(' ');
  L.searchTerms = translate;
  const resultsUrl = (q) => { const mapped = translate(q); return `${root}/search?q=${encodeURIComponent(mapped)}${mapped !== q.trim() ? `&oq=${encodeURIComponent(q.trim())}` : ''}`; };

  // Every search form submits the mapped terms and keeps the shopper's own words in "oq".
  document.querySelectorAll('form[role="search"]').forEach((form) => form.addEventListener('submit', () => {
    const field = form.querySelector('input[name="q"]');
    if (!field) return;
    const original = field.value.trim(), mapped = translate(original);
    let oq = form.querySelector('input[name="oq"]');
    if (mapped && mapped !== original) {
      field.value = mapped;
      if (!oq) { oq = document.createElement('input'); oq.type = 'hidden'; oq.name = 'oq'; form.appendChild(oq); }
      oq.value = original;
    } else if (oq) oq.remove();
  }));

  // Results page: show the shopper's words again; a direct Arabic link with no hits retries once in English.
  const page = document.querySelector('[data-search-fallback]');
  if (page) {
    const params = new URLSearchParams(location.search);
    const oq = params.get('oq'), q = params.get('q') || '';
    if (oq) {
      document.querySelectorAll('input[name="q"]').forEach((field) => { field.value = oq; });
      const title = page.querySelector('[data-search-title]');
      if (title && q) title.textContent = title.textContent.replace(q, oq);
    } else if (Number(page.dataset.count) === 0 && q && translate(q) !== q.trim()) {
      params.set('q', translate(q)); params.set('oq', q);
      location.replace(`${location.pathname}?${params}`);
    }
  }

  const wrap = document.querySelector('[data-search]');
  if (!wrap) return;
  const input = wrap.querySelector('[data-search-input]');
  const results = wrap.querySelector('[data-search-results]');
  const initial = results.innerHTML;
  const strings = L.strings || {};
  let controller = null;

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = (v) => L.money(Math.round(Number(v) * 100));
  const thumb = (url) => (url && url.includes('cdn.shopify.com') ? url.replace(/(\.[a-z]+)(\?|$)/, '_400x$1$2') : url);


  async function search(q) {
    if (!q || q.trim().length < 2) { results.innerHTML = initial; return; }
    if (controller) controller.abort();
    controller = new AbortController();
    const url = `${root}/search/suggest.json?q=${encodeURIComponent(translate(q))}&resources[type]=product,collection,page,article&resources[limit]=8&resources[options][unavailable_products]=last&resources[options][fields]=title,product_type,variants.title,vendor,tag`;
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      const data = await res.json();
      render(data.resources?.results || {}, q);
    } catch (e) { if (e.name !== 'AbortError') console.error('[search]', e); }
  }

  function render(r, q) {
    const products = r.products || [];
    const collections = r.collections || [];
    const pages = [...(r.pages || []), ...(r.articles || [])];
    if (!products.length && !collections.length && !pages.length) {
      results.innerHTML = `<div class="search-empty"><img src="${wrap.dataset.emptyImg || ''}" alt="" hidden><p>${esc(strings.no_results)}</p><a class="btn btn--glass btn--sm" href="${root}/search?q=${encodeURIComponent(q)}">${esc(q)} <svg class="icon icon--arrow-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>`;
      return;
    }
    let html = '';
    if (products.length) {
      html += `<section class="search-group"><p class="search-group__title">${esc(strings.products)}</p><div class="search-products">` + products.map((p) => {
        const img = p.featured_image ? thumb(p.featured_image.url) : (p.image ? thumb(p.image) : '');
        const sale = p.compare_at_price_min && Number(p.compare_at_price_min) > Number(p.price);
        return `<a class="search-product" href="${p.url}">${img ? `<img src="${img}" alt="" loading="lazy" width="200" height="266">` : ''}<strong>${esc(L.title(p.title))}</strong><span class="price"><span class="price__current${sale ? ' price__sale' : ''}">${money(p.price)}</span>${sale ? `<s class="price__compare">${money(p.compare_at_price_min)}</s>` : ''}</span></a>`;
      }).join('') + '</div></section>';
    }
    if (collections.length || pages.length) {
      html += `<section class="search-group"><p class="search-group__title">${esc(strings.collections)} · ${esc(strings.pages)}</p><div class="search-links">` +
        collections.map((c) => `<a class="chip" href="${c.url}">${esc(c.title)}</a>`).join('') +
        pages.map((p) => `<a class="chip" href="${p.url}">${esc(p.title)}</a>`).join('') + '</div></section>';
    }
    html += `<a class="btn btn--ghost btn--sm" href="${resultsUrl(q)}" style="justify-self:center">${esc(q)} — ${esc(strings.products)} <svg class="icon icon--arrow-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>`;
    results.innerHTML = html;
  }

  input.addEventListener('input', L.debounce((e) => search(e.target.value), 180));
  wrap.addEventListener('click', (e) => {
    const s = e.target.closest('[data-search-suggest]');
    if (s) { input.value = s.dataset.searchSuggest; input.focus(); search(input.value); }
  });
  // "/" opens search anywhere
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); L.drawers && L.drawers.open('search'); }
  });
})();
