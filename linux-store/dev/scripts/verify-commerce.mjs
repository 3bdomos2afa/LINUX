import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
const artifacts = path.join(root, '.hoplite/artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const results = [];
const front = path.join(artifacts, 'test-design-front.svg');
const back = path.join(artifacts, 'test-design-back.svg');
fs.writeFileSync(front, '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><path d="M160 20L285 220H35Z" fill="#f4e8d8"/><circle cx="160" cy="155" r="40" fill="#8fcb5a"/></svg>');
fs.writeFileSync(back, '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect x="35" y="25" width="170" height="270" rx="72" fill="#8fcb5a"/><path d="M70 90L170 160 70 230" fill="none" stroke="#043222" stroke-width="20"/></svg>');

function browser(...args) {
  let out;
  try { out = execFileSync('agent-browser', ['--json', ...args], { encoding: 'utf8', timeout: 45000 }); }
  catch (error) { throw new Error(error.stdout ? JSON.parse(error.stdout).error : error.message); }
  const result = JSON.parse(out);
  if (!result.success) throw new Error(result.error);
  return result.data;
}
const evaluate = (source) => browser('eval', source).result;
const pause = () => browser('wait', '650');
function click(selector) {
  evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
  browser('click', selector);
  pause();
}
const cart = () => evaluate("fetch('/ar/cart.js').then(response=>response.json())");
const clear = () => evaluate("fetch('/ar/cart/clear.js',{method:'POST'}).then(()=>fetch('/ar/cart/update.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({discount:''})})).then(response=>response.json())");
const open = (route) => { browser('open', `${base}${route}`); pause(); };
const passed = (name, detail = {}) => { results.push({ name, passed: true, ...detail }); console.log(`PASS ${name}`); };

browser('set', 'viewport', '390', '844');
open('/ar/');
click('.tab-bar__item--primary');
assert.equal(evaluate("new URL(location.href).searchParams.get('view')"), 'customize');
assert.equal(evaluate("!!document.querySelector('[data-cz-canvas]')"), true);
assert.equal(evaluate("document.querySelector('.tab-bar__item--primary').getAttribute('aria-current')"), 'page');
passed('Mobile star opens the localized Customize studio and announces the active tab');

open('/ar/pages/customize');
clear();
open('/ar/pages/customize');
click('[data-cz-submit]');
assert.equal(cart().item_count, 0);
assert.equal(evaluate("document.querySelector('[data-cz-submit-error]').hidden"), false);
passed('Missing artwork blocks submission');

browser('upload', '[data-cz-file="front"]', front);
browser('upload', '[data-cz-file="back"]', back);
pause();
click('[data-cz-method="Embroidery"]');
assert.equal(evaluate("document.querySelector('[data-cz-total]').textContent"), '٩٤٩ جنيه');
click('[data-cz-submit]');
assert.equal(cart().item_count, 0);
assert.match(evaluate("document.querySelector('[data-cz-submit-error]').textContent"), /١٠/);
passed('Embroidery uses its real variant price and enforces the studio minimum');

click('[data-cz-method="Print"]');
click('[data-cz-qty-set="5"]');
browser('check', 'input[name="cz-size-0"][value="M"]');
browser('check', 'input[name="cz-size-1"][value="XL"]');
click('[data-cz-qty-set="1"]');
click('[data-cz-qty-set="5"]');
assert.deepEqual(evaluate("[...document.querySelectorAll('.cz__size-row input:checked')].map(input=>input.value)"), ['M', 'XL', 'L', 'L', 'L']);
assert.equal(evaluate("document.querySelector('[data-cz-qty]').parentElement.querySelector('.number-input__display').textContent"), '٥');
assert.equal(evaluate("document.querySelector('[data-cz-qty]').value"), '5');
passed('Independent sizes persist and Arabic quantity retains native numeric value');

evaluate("document.querySelector('[data-cz-canvas]').scrollIntoView({block:'center',behavior:'instant'})");
pause();
const position = evaluate("document.querySelector('[data-cz-pos=back]').value");
const stage = evaluate("(()=>{const r=document.querySelector('[data-cz-canvas]').getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),scroll:scrollY}})()");
assert.ok(stage.y > 0 && stage.y < 844, JSON.stringify(stage));
browser('mouse', 'move', String(stage.x), String(stage.y));
browser('mouse', 'wheel', '400');
pause();
assert.ok(evaluate('scrollY') > stage.scroll + 200);
assert.equal(evaluate("document.querySelector('[data-cz-pos=back]').value"), position);
passed('Wheel over artwork scrolls the page without altering the artwork');

click('[data-cz-edit-toggle]');
evaluate("document.querySelector('[data-cz-canvas]').scrollIntoView({block:'center',behavior:'instant'})");
pause();
const design = evaluate("(()=>{const r=document.querySelector('[data-cz-design=back]').getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()");
const frontPosition = evaluate("document.querySelector('[data-cz-pos=front]').value");
browser('mouse', 'move', String(design.x), String(design.y));
browser('mouse', 'down');
browser('mouse', 'move', String(design.x + 25), String(design.y + 20));
browser('mouse', 'up');
assert.notEqual(evaluate("document.querySelector('[data-cz-pos=back]').value"), position);
assert.equal(evaluate("document.querySelector('[data-cz-pos=front]').value"), frontPosition);
click('[data-cz-edit-toggle]');
assert.match(evaluate("getComputedStyle(document.querySelector('[data-cz-design=back]')).touchAction"), /pan-y/);
passed('Explicit edit mode moves only the selected side and restores native touch-action');

evaluate("window.__nativeFetch=fetch.bind(window);window.__postCount=0;window.__injectFailure=true;window.fetch=(url,options)=>{if(String(url).includes('/cart/add.js')){window.__postCount++;if(window.__injectFailure&&window.__postCount===2)return Promise.reject(new Error('Simulated network interruption'));}return window.__nativeFetch(url,options)}");
click('[data-cz-submit]');
browser('wait', '1200');
assert.equal(cart().item_count, 1);
assert.match(evaluate("document.querySelector('[data-cz-submit-error]').textContent"), /١.*٥/);
evaluate('window.__injectFailure=false');
click('[data-cz-submit]');
browser('wait', '1200');
const order = cart();
assert.equal(order.item_count, 5);
assert.equal(order.items.length, 3);
assert.equal(order.total_price, 424500);
assert.equal(evaluate('window.__postCount'), 4);
for (const line of order.items) {
  assert.equal(line.variant_options[1].toUpperCase(), line.properties.Size);
  for (const key of ['Front design', 'Back design', 'Front mockup', 'Back mockup']) assert.match(line.properties[key], /^\/uploads\//);
  assert.ok(line.properties.Piece && line.properties._customize_group);
}
assert.equal(evaluate("document.querySelector('[data-drawer=cart]').getAttribute('aria-hidden')"), 'false');
assert.equal(evaluate("document.querySelectorAll('[data-ship-meter]').length"), 1);
passed('Partial file-upload failure retries only missing size groups with preserved artwork', { pieces: 5, lines: 3, total: order.total_price, writesIncludingFailedAttempt: 4 });

for (const side of ['Front', 'Back']) {
  const response = await fetch(`${base}${order.items[0].properties[`${side} mockup`]}`);
  assert.equal(response.status, 200);
  fs.writeFileSync(path.join(artifacts, `verified-${side.toLowerCase()}-mockup.jpg`), Buffer.from(await response.arrayBuffer()));
}

browser('fill', '[data-drawer="cart"] [data-discount-input]', 'LINUX10');
click('[data-drawer="cart"] [data-discount-apply]');
// The discount is applied asynchronously; give the request time to land before asserting.
for (let tries = 0; tries < 20 && cart().total_price !== 382050; tries++) browser('wait', '200');
assert.equal(cart().total_price, 382050);
assert.equal(cart().discount_codes[0].applicable, true);
browser('fill', '[data-drawer="cart"] [data-discount-input]', 'NOT-A-REAL-CODE');
click('[data-drawer="cart"] [data-discount-apply]');
assert.equal(cart().total_price, 382050);
assert.equal(evaluate("document.querySelector('[data-drawer=cart] [data-discount-error]').hidden"), false);
passed('Cart displays actual local discount totals and rejects invalid codes without dropping valid codes');

open('/ar/cart');
assert.equal(evaluate("document.querySelector('[data-cart-page]').querySelectorAll('[data-ship-meter]').length"), 0);
assert.equal(evaluate("[...document.querySelectorAll('[data-cart-page] [data-line]')].length"), 3);
passed('Full cart preserves the three custom lines without duplicating the shipping meter');

open('/ar/pages/customize');
click('[data-cz-color="white"]');
click('[data-cz-side="front"]');
// Hoodie fronts now ship real built-in mockup photos for every colour…
assert.match(evaluate("document.querySelector('[data-cz-photo]:not([hidden])')?.dataset.src || ''"), /cz-hoodie-front-white/);
assert.equal(evaluate("document.querySelector('[data-cz-mock=hoodie-front]').hidden"), true);
// …so the drawn, recoloured fallback is checked with those photos removed.
evaluate("document.querySelectorAll('[data-cz-photo$=\"|hoodie-front\"]').forEach((el) => { el.dataset.czPhoto = 'disabled'; }), true");
click('[data-cz-side="back"]');
click('[data-cz-side="front"]');
assert.equal(evaluate("document.querySelector('[data-cz-garment]').style.getPropertyValue('--gc')"), '#e5e5e5');
assert.equal(evaluate("document.querySelector('[data-cz-mock=hoodie-front]').hidden"), false);
passed('Built-in hoodie-front photo shows; the drawn fallback uses the selected swatch colour');

open('/ar/pages/customize?__fixture=studio');
assert.match(evaluate("document.querySelector('[data-cz-photo]:not([hidden])').dataset.src"), /white/);
click('[data-cz-side="front"]');
assert.match(evaluate("document.querySelector('[data-cz-photo]:not([hidden])').dataset.src"), /black/);
click('[data-cz-color="white"]');
assert.match(evaluate("document.querySelector('[data-cz-photo]:not([hidden])').dataset.src"), /beige/);
click('[data-cz-qty-set="5"]');
assert.equal(evaluate("document.querySelector('[data-cz-unit]').textContent"), '٧٦٤.١٠ جنيه');
assert.equal(evaluate("document.querySelector('[data-cz-total]').textContent"), '٣,٨٢٠.٥٠ جنيه');
assert.equal(evaluate("document.querySelector('[data-cz-pricing-note]').hidden"), false);
assert.match(evaluate("document.querySelector('[data-cz-total-label]').textContent"), /المتوقع/);
passed('Image-picker fixture demonstrates shared and per-colour precedence; configured tiers clearly display estimates');

click('[data-cz-qty-set="1"]');
evaluate("window.__nativeQuote=LINUX.customizeModel.quote;LINUX.customizeModel.quote=(selected,tiers)=>window.__nativeQuote(selected.map(variant=>({...variant,quantity_price_breaks:[{minimum_quantity:5,price:80000}]})),tiers);window.__quotedVariant=Number(document.querySelector('[data-variant-id]').value);LINUX.emit('cart:updated',{items:[{variant_id:window.__quotedVariant,quantity:4}]})");
assert.equal(evaluate("document.querySelector('[data-cz-total]').textContent"), '٨٠٠ جنيه');
evaluate("LINUX.emit('cart:updated',{items:[]})");
assert.equal(evaluate("document.querySelector('[data-cz-total]').textContent"), '٨٤٩ جنيه');
evaluate('LINUX.customizeModel.quote=window.__nativeQuote');
passed('Synthetic native price-break quote refreshes on shared cart events and resets when cart quantity falls');

open('/ar/pages/customize');
assert.equal(evaluate("document.querySelector('[data-cz-price-tiers]').hidden"), true);
assert.equal(evaluate("document.querySelector('[data-cz-total]').textContent"), '٨٤٩ جنيه');
passed('Test-only mockup and pricing settings do not alter the shipped storefront');
fs.writeFileSync(path.join(artifacts, 'commerce-verification.json'), JSON.stringify({ recordedAt: new Date().toISOString(), results }, null, 2));
console.log(`${results.length} commerce browser scenarios passed (local Shopify harness; no live checkout).`);
