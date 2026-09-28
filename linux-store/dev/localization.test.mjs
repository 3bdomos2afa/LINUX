import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';
import { registerFilters } from './filters.mjs';

const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const read = (file) => fs.readFileSync(path.join(theme, file), 'utf8');
const shop = { money_format: 'LE {{amount}}' };

function renderer(locale) {
  const engine = new Liquid({
    root: path.join(theme, 'snippets'),
    extname: '.liquid',
    globals: {
      __locale: locale,
      request: { locale: { iso_code: locale } },
      settings: { currency_ar: 'جنيه', type_system_fonts: true },
      shop,
    },
  });
  registerFilters(engine, { shop });
  return engine;
}

function client(locale, { countdownEnd = '', now = Date.now() } = {}) {
  const units = Object.fromEntries(['hours', 'minutes', 'seconds'].map((key) => [key, { textContent: '' }]));
  const time = { now };
  const active = {
    removed: false,
    querySelector: (selector) => units[selector.match(/"(.*?)"/)?.[1]],
    remove() { this.removed = true; },
  };
  const expired = { remove() { this.removed = true; } };
  const clock = {
    dataset: { countdownEnd: countdownEnd },
    hidden: true,
    querySelector: (selector) => selector === '[data-countdown-active]' ? active
      : selector === '[data-countdown-expired]' ? expired : null,
    appendChild() {},
  };
  const document = {
    documentElement: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
    querySelectorAll: (selector) => countdownEnd && selector === '[data-countdown]' ? [clock] : [],
    addEventListener() {},
  };
  const window = { LINUX: { settings: { locale, moneyFormat: shop.money_format, currencyAr: 'جنيه' } } };
  const ticks = [];
  class FixedDate extends Date {
    static now() { return time.now; }
  }
  vm.runInNewContext(read('assets/global.js'), {
    window, document, console, Date: FixedDate,
    addEventListener() {},
    setInterval: (callback) => ticks.push(callback),
  });
  return { L: window.LINUX, units, ticks, clock, active, expired, setNow: (value) => { time.now = value; } };
}

function countUp(value, locale, reducedMotion = false) {
  const element = { textContent: value };
  const frames = [];
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.callback([{ isIntersecting: true, target }]); }
    unobserve() {}
  }
  const document = {
    body: {},
    querySelector: () => null,
    querySelectorAll: (selector) => selector === '[data-count]' ? [element] : [],
    addEventListener() {},
  };
  vm.runInNewContext(read('assets/glass.js'), {
    document,
    window: { LINUX: client(locale).L, IntersectionObserver, scrollY: 0 },
    IntersectionObserver,
    MutationObserver: class { observe() {} },
    matchMedia: (query) => ({ matches: reducedMotion && query.includes('prefers-reduced-motion') }),
    performance: { now: () => 0 },
    requestAnimationFrame: (callback) => frames.push(callback),
    addEventListener() {},
  });
  return { element, frames };
}

function flatten(value, prefix = '') {
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'string' ? [[name, child]] : Object.entries(flatten(child, name));
  }));
}

test('Arabic copy preserves locale keys and interpolation variables', () => {
  const english = flatten(JSON.parse(read('locales/en.default.json')));
  const arabic = flatten(JSON.parse(read('locales/ar.json')));
  for (const key of Object.keys(english)) assert.ok(key in arabic, `Missing Arabic key: ${key}`);
  const categories = new Intl.PluralRules('ar').resolvedOptions().pluralCategories;
  for (const key of Object.keys(arabic).filter((key) => !(key in english))) {
    const parts = key.split('.');
    const category = parts.pop();
    assert.ok(categories.includes(category) && `${parts.join('.')}.other` in english, `Unexpected Arabic key: ${key}`);
  }
  const variables = (text) => [...new Set([...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((match) => match[1]))]
    .filter((name) => name !== 'count').sort();
  for (const [key, value] of Object.entries(english)) {
    assert.ok(arabic[key].trim(), `${key} must not be empty`);
    // A translated singular can spell out the count instead of interpolating it.
    assert.deepEqual(variables(arabic[key]), variables(value), `${key} interpolation`);
  }
});

test('Arabic counts use singular, dual, few, many, and zero forms', async () => {
  const liquid = renderer('ar');
  const template = "{% capture label %}{{ key | t: count: count }}{% endcapture %}{% render 'digits', value: label %}";
  for (const key of ['collections.count', 'collections.showing', 'cart.item_count']) {
    for (const [count, expected] of [[0, 'مفيش قطع'], [1, 'قطعة واحدة'], [2, 'قطعتين'], [3, '٣ قطع'], [10, '١٠ قطع'], [12, '١٢ قطعة'], [100, '١٠٠ قطعة']]) {
      assert.equal((await liquid.parseAndRender(template, { key, count })).trim(), expected, `${key}: ${count}`);
    }
  }
  for (const [count, expected] of [[0, 'مفيش نتائج'], [1, 'نتيجة واحدة'], [2, 'نتيجتين'], [5, '٥ نتائج'], [25, '٢٥ نتيجة']]) {
    assert.equal((await liquid.parseAndRender(template, { key: 'search.results_count', count })).trim(), expected);
  }
});

test('count-up animations preserve Arabic and English separators throughout the animation', () => {
  for (const [locale, value, midway] of [
    ['ar', '٤٬٠٠٠', '٣٬٥٠٠'],
    ['ar', '٤٬٠٠٠٫٥٠+', '٣٬٥٠٠٫٤٤+'],
    ['ar', '٤٫٩/٥', '٤٫٣/٥'],
    ['ar', '٤,٠٠٠', '٣,٥٠٠'],
    ['en', '4,000.50+', '3,500.44+'],
  ]) {
    const { element, frames } = countUp(value, locale);
    assert.equal(frames.length, 1, value);
    frames.shift()(600);
    assert.equal(element.textContent, midway, value);
    frames.shift()(1200);
    assert.equal(element.textContent, value, value);
    assert.equal(frames.length, 0, value);
  }
});

test('reduced motion leaves localized count-up numbers unchanged', () => {
  const { element, frames } = countUp('٤٬٠٠٠', 'ar', true);
  assert.equal(element.textContent, '٤٬٠٠٠');
  assert.equal(frames.length, 0);
});

test('Arabic dates and delivery estimates use localized display digits', async () => {
  const liquid = renderer('ar');
  assert.equal((await liquid.renderFile('date-ar', { date: '2026-09-25T12:00:00Z' })).trim(), '٢٥ سبتمبر ٢٠٢٦');
  for (const [value, expected] of [['1–2 days', '١–٢ أيام'], ['24 hours', '٢٤ ساعات']]) {
    assert.equal((await liquid.renderFile('delivery-eta', { value })).trim(), expected);
    assert.equal((await renderer('en').renderFile('delivery-eta', { value })).trim(), value);
  }
});

test('pagination localizes labels without changing page query parameters', async () => {
  const pagination = {
    pages: 3,
    current_page: 2,
    previous: { url: '/ar/collections/all?page=1' },
    next: { url: '/ar/collections/all?page=3' },
    parts: [
      { title: 1, is_link: true, url: '/ar/collections/all?page=1' },
      { title: 2, is_link: false },
      { title: 3, is_link: true, url: '/ar/collections/all?page=3' },
    ],
  };
  const rendered = await renderer('ar').renderFile('localized-pagination', { pagination });
  assert.match(rendered, /href="\/ar\/collections\/all\?page=1">١<\/a>/);
  assert.match(rendered, /class="is-current">٢<\/span>/);
  assert.match(rendered, /href="\/ar\/collections\/all\?page=3">٣<\/a>/);
  assert.doesNotMatch(rendered, /href="[^"]*[٠-٩]/);
  assert.equal((await renderer('ar').renderFile('localized-pagination', { pagination: { pages: 1 } })).trim(), '');
});

for (const locale of ['ar', 'en']) {
  test(`${locale}: Liquid and JavaScript display the same digits and money`, async () => {
    const liquid = renderer(locale);
    const { L } = client(locale);
    for (const value of [0, 1, 12, 100, '01:25:09', '50%', '−2.5']) {
      const rendered = await liquid.renderFile('digits', { value });
      assert.equal(rendered.trim(), L.digits(value));
      if (locale === 'ar') assert.doesNotMatch(rendered, /[0-9]/);
      else assert.equal(rendered.trim(), String(value));
    }
    for (const amount of [0, 50, 64900, 115000, 105055]) {
      const rendered = await liquid.renderFile('money', { amount });
      assert.equal(rendered.trim(), L.money(amount));
    }
  });

  test(`${locale}: countdown tracks a configured end timestamp on initial paint and subsequent ticks`, () => {
    const deadline = Date.parse('2026-10-01T00:00:00+03:00');
    const { units, ticks, clock, setNow } = client(locale, {
      countdownEnd: '2026-10-01T00:00:00+03:00',
      now: deadline - 7_203_000,
    });
    const digits = locale === 'ar' ? /^[٠-٩]{2}$/ : /^[0-9]{2}$/;
    assert.equal(ticks.length, 1);
    assert.equal(clock.hidden, false);
    assert.deepEqual(Object.values(units).map((unit) => unit.textContent), locale === 'ar' ? ['٠٢', '٠٠', '٠٣'] : ['02', '00', '03']);
    for (const unit of Object.values(units)) assert.match(unit.textContent, digits);
    setNow(deadline - 7_202_000);
    ticks[0]();
    assert.deepEqual(Object.values(units).map((unit) => unit.textContent), locale === 'ar' ? ['٠٢', '٠٠', '٠٢'] : ['02', '00', '02']);
    for (const unit of Object.values(units)) assert.match(unit.textContent, digits);
  });

  test(`${locale}: brand fonts load even with a legacy system-font preference`, async () => {
    const rendered = await renderer(locale).renderFile('fonts', { is_rtl: locale === 'ar', system: true });
    assert.match(rendered, /thmanyahsans-Regular\.woff2/);
    assert.match(rendered, /thmanyahsans-Medium\.woff2/);
    assert.match(rendered, /thmanyahsans-Black\.woff2/);
    assert.doesNotMatch(rendered, /JetBrains|Palestine|Disney|Matcha/);
    if (locale === 'en') {
      assert.match(rendered, /froople\.otf/);
      assert.match(rendered, /mochi-tubby\.ttf/);
    } else {
      assert.doesNotMatch(rendered, /froople\.otf|mochi-tubby\.ttf/);
    }
    for (const [, asset] of rendered.matchAll(/url\("\/assets\/([^"\s]+)"\)/g)) {
      assert.ok(fs.statSync(path.join(theme, 'assets', asset)).size > 0, asset);
    }
  });

  test(`${locale}: sale percentages are rounded and match variant updates`, async () => {
    const liquid = renderer(locale);
    const { L } = client(locale);
    for (const [price, compare] of [[64900, 80000], [77900, 85000]]) {
      const rendered = await liquid.renderFile('price', { variant: { price, compare_at_price: compare } });
      const percentage = L.digits(Math.round((compare - price) * 100 / compare));
      const badge = rendered.match(/class="price__discount">([^<]+)</)?.[1];
      assert.ok(badge?.includes(`${percentage}%`), badge);
      assert.doesNotMatch(badge, /\d[.,]\d|[٠-٩][.,][٠-٩]/);
    }
  });
}

test('all storefront layouts include the same final typography rules', () => {
  for (const name of ['theme', 'password', 'gift_card']) {
    const layout = read(`layout/${name}.liquid`);
    assert.match(layout, /render 'fonts', is_rtl: is_rtl/);
    assert.doesNotMatch(layout, /settings\.type_system_fonts/);
    assert.ok(layout.indexOf("'typography.css'") > layout.indexOf("'components.css'"), name);
  }
});
