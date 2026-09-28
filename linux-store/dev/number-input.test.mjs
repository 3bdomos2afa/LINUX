import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const source = fs.readFileSync(path.join(root, 'assets/number-input.js'), 'utf8');

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = new Set();
    this.dataset = {};
    this.style = {};
    this.events = new Map();
    this.parentNode = null;
    this.nodeType = 1;
  }
  closest(selector) {
    for (let current = this; current; current = current.parentNode) if (current.matches(selector)) return current;
    return null;
  }
  setAttribute(name) { this.attributes.add(name); }
  hasAttribute(name) { return this.attributes.has(name); }
  matches(selector) {
    return selector === '[data-localized-number]' && this.hasAttribute('data-localized-number')
      || selector === '.qty' && this.className === 'qty'
      || selector.includes('[data-qty-change]') && this.hasAttribute('data-qty-change');
  }
  addEventListener(name, callback) { this.events.set(name, callback); }
  appendChild(child) {
    if (child.parentNode) child.parentNode.children.splice(child.parentNode.children.indexOf(child), 1);
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  insertBefore(child, before) {
    const index = this.children.indexOf(before);
    if (child.parentNode) child.parentNode.children.splice(child.parentNode.children.indexOf(child), 1);
    this.children.splice(index, 0, child);
    child.parentNode = this;
    return child;
  }
  querySelectorAll(selector) {
    if (selector !== '[data-localized-number]') return [];
    return this.children.flatMap((child) => [
      ...(child.hasAttribute?.('data-localized-number') ? [child] : []),
      ...child.querySelectorAll(selector),
    ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

function mountArabicInput() {
  const documentElement = new FakeElement('html');
  documentElement.lang = 'ar-EG';
  const quantity = new FakeElement('div');
  const input = new FakeElement('input');
  input.type = 'number';
  input.value = '12';
  input.validity = { valid: true };
  input.attributes.add('data-localized-number');
  quantity.appendChild(input);
  const document = {
    documentElement,
    readyState: 'complete',
    querySelectorAll: (selector) => selector === '[data-localized-number]' ? [input] : [],
    createElement: (tagName) => new FakeElement(tagName),
    events: new Map(),
    addEventListener(name, callback) { this.events.set(name, callback); },
  };
  let onMutation;
  class MutationObserver {
    constructor(callback) { onMutation = callback; }
    observe() {}
  }
  const window = {
    LINUX: {},
    getComputedStyle: () => ({ font: '400 15px sans-serif', letterSpacing: 'normal', lineHeight: 'normal', color: 'rgb(1, 2, 3)', textAlign: 'center' }),
  };
  const microtasks = [];
  vm.runInNewContext(source, { window, document, MutationObserver, queueMicrotask: (callback) => microtasks.push(callback) });
  const display = quantity.children[0].children.find((child) => child.className === 'number-input__display');
  return { input, display, api: window.LINUX.numberInputs, onMutation, microtasks, document };
}

test('Arabic quantity display maps visible ASCII digits without parsing the input value', () => {
  const { input, display, api, onMutation, microtasks, document } = mountArabicInput();
  assert.equal(api.format('001.25/12'), '٠٠١.٢٥/١٢');
  assert.equal(display.textContent, '١٢');
  assert.equal(input.value, '12');
  assert.equal(input.validity.valid, true);

  input.value = '30';
  api.sync(input);
  assert.equal(display.textContent, '٣٠');
  assert.equal(input.value, '30');

  const nextInput = new FakeElement('input');
  nextInput.type = 'number';
  nextInput.value = '4';
  nextInput.attributes.add('data-localized-number');
  const nextField = new FakeElement('div');
  nextField.appendChild(nextInput);
  onMutation([{ type: 'childList', addedNodes: [nextInput] }]);
  assert.equal(nextField.children[0].children.find((child) => child.className === 'number-input__display').textContent, '٤');
  assert.equal(nextInput.value, '4');

  const qty = new FakeElement('div');
  qty.className = 'qty';
  const stepButton = new FakeElement('button');
  stepButton.attributes.add('data-qty-change');
  qty.appendChild(stepButton);
  qty.appendChild(input);
  document.events.get('click')({ target: stepButton });
  input.value = '31';
  microtasks.splice(0).forEach((callback) => callback());
  assert.equal(display.textContent, '٣١');
  assert.equal(input.value, '31');
});
