import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const read = (file) => fs.readFileSync(path.join(theme, file), 'utf8');
const globalSource = read('assets/global.js');

function runCountdown({ locale = 'en', end, now }) {
  let currentTime = now;
  const units = Object.fromEntries(['hours', 'minutes', 'seconds'].map((name) => [name, { textContent: '--' }]));
  const children = [];
  const active = {
    removed: false,
    querySelector(selector) {
      const name = selector.match(/data-cd="(hours|minutes|seconds)"/)?.[1];
      return name ? units[name] : null;
    },
    remove() {
      this.removed = true;
      const index = children.indexOf(this);
      if (index >= 0) children.splice(index, 1);
    },
  };
  const expired = {
    textContent: locale === 'ar' ? 'انتهى هذا العرض.' : 'This offer has ended.',
    removed: false,
    remove() {
      this.removed = true;
      const index = children.indexOf(this);
      if (index >= 0) children.splice(index, 1);
    },
  };
  children.push(active, expired);
  const container = {
    dataset: { countdownEnd: end },
    hidden: true,
    querySelector(selector) {
      if (selector === '[data-countdown-active]') return active;
      if (selector === '[data-countdown-expired]') return expired;
      return null;
    },
    appendChild(node) {
      if (!children.includes(node)) children.push(node);
      node.removed = false;
      return node;
    },
  };
  let tick;
  const document = {
    documentElement: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
    querySelectorAll: (selector) => selector === '[data-countdown]' ? [container] : [],
    addEventListener() {},
  };
  class FixedDate extends Date {
    static now() { return currentTime; }
  }
  const window = { LINUX: { settings: { locale } } };
  vm.runInNewContext(globalSource, {
    window,
    document,
    Date: FixedDate,
    console,
    setInterval(callback, delay) {
      assert.equal(delay, 1000);
      tick = callback;
      return 1;
    },
  });
  return {
    active,
    children,
    container,
    expired,
    units,
    setNow(value) { currentTime = value; },
    tick() { tick?.(); },
  };
}

const unitValues = (units) => ['hours', 'minutes', 'seconds'].map((name) => units[name].textContent);

test('hero countdown uses one configured timestamp across ticks and page refreshes in Arabic', () => {
  const end = '2026-10-01T00:00:00+03:00';
  const deadline = Date.parse(end);
  const clock = runCountdown({ locale: 'ar', end, now: deadline - 7_203_000 });

  assert.equal(clock.container.hidden, false);
  assert.deepEqual(unitValues(clock.units), ['٠٢', '٠٠', '٠٣']);
  clock.setNow(deadline - 7_202_000);
  clock.tick();
  assert.deepEqual(unitValues(clock.units), ['٠٢', '٠٠', '٠٢']);

  const refreshed = runCountdown({ locale: 'ar', end, now: deadline - 7_201_000 });
  assert.deepEqual(unitValues(refreshed.units), ['٠٢', '٠٠', '٠١']);
});

test('expired campaign shows its status once and never starts another countdown', () => {
  const end = '2026-10-01T00:00:00Z';
  const clock = runCountdown({ locale: 'en', end, now: Date.parse(end) });

  assert.equal(clock.container.hidden, false);
  assert.equal(clock.active.removed, true);
  assert.equal(clock.expired.removed, false);
  assert.ok(clock.children.includes(clock.expired));
  clock.tick();
  assert.equal(clock.expired.removed, false);
  assert.deepEqual(unitValues(clock.units), ['--', '--', '--']);
});

test('missing or invalid end timestamps stay hidden instead of inventing a deadline', () => {
  for (const end of ['', '2026-10-01T00:00:00', '2026-02-30T00:00:00Z']) {
    const clock = runCountdown({ end, now: Date.parse('2026-09-25T00:00:00Z') });
    assert.equal(clock.container.hidden, true, end || 'blank');
    assert.equal(clock.active.removed, false, end || 'blank');
  }
});

test('theme editor exposes a blank-by-default ISO timestamp, not a rolling duration', () => {
  const section = read('sections/hero-embroidery.liquid');
  const match = section.match(/{% schema %}([\s\S]*?){% endschema %}/);
  assert.ok(match, 'hero section schema is present');
  const schema = JSON.parse(match[1]);
  const timestamp = schema.settings.find((setting) => setting.id === 'countdown_end_at');
  assert.equal(timestamp?.type, 'text');
  assert.equal('default' in timestamp, false);
  assert.doesNotMatch(section, /countdown_hours|Countdown length/);
  assert.match(read('snippets/hero-panel.liquid'), /if cd_end_at != blank/);
  assert.match(read('snippets/hero-panel.liquid'), /data-countdown-end="\{\{ cd_end_at \| escape \}\}"/);
  assert.doesNotMatch(globalSource, /localStorage|nextMidnight|countdownHours/);
  const homepage = JSON.parse(read('templates/index.json'));
  assert.equal('end_at' in homepage.sections.hero.settings, false, 'do not invent a campaign date in the shipped homepage');
});
