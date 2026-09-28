import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';
import { registerFilters } from './filters.mjs';

const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const cartBody = fs.readFileSync(path.join(theme, 'snippets/cart-body.liquid'), 'utf8');
const layout = fs.readFileSync(path.join(theme, 'layout/theme.liquid'), 'utf8');
const customize = fs.readFileSync(path.join(theme, 'assets/customize.js'), 'utf8');
const customizeSection = fs.readFileSync(path.join(theme, 'sections/main-customize.liquid'), 'utf8');
const product = fs.readFileSync(path.join(theme, 'assets/product.js'), 'utf8');
const productSection = fs.readFileSync(path.join(theme, 'sections/main-product.liquid'), 'utf8');
const numberInput = fs.readFileSync(path.join(theme, 'assets/number-input.js'), 'utf8');
const propertyLabel = fs.readFileSync(path.join(theme, 'snippets/property-label.liquid'), 'utf8');

function renderer(locale) {
  const engine = new Liquid({
    root: path.join(theme, 'snippets'),
    extname: '.liquid',
    globals: { __locale: locale, request: { locale: { iso_code: locale } } },
  });
  registerFilters(engine, { shop: { money_format: 'LE {{amount}}', money_with_currency_format: 'LE {{amount}}' } });
  return engine;
}

test('custom line-item property labels localize only the known size, piece, and sides keys', async () => {
  for (const [locale, labels] of [
    ['en', { Size: 'Size', Piece: 'Pieces', Sides: 'Sides' }],
    ['ar', { Size: 'المقاس', Piece: 'القطع', Sides: 'الجهات' }],
  ]) {
    const liquid = renderer(locale);
    for (const [name, expected] of Object.entries(labels)) {
      assert.equal((await liquid.renderFile('property-label', { name })).trim(), expected);
    }
  }
  assert.match(propertyLabel, /when 'size'\s+echo 'products\.option_names\.size' \| t/);
  assert.match(propertyLabel, /when 'piece'\s+echo 'cart\.customized_pieces' \| t/);
});

test('Arabic piece indices localize while the native 2XL size code stays ASCII', async () => {
  const liquid = renderer('ar');
  assert.equal((await liquid.renderFile('digits', { value: '1, 3' })).trim(), '١, ٣');
  assert.equal((await liquid.renderFile('option-value', { value: '2XL' })).trim(), '2XL');
});

test('cart preserves size codes, localizes piece indices narrowly, and hides private group IDs', () => {
  assert.match(cartBody, /p\.first == 'Piece'[\s\S]*?render 'digits', value: property_value[\s\S]*?piece_display \| strip \| escape/);
  assert.match(cartBody, /p\.first == 'Size'[\s\S]*?render 'option-value', value: property_value[\s\S]*?size_display \| strip \| escape/);
  assert.match(cartBody, /p\.first == 'Sides'[\s\S]*?'customize\.both_sides' \| t[\s\S]*?'customize\.front' \| t[\s\S]*?'customize\.back' \| t/);
  assert.match(cartBody, /first_char != '_'/);
  assert.match(cartBody, /property_value \| escape/);
});

test('Customize loads its variant model first and syncs the localized quantity display', () => {
  const scriptBlocks = [...layout.matchAll(/\{%- if template\.suffix == 'customize' -%\}([\s\S]*?)\{%- endif -%\}/g)];
  const scripts = scriptBlocks.at(-1)?.[1] || '';
  const modelIndex = scripts.indexOf("'customize-model.js'");
  const clientIndex = scripts.indexOf("'customize.js'");
  assert.ok(modelIndex >= 0 && clientIndex > modelIndex, 'model must load before its Customize client');
  assert.match(customizeSection, /type="number"[^>]*data-localized-number[^>]*data-cz-qty/);
  assert.match(customize, /qtyInput\.value = state\.qty;\s*L\.numberInputs\?\.sync\(qtyInput\);/);
});

test('quick view inherits the localized numeric quantity and syncs step changes', () => {
  assert.match(productSection, /name="quantity"[^>]*data-localized-number/);
  assert.match(product, /qtyInput\.value = Math\.max\(1, Number\(qtyInput\.value\) \+ Number\(b\.dataset\.qtyStep\)\);\s*qtyInput\.dispatchEvent\(new Event\('change', \{ bubbles: true \}\)\);/);
  assert.match(numberInput, /input\.addEventListener\('change', \(\) => sync\(input\)\);/);
  assert.match(product, /content\.replaceChildren\(pdp\);\s*initProduct\(pdp\);/);
});
