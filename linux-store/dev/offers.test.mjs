// Bundle pieces from the whole store, and the local payment methods.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';
import { buildStore } from './store.mjs';
import { registerFilters } from './filters.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const snippets = path.resolve(here, '../theme/snippets');
const store = buildStore(path.join(here, 'data'));

function render(file, locale, vars = {}, settings = {}) {
  const env = store.environment({ locale, path: '/', query: {}, cookies: {} });
  const engine = new Liquid({ root: [snippets], partials: [snippets], extname: '.liquid', jsTruthy: false, cache: false, ownPropertyOnly: false });
  registerFilters(engine, store);
  return engine.renderFile(file, { ...env, settings: { ...env.settings, ...settings }, ...vars });
}
const bundleProducts = (html) => JSON.parse(html.match(/data-bundle-products>([\s\S]*?)<\/script>/)[1].replace(/\\u003c/g, '<'));

for (const locale of ['ar', 'en']) {
  test(`${locale}: "any product" bundles list the whole store except the Customize product`, async () => {
    const env = store.environment({ locale, path: '/', query: {}, cookies: {} });
    const product = env.all_products['hoodie-anime-black'];
    const html = await render('bundle-offer', locale, { product, current: product.selected_or_first_available_variant, block: { settings: { source: 'store' }, shopify_attributes: '' } });
    const handles = bundleProducts(html).map((p) => p.handle);
    assert.equal(handles[0], 'hoodie-anime-black', 'the current product leads');
    assert.ok(handles.includes('anime-shirt') && handles.includes('hoodie-sada-beige'), 'hoodies and tees are both offered');
    assert.ok(!handles.some((h) => h.includes('customize')), 'the Customize product needs artwork, so it is never a bundle piece');
    assert.equal(new Set(handles).size, handles.length, 'no duplicates');
    const same = bundleProducts(await render('bundle-offer', locale, { product, current: product.selected_or_first_available_variant, block: { settings: { source: 'same' }, shopify_attributes: '' } }));
    assert.deepEqual(same.map((p) => p.handle), ['hoodie-anime-black']);
  });

  test(`${locale}: payment badges show InstaPay, Vodafone Cash and cash on delivery — no card logos unless enabled`, async () => {
    const html = await render('payment-badges', locale);
    assert.match(html, /pay-badge--cod/);
    assert.match(html, /pay-badge--instapay/);
    assert.match(html, /pay-badge--vodafone/);
    assert.doesNotMatch(html, /payment-icon|visa|master/i);
    const withCards = await render('payment-badges', locale, {}, { pay_card_icons: true });
    assert.match(withCards, /payment-icon/);
    const howto = await render('payment-howto', locale, {}, { pay_instapay_address: 'linux@instapay' });
    assert.match(howto, /linux@instapay/);
  });
}
