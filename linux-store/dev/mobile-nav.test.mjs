import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';
import { registerFilters } from './filters.mjs';

const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const read = (file) => fs.readFileSync(path.join(theme, file), 'utf8');

test('mobile Customize tab uses the localized route and announces its active page', () => {
  const nav = read('snippets/tab-bar.liquid');
  const icon = read('snippets/icon.liquid');
  const header = read('sections/header.liquid');

  assert.match(nav, /href="\{% render 'customize-url' %\}"/);
  assert.match(nav, /render 'icon', name: 'star'/);
  assert.match(nav, /'nav\.menu\.customize' \| t/);
  assert.match(nav, /template\.suffix == 'customize'[\s\S]*?aria-current="page"/);
  assert.match(icon, /when 'star'/);
  assert.doesNotMatch(nav, /data-drawer-open="search"/);
  assert.match(header, /data-drawer-open="search"/);
});

for (const locale of ['ar', 'en']) {
  for (const template of [{ name: 'page', suffix: 'customize' }, { name: 'index', suffix: 'customize' }, { name: 'index', suffix: '' }]) {
    test(`${locale}: mobile active tab matches ${template.name}.${template.suffix || 'default'}`, async () => {
      const rootUrl = locale === 'ar' ? '/ar' : '/';
      const engine = new Liquid({
        root: path.join(theme, 'snippets'),
        extname: '.liquid',
        globals: {
          __locale: locale,
          request: { locale: { iso_code: locale } },
          routes: { root_url: rootUrl },
          settings: {},
          cart: { item_count: 0 },
          template,
        },
      });
      registerFilters(engine, { shop: {} });
      const html = await engine.renderFile('tab-bar');
      const customize = html.match(/<a class="tab-bar__item tab-bar__item--primary[^>]*>/)?.[0];
      const home = html.match(/<a class="tab-bar__item[^>]*>/)?.[0];
      assert.ok(customize && home);
      assert.ok(customize.includes(`href="${rootUrl}?view=customize`));
      assert.equal(customize.includes('aria-current="page"'), template.suffix === 'customize');
      assert.equal(customize.includes('is-active'), template.suffix === 'customize');
      assert.equal(home.includes('aria-current="page"'), template.suffix !== 'customize');
    });
  }
}
