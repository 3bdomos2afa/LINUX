import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const read = (file) => fs.readFileSync(path.join(theme, file), 'utf8');

test('the shared free-shipping meter renders only in the cart drawer', () => {
  const drawer = read('sections/cart-drawer.liquid');
  const header = read('sections/header.liquid');
  const cartPage = read('sections/main-cart.liquid');
  const meter = read('snippets/ship-meter.liquid');

  assert.equal([...drawer.matchAll(/render\s+['"]ship-meter['"]/g)].length, 1);
  assert.match(drawer, /render 'ship-meter', cart: cart, context: 'drawer'/);
  assert.doesNotMatch(header, /render\s+['"]ship-meter['"]|data-ship-meter/);
  assert.doesNotMatch(cartPage, /render\s+['"]ship-meter['"]|data-ship-meter/);
  assert.match(meter, /context == 'drawer' and threshold > 0 and cart\.item_count > 0/);
  assert.match(meter, /data-cart-region="meter"/);
});

test('cart AJAX refresh syncs meter visibility and ignores out-of-order section renders', () => {
  const cart = read('assets/cart.js');
  assert.match(cart, /live\.classList\.toggle\('is-live', next\.classList\.contains\('is-live'\)\)/);
  assert.match(cart, /renderId > drawerRenderApplied/);
  assert.match(cart, /\['meter', 'body', 'foot'\]/);
});
