// Arabic search words reach the English catalog titles.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../theme/assets/search.js', import.meta.url), 'utf8');

function loadSearchTerms() {
  const window = { LINUX: { settings: { root: '/' }, strings: {}, debounce: (fn) => fn } };
  const document = { querySelector: () => null, querySelectorAll: () => [] };
  vm.runInNewContext(source, { window, document, location: { search: '', pathname: '/search' }, URLSearchParams });
  return window.LINUX.searchTerms;
}

test('Arabic search words map to the English catalog terms, spelling variants included', () => {
  const terms = loadSearchTerms();
  assert.equal(terms('هودى نبيتي'), 'hoodie burgundy');
  assert.equal(terms('الهودي الأسود'), 'hoodie black');
  assert.equal(terms('تيشيرت أنمي أبيض'), 'shirt anime white');
  assert.equal(terms('سادة بيج'), 'sada beige');
  assert.equal(terms('  هوديز   شتوي '), 'hoodie winter');
});

test('unknown words, codes and English queries pass through unchanged', () => {
  const terms = loadSearchTerms();
  assert.equal(terms('LINUX10 هودي'), 'LINUX10 hoodie');
  assert.equal(terms('hoodie'), 'hoodie');
  assert.equal(terms('بطريق'), 'بطريق');
  assert.equal(terms(''), '');
});
