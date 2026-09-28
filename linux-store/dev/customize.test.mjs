import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const path = new URL('../theme/', import.meta.url);
const source = (file) => fs.readFileSync(new URL(file, path), 'utf8');
const window = {};
vm.runInNewContext(source('assets/customize-model.js'), { window });
const { variantFor, quote, tiersFrom, groupPieces } = window.LINUX.customizeModel;
const plain = (value) => JSON.parse(JSON.stringify(value));
const product = JSON.parse(fs.readFileSync(new URL('./data/product-hoodie-customize.json', import.meta.url)));
const mapping = { colorOption: 'Color', sizeOption: 'Size', methodOption: 'Type', methodValues: { Print: 'Print', Embroidery: 'Embroidery' } };
const variant = (size = 'L', method = 'Print', color = 'black') => variantFor(product, { size, method, color }, mapping);

test('each custom piece resolves its actual colour, size and method variant', () => {
  const small = variant('M'), large = variant('2XL'), embroidered = variant('M', 'Embroidery');
  assert.ok(small && large && embroidered);
  assert.notEqual(small.id, large.id);
  assert.notEqual(small.id, embroidered.id);
  assert.equal(small.price, 84900);
  assert.equal(embroidered.price, 94900);
  assert.deepEqual(small.options, ['black', 'm', 'Print']);
  assert.deepEqual(large.options, ['black', '2xl', 'Print']);
});

test('missing colour, method, size, product or mapping never silently substitutes another variant', () => {
  assert.equal(variant('S'), null);
  assert.equal(variant('L', 'Print', 'purple'), null);
  assert.equal(variant('L', 'Unknown'), null);
  assert.equal(variantFor(null, {}, mapping), null);
  assert.equal(variantFor(product, { size: 'M', color: 'black', method: 'Print' }, { ...mapping, colorOption: 'Wrong' }), null);
});

test('unavailable sizes remain unavailable and block quote and cart grouping', () => {
  const unavailable = { ...variant('M'), available: false };
  assert.equal(quote([unavailable]), null);
  assert.equal(groupPieces([variant('M'), unavailable], ['M', 'L']), null);
  assert.equal(groupPieces([variant('M')], []), null);
  assert.equal(quote([null]), null);
});

test('size-as-property requires an explicit merchant opt-in', () => {
  const custom = { options: ['Color', 'Type'], variants: [{ id: 1, options: ['black', 'Print'], price: 10000, available: true }] };
  const selection = { color: 'black', method: 'Print', size: '2XL' };
  assert.equal(variantFor(custom, selection, mapping), null);
  assert.equal(variantFor(custom, selection, { ...mapping, sizeAsProperty: true }).id, 1);
});

test('distinct sizes stay distinct while identical pieces share an upload and line', () => {
  const medium = variant('M'), large = variant('L');
  assert.deepEqual(plain(groupPieces([medium, large, medium], ['M', 'L', 'M'])), [
    { id: medium.id, quantity: 2, size: 'M', pieces: [1, 3] },
    { id: large.id, quantity: 1, size: 'L', pieces: [2] },
  ]);
});

test('unconfigured quantity pricing displays only real variant totals', () => {
  const variants = [variant('M'), variant('L'), variant('2XL')];
  const result = quote(variants);
  assert.equal(result.total, 254700);
  assert.equal(result.unit, 84900);
  assert.equal(result.savings, 0);
  assert.equal(result.estimated, false);
  assert.equal(result.next, null);
});

test('configured estimates switch on threshold, stay in integer minor units and disclose their status', () => {
  const tiers = [{ quantity: 2, discount: 5 }, { quantity: 5, discount: 10 }];
  assert.equal(quote([variant()], tiers).total, 84900);
  assert.equal(quote([variant()], tiers).next.quantity, 2);
  const two = quote([variant(), variant()], tiers);
  assert.equal(two.total, 161310);
  assert.equal(two.savings, 8490);
  assert.equal(two.estimated, true);
  const five = quote(Array(5).fill(variant()), tiers);
  assert.equal(five.total, 382050);
  assert.equal(five.unit, 76410);
  assert.ok(five.unit < two.unit);
  assert.equal(five.next, null);
});

test('tier validation ignores zero, invalid and regressive discount configuration', () => {
  assert.deepEqual(plain(tiersFrom([
    { quantity: 1, discount: 10 }, { quantity: 2, discount: 0 }, { quantity: 2, discount: 5 },
    { quantity: 4, discount: 4 }, { quantity: 5, discount: 10 }, { quantity: 2, discount: 3 },
    { quantity: 20, discount: 100 }, { quantity: -1, discount: 10 }, { quantity: 1.5, discount: 12 },
  ])), [{ quantity: 2, discount: 5 }, { quantity: 5, discount: 10 }]);
});

test('native Shopify volume pricing applies per variant, not across unrelated sizes', () => {
  const medium = { ...variant('M'), quantity_price_breaks: [{ minimum_quantity: 2, price: 80000 }] };
  const large = { ...variant('L'), quantity_price_breaks: [{ minimum_quantity: 2, price: 80000 }] };
  assert.equal(quote([medium, large]).total, 169800);
  const quoted = quote([medium, medium, large], [{ quantity: 2, discount: 20 }]);
  assert.equal(quoted.total, 244900);
  assert.equal(quoted.estimated, false);
});

test('native price breaks select the highest eligible threshold including existing cart quantity', () => {
  const item = { ...variant(), cart_quantity: 4, quantity_price_breaks: [
    { minimum_quantity: 2, price: 80000 }, { minimum_quantity: 5, price: 81000 },
  ] };
  assert.equal(quote([item]).total, 81000);
  assert.equal(quote([item]).estimated, false);
});

test('cart updates refresh native pricing through the shared event bus', () => {
  const catalog = { hoodie: { variants: [{ ...variant(), cart_quantity: 0 }] }, tee: null };
  const listeners = new Map();
  const L = {
    on: (name, listener) => listeners.set(name, listener),
    emit: (name, cart) => listeners.get(name)?.(cart),
  };
  const registration = source('assets/customize.js').match(/  (?:L\.on|document\.addEventListener)\('cart:updated',[\s\S]*?\n  \}\);/);
  assert.ok(registration);
  let paints = 0;
  const context = { L, catalog, document: { addEventListener() {} }, priceSignature: 'old quote', paint: () => { paints++; } };
  vm.runInNewContext(registration[0], context);
  const selected = catalog.hoodie.variants[0];
  L.emit('cart:updated', { items: [{ variant_id: selected.id, quantity: 2 }, { variant_id: String(selected.id), quantity: 3 }, { variant_id: 1, quantity: 10 }] });
  assert.equal(selected.cart_quantity, 5);
  assert.equal(context.priceSignature, '');
  assert.equal(paints, 1);
  L.emit('cart:updated', { items: [] });
  assert.equal(selected.cart_quantity, 0);
  assert.equal(paints, 2);
});

test('studio does not hijack wheel or touch scrolling and limits drag to explicit editing', () => {
  const js = source('assets/customize.js');
  const css = source('assets/customize.css');
  assert.doesNotMatch(js, /addEventListener\(['"](?:wheel|touchmove|touchstart)['"]/);
  assert.match(css, /\.cz__canvas\s*\{[^}]*touch-action: pan-y pinch-zoom/);
  assert.match(css, /\.cz__canvas\.is-editing \.cz__design\s*\{[^}]*touch-action: none/);
  assert.match(js, /if \(!state\.editing \|\| root\.dataset\.preparing/);
  assert.doesNotMatch(css, /\.cz__sizes\.is-many[^}]*overflow:\s*auto/);
});

test('mockups use native image-picker settings, retain aspect ratio and export both sides independently', () => {
  const section = source('sections/main-customize.liquid');
  const schema = JSON.parse(section.match(/{% schema %}\s*([\s\S]*?)\s*{% endschema %}/)[1]);
  assert.equal(schema.settings.filter((setting) => setting.type === 'image_picker').length, 4);
  assert.equal(schema.blocks.find((block) => block.type === 'color').settings.filter((setting) => setting.type === 'image_picker').length, 4);
  const js = source('assets/customize.js');
  assert.match(js, /const photo = photoFor\(side\)/);
  assert.match(js, /Math\.min\(size \/ base\.naturalWidth, size \/ base\.naturalHeight\)/);
  assert.match(js, /Promise\.all\(SIDES\.map\(buildMockup\)\)/);
  assert.doesNotMatch(section, /assign p = collections\.all\.products\.first/);
});

test('swatch colour and configured variant value are bound to their actual dataset names', () => {
  const section = source('sections/main-customize.liquid'), js = source('assets/customize.js');
  assert.match(section, /data-cz-tone="{{ b\.hex }}"/);
  assert.match(js, /btn\.dataset\.czTone/);
  assert.match(section, /data-cz-variant-key="{{ b\.variant_value/);
  assert.match(js, /btn\.dataset\.czVariantKey/);
  assert.doesNotMatch(js, /czHex|czVariantValue/);
});
