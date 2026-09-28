import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const product = fs.readFileSync(path.join(theme, 'assets/product.js'), 'utf8');

function between(start, end) {
  const first = product.indexOf(start);
  const last = product.indexOf(end, first);
  assert.notEqual(first, -1, `missing source anchor: ${start}`);
  assert.notEqual(last, -1, `missing source anchor: ${end}`);
  return product.slice(first, last).trim();
}

test('bundle pieces clone from the browser template fragment', () => {
  const match = product.match(/const piece = (template\.content\.firstElementChild\.cloneNode\(true\));/);
  assert.ok(match, 'piece creation must use the native template fragment');
  const clone = { cloned: true };
  const template = { content: { firstElementChild: { cloneNode: (deep) => {
    assert.equal(deep, true);
    return clone;
  } } } };
  assert.equal(vm.runInNewContext(match[1], { template }), clone);
});

test('each bundle piece resolves its own selected product, color, and size', () => {
  const find = between('    function find(opts', '\n\n    function paintAvailability');
  const readPieceOptions = between('    const readPieceOptions =', '    const readPieceValues =');
  const pieceVariants = between('    const pieceVariants =', '    const inventoryError =');
  const blackHoodie = {
    variants: [
      { id: 101, options: ['Black', 'S'] },
      { id: 102, options: ['Black', 'M'] },
    ],
  };
  const creamTee = {
    variants: [
      { id: 201, options: ['Cream', 'S'] },
      { id: 202, options: ['Cream', 'L'] },
    ],
  };
  const option = (index, name, value, type = 'select', checked = true) => ({
    type, value, checked, dataset: { bundleOptionIndex: String(index), bundleOptionName: name },
  });
  const makePiece = (handle, color, size) => ({
    querySelector: (selector) => selector === '[data-bundle-product]' ? { value: handle } : null,
    querySelectorAll: () => [option(0, 'color', color), option(1, 'size', size, 'radio')],
  });
  const result = vm.runInNewContext(`(() => {
    const bundleProducts = new Map(Object.entries(products));
    const pieces = selectedPieces;
    const pieceProduct = (piece) => bundleProducts.get(piece.querySelector('[data-bundle-product]').value);
    ${find}
    ${readPieceOptions}
    ${pieceVariants}
    return pieceVariants().map((variant) => variant?.id ?? null);
  })()`, {
    products: { blackHoodie, creamTee },
    selectedPieces: [makePiece('blackHoodie', 'Black', 'M'), makePiece('creamTee', 'Cream', 'L')],
  });
  assert.deepEqual(Array.from(result), [102, 202]);
});

test('unavailable bundle option values are disabled and cart payloads use variant IDs, not prices', () => {
  assert.match(product, /const available = matches\.some\(\(variant\) => variant\.available && !variant\.requires_selling_plan\);/);
  assert.match(product, /option\.disabled = !available;/);
  assert.match(product, /input\.disabled = !available;/);

  const cartItems = between('    form.getCartItems = (fd) => {', '\n\n    /* Fit finder:');
  assert.match(cartItems, /return resolved\.map\(\(variant, index\)/);
  assert.match(cartItems, /id: variant\.id, quantity/);
  assert.match(cartItems, /properties: \{ \.\.\.properties/);
  assert.doesNotMatch(cartItems, /\bprice\s*:/);
});
