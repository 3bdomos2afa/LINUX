import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const cartSource = fs.readFileSync(path.join(theme, 'assets/cart.js'), 'utf8');

function boot({ failBeforeWrite = new Set(), failAfterWrite = new Set(), initialItems = [] } = {}) {
  const cart = { items: structuredClone(initialItems), item_count: initialItems.reduce((sum, item) => sum + item.quantity, 0) };
  const requests = [];
  const toasts = [];
  let activeWrites = 0;
  let maxConcurrentWrites = 0;
  let failNonEmptyCartReads = 0;

  const addCartLine = (item) => {
    const existing = cart.items.find((line) => line.variant_id === item.variant_id
      && JSON.stringify(line.properties) === JSON.stringify(item.properties));
    if (existing) existing.quantity += item.quantity;
    else cart.items.push(item);
    cart.item_count += item.quantity;
  };

  const LINUX = {
    settings: { root: '/', locale: 'en', cartType: 'page', cartUrl: '/cart' },
    strings: { added: 'Added to bag', view_bag: 'View bag', error: 'Could not update the bag.' },
    digits: String,
    buzz() {},
    toast(message) { toasts.push(message); },
    emit() {},
    on() { return () => {}; },
    debounce: (fn) => fn,
    fetchJSON: async (url, options = {}) => {
      requests.push({ url, options });
      if (url === '/cart.js') {
        if (cart.items.length && failNonEmptyCartReads > 0) {
          failNonEmptyCartReads--;
          throw new Error('Cart read temporarily failed');
        }
        return structuredClone(cart);
      }
      if (url !== '/cart/add.js') throw new Error(`Unexpected request: ${url}`);

      if (options.body instanceof FormData) {
        const body = options.body;
        const variantId = String(body.get('id'));
        const quantity = Number(body.get('quantity'));
        const properties = {};
        for (const [name, value] of body.entries()) {
          const match = name.match(/^properties\[(.+)\]$/);
          if (match) properties[match[1]] = value instanceof File ? `/uploads/${value.name}` : value;
        }
        const item = { id: Number(variantId), variant_id: Number(variantId), quantity, properties };
        activeWrites++;
        maxConcurrentWrites = Math.max(maxConcurrentWrites, activeWrites);
        try {
          await new Promise((resolve) => setTimeout(resolve, 0));
          if (failBeforeWrite.has(variantId)) {
            failBeforeWrite.delete(variantId);
            throw new Error(`Rejected variant ${variantId}`);
          }
          addCartLine(item);
          if (failAfterWrite.has(variantId)) {
            failAfterWrite.delete(variantId);
            throw new Error(`Response lost for variant ${variantId}`);
          }
          return { id: item.id, variant_id: item.variant_id, quantity, properties };
        } finally {
          activeWrites--;
        }
      }

      const payload = JSON.parse(options.body);
      return { items: payload.items.map((item) => ({ ...item, id: item.id, variant_id: item.id })) };
    },
  };
  const document = {
    documentElement: { lang: 'en' },
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener() {},
    createElement() {
      const element = { textContent: '' };
      Object.defineProperty(element, 'innerHTML', { get() { return this.textContent; } });
      return element;
    },
  };
  const window = { LINUX };
  vm.runInNewContext(cartSource, {
    window, document, FormData, File, Blob, console, setTimeout,
  });
  return {
    api: LINUX.cart.api,
    add: LINUX.cart.add,
    cart,
    requests,
    toasts,
    failNextNonEmptyCartReads(count) { failNonEmptyCartReads = count; },
    get maxConcurrentWrites() { return maxConcurrentWrites; },
  };
}

const artwork = new File(['design'], 'design.png', { type: 'image/png' });
const mockup = new File(['preview'], 'mockup.jpg', { type: 'image/jpeg' });
const customItem = (id, size, { group = 'group-123', quantity = 1 } = {}) => ({
  id,
  quantity,
  properties: {
    _customize_group: group,
    Size: size,
    'Front design': artwork,
    'Front mockup': mockup,
  },
});

test('customized file items use one documented FormData request per size variant, sequentially', async () => {
  const client = boot();
  await client.api.add([customItem(101, 'M'), customItem(202, 'XL'), customItem(303, 'L')]);
  const posts = client.requests.filter((request) => request.url === '/cart/add.js');

  assert.equal(posts.length, 3);
  assert.equal(client.maxConcurrentWrites, 1);
  const expected = [['101', 'M'], ['202', 'XL'], ['303', 'L']];
  for (const [index, request] of posts.entries()) {
    const body = request.options.body;
    assert.ok(body instanceof FormData);
    assert.deepEqual([body.get('id'), body.get('properties[Size]')], expected[index]);
    assert.equal(body.get('quantity'), '1');
    assert.equal(body.get('properties[_customize_group]'), 'group-123');
    assert.ok(body.get('properties[Front design]') instanceof File);
    assert.ok(body.get('properties[Front mockup]') instanceof File);
    assert.equal(body.has('items[0][id]'), false);
  }
});

test('a failed size stops writes, refreshes the cart, and a deliberate retry adds only missing groups', async () => {
  const client = boot({ failBeforeWrite: new Set(['202']) });
  const items = [customItem(101, 'M'), customItem(202, 'XL'), customItem(303, 'L')];

  await assert.rejects(client.add(items), (error) => {
    assert.equal(error.cartAdded, false);
    assert.equal(error.cartAdd.confirmedQuantity, 1);
    assert.equal(error.cartAdd.totalQuantity, 3);
    assert.match(error.message, /1 of 3 requested pieces/);
    assert.match(error.message, /No write was retried/);
    return true;
  });
  let posts = client.requests.filter((request) => request.url === '/cart/add.js');
  assert.deepEqual(posts.map((request) => request.options.body.get('id')), ['101', '202']);
  assert.equal(client.cart.items.length, 1);
  assert.ok(client.requests.filter((request) => request.url === '/cart.js').length >= 3);
  assert.ok(client.toasts.some((message) => String(message).includes('1 of 3 requested pieces')));

  await client.add(items);
  posts = client.requests.filter((request) => request.url === '/cart/add.js');
  assert.deepEqual(posts.map((request) => request.options.body.get('id')), ['101', '202', '202', '303']);
  assert.equal(client.cart.item_count, 3);
  assert.equal(client.cart.items.find((line) => line.variant_id === 101).quantity, 1);
  assert.equal(client.cart.items.find((line) => line.variant_id === 202).quantity, 1);
  assert.equal(client.cart.items.find((line) => line.variant_id === 303).quantity, 1);
});

test('retry subtracts existing quantity only for the same design, variant, and size', async () => {
  const existing = {
    id: 101,
    variant_id: 101,
    quantity: 1,
    properties: { _customize_group: 'group-123', Size: 'S', 'Front design': '/uploads/design.png', 'Front mockup': '/uploads/mockup.jpg' },
  };
  const client = boot({ initialItems: [existing] });

  await client.api.add([customItem(101, 'S', { quantity: 3 })]);
  let posts = client.requests.filter((request) => request.url === '/cart/add.js');
  assert.equal(posts.length, 1);
  assert.equal(posts[0].options.body.get('quantity'), '2');
  assert.equal(client.cart.item_count, 3);

  await client.api.add([customItem(101, 'M', { quantity: 1 })]);
  posts = client.requests.filter((request) => request.url === '/cart/add.js');
  assert.equal(posts.length, 2);
  assert.equal(posts[1].options.body.get('properties[Size]'), 'M');
});

test('a lost response is reconciled from the cart instead of posting the same group again', async () => {
  const client = boot({ failAfterWrite: new Set(['303']) });

  await client.add([customItem(303, 'L')]);
  const posts = client.requests.filter((request) => request.url === '/cart/add.js');
  assert.equal(posts.length, 1);
  assert.equal(client.cart.item_count, 1);
  assert.equal(client.toasts.at(-1), 'Added to bag');
});

test('the cart refresh after a failed reconciliation can confirm full success', async () => {
  const client = boot({ failAfterWrite: new Set(['505']) });
  client.failNextNonEmptyCartReads(1);

  const result = await client.add([customItem(505, 'XL')]);
  const posts = client.requests.filter((request) => request.url === '/cart/add.js');
  assert.equal(posts.length, 1);
  assert.equal(result.item_count, 1);
  assert.equal(client.cart.item_count, 1);
  assert.equal(client.toasts.at(-1), 'Added to bag');
});

test('ordinary cart items keep the JSON batch request path', async () => {
  const client = boot();
  const items = [{ id: 404, quantity: 2, properties: { Colour: 'Forest' } }];

  await client.api.add(items);
  const posts = client.requests.filter((request) => request.url === '/cart/add.js');
  assert.equal(posts.length, 1);
  assert.equal(typeof posts[0].options.body, 'string');
  assert.deepEqual(JSON.parse(posts[0].options.body), { items });
});

test('customization reset hook receives true only after the complete add succeeds', () => {
  assert.match(cartSource, /let cartAdded = false/);
  assert.match(cartSource, /cartAdded = err\.cartAdded === true/);
  assert.match(cartSource, /if \(cartAdded && form\.onCartAddSuccess\) form\.onCartAddSuccess\(\)/);
  assert.match(cartSource, /form\.refreshProduct\(\{ added: cartAdded \}\)/);
});
