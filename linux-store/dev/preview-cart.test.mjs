import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { nest } from './form-data.mjs';
import { buildStore } from './store.mjs';

const data = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');

test('Shopify multipart items expand to arrays and retain uploaded property URLs', () => {
  assert.deepEqual(nest({
    'items[0][id]': '1', 'items[0][quantity]': '2', 'items[0][properties][Front design]': '/uploads/front.png',
    'items[1][id]': '2', 'items[1][quantity]': '1', 'items[1][properties][Size]': 'XL',
  }), { items: [
    { id: '1', quantity: '2', properties: { 'Front design': '/uploads/front.png' } },
    { id: '2', quantity: '1', properties: { Size: 'XL' } },
  ] });
  assert.deepEqual(nest({ items: [{ id: 1, quantity: 2 }] }), { items: [{ id: 1, quantity: 2 }] });
});

test('nested form parsing rejects prototype keys', () => {
  assert.deepEqual(nest({ '__proto__[corrupted]': 'yes', 'items[0][constructor][prototype][bad]': 'yes' }), {});
  assert.equal({}.corrupted, undefined);
});

test('preview cart keeps same-variant custom orders separate for differing properties', () => {
  const store = buildStore(data);
  const variant = store.productByHandle('hoodie-customize').variants.find((item) => item.available);
  const a = store.cartAdd(variant.id, 1, { Garment: 'Hoodie', Size: 'M', 'Front design': '/uploads/a.png' });
  const b = store.cartAdd(variant.id, 1, { Garment: 'Hoodie', Size: 'M', 'Front design': '/uploads/b.png' });
  assert.notEqual(a.key, b.key);
  assert.equal(store.cartJSON().items.length, 2);
  store.cartAdd(variant.id, 2, { 'Front design': '/uploads/a.png', Size: 'M', Garment: 'Hoodie' });
  assert.equal(store.cartJSON().items.find((item) => item.key === a.key).quantity, 3);
  assert.equal(store.cartJSON().item_count, 4);
  assert.throws(() => store.cartAdd(variant.id, -1, {}));
  assert.throws(() => store.cartAdd(variant.id, 1.5, {}));
});
