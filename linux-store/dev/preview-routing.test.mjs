import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildStore } from './store.mjs';

const data = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');

for (const locale of ['ar', 'en']) {
  test(`${locale}: preview resolves the installed Customize and wishlist alternate templates`, () => {
    const store = buildStore(data);
    for (const [routePath, view, name] of [['/', 'customize', 'index'], ['/search', 'wishlist', 'search']]) {
      const query = { view };
      const env = store.environment({ locale, path: routePath, query, cookies: {} });
      const route = store.route(routePath, query, env);
      assert.equal(route.template, `${name}.${view}`);
      assert.equal(route.env.template.name, name);
      assert.equal(route.env.template.suffix, view);
      assert.equal(route.env.request.page_type, name);
      assert.equal(route.env.request.locale.iso_code, locale);
    }
  });
}

test('invalid or missing alternate templates preserve the original route template', () => {
  const store = buildStore(data);
  for (const query of [{}, { view: 'not-installed' }, { view: '../../config/settings_data' }, { view: '/customize' }]) {
    for (const [routePath, expected] of [['/', 'index'], ['/pages/customize', 'page.customize']]) {
      const env = store.environment({ locale: 'en', path: routePath, query, cookies: {} });
      assert.equal(store.route(routePath, query, env).template, expected);
    }
  }
});
