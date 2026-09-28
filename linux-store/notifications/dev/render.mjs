#!/usr/bin/env node
/**
 * Renders every generated template in ../templates with liquidjs and the fake data in sample-data.json,
 * stubbing Shopify-only filters, then checks each output (unrendered Liquid, alt text, RTL, Gmail's
 * ~102 KB clipping limit) and the palette's WCAG contrast.
 *   node dev/render.mjs [outDir]   default: <repo>/.hoplite/artifacts/notifications/html
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, LANGS, ROOT, SRC } from './build.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(ROOT, '../..');
// Reuse the theme dev kit's liquidjs (linux-store/dev/node_modules) instead of installing anything here.
const { Liquid } = createRequire(path.resolve(ROOT, '../dev/package.json'))('liquidjs');
const outDir = path.resolve(process.argv[2] || path.join(workspace, '.hoplite/artifacts/notifications/html'));
const sample = JSON.parse(fs.readFileSync(path.join(here, 'sample-data.json'), 'utf8'));
const logoFile = path.join(ROOT, 'assets', 'email-logo-badge.png');

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
function merge(base, extra) {
  if (extra === undefined) return structuredClone(base);
  if (!isObj(base) || !isObj(extra)) return structuredClone(extra);
  const out = structuredClone(base);
  for (const [key, value] of Object.entries(extra)) out[key] = isObj(value) && isObj(out[key]) ? merge(out[key], value) : structuredClone(value);
  return out;
}
function need(lines, key) {
  if (!lines[key]) throw new Error(`sample-data.json: unknown line "${key}"`);
  return lines[key];
}
function resolveRefs(value, lines) {
  if (Array.isArray(value)) return value.map((v) => resolveRefs(v, lines));
  if (typeof value === 'string' && value.startsWith('@line:')) return resolveRefs(need(lines, value.slice(6)), lines);
  if (value === '@logo') return pathToFileURL(logoFile).href;
  if (isObj(value)) {
    if ('$line' in value) {
      const { $line, ...rest } = value;
      return resolveRefs(merge(need(lines, $line), rest), lines);
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveRefs(v, lines)]));
  }
  return value;
}
function contextFor(scenario, lang) {
  let ctx = merge(sample.base, sample.lang?.[lang] || {});
  ctx = merge(ctx, scenario.data || {});
  ctx = merge(ctx, scenario.lang?.[lang] || {});
  return resolveRefs(ctx, sample.lines);
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (cents, format) => format.replace(/\{\{\s*amount\s*\}\}/, (Number(cents || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const IMG_SIZES = { pico: 16, icon: 32, thumb: 50, small: 100, compact: 160, medium: 240, large: 480, grande: 600 };

const engine = new Liquid({ strictFilters: true, preserveTimezones: true });
engine.registerFilter('money', (v) => money(v, sample.base.shop.money_format));
engine.registerFilter('money_with_currency', (v) => money(v, sample.base.shop.money_with_currency_format));
// Shopify's img_url accepts a line item or an image and returns a protocol-relative CDN URL.
engine.registerFilter('img_url', (input, size = 'small') => {
  const src = typeof input === 'string' ? input : input?.image?.src ?? input?.image ?? input?.src ?? '';
  if (!src || typeof src !== 'string') return '';
  const [, name, cropped] = /^([a-z]+)(_cropped)?$/.exec(size) || [];
  const url = new URL(src.startsWith('//') ? `https:${src}` : src);
  if (IMG_SIZES[name]) {
    url.searchParams.set('width', IMG_SIZES[name]);
    url.searchParams.set('height', IMG_SIZES[name]);
    if (cropped) url.searchParams.set('crop', 'center');
  }
  return `//${url.host}${url.pathname}${url.search}`;
});
engine.registerFilter('format_address', (a) => {
  if (!a) return '';
  const lines = [[a.first_name, a.last_name].filter(Boolean).join(' '), a.company, a.address1, a.address2, [a.city, a.province, a.zip].filter(Boolean).join(' '), a.country];
  return `<p>${lines.filter(Boolean).map(escapeHtml).join('<br>')}</p>`;
});

function luminance(hex) {
  const [r, g, b] = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

async function main() {
  const failures = [];
  const built = build();
  const stale = built.filter((b) => !fs.existsSync(b.file) || fs.readFileSync(b.file, 'utf8') !== b.body);
  if (stale.length) failures.push(`stale templates, run node dev/build.mjs: ${stale.map((b) => `${b.lang}/${b.name}`).join(', ')}`);
  for (const b of built) if (/\{%-?\s*(include|render|section|layout)\b/.test(b.body)) failures.push(`${b.lang}/${b.name}: not self-contained`);

  const rows = [];
  for (const lang of LANGS) {
    fs.mkdirSync(path.join(outDir, lang), { recursive: true });
    for (const scenario of sample.scenarios) {
      const source = fs.readFileSync(path.join(ROOT, 'templates', lang, `${scenario.template}.liquid`), 'utf8');
      const html = await engine.parseAndRender(source, contextFor(scenario, lang));
      const bytes = Buffer.byteLength(html);
      const id = `${lang}/${scenario.id}`;
      const problems = [];
      if (/\{\{|\{%|\[\[/.test(html)) problems.push('unrendered Liquid or placeholder');
      if (/Liquid error|undefined|NaN|\[object Object\]/.test(html)) problems.push('bad value in output');
      if (/<img(?![^>]*\balt=)[^>]*>/i.test(html)) problems.push('img without alt');
      if (!html.trimStart().startsWith('<!DOCTYPE html>')) problems.push('output does not start with the doctype');
      if (lang === 'ar' && !/<html lang="ar" dir="rtl"/.test(html)) problems.push('missing lang/dir on <html>');
      if (bytes > 102 * 1024) problems.push(`over Gmail's ~102 KB clip limit (${bytes} B)`);
      failures.push(...problems.map((p) => `${id}: ${p}`));
      fs.writeFileSync(path.join(outDir, lang, `${scenario.id}.html`), html);
      rows.push({ id, bytes, images: (html.match(/<img\b/g) || []).length, links: (html.match(/<a\b/g) || []).length, ok: problems.length === 0 });
    }
  }

  const index = LANGS.map((lang) => `<h2>${lang}</h2><ul>${sample.scenarios.map((s) => `<li><a href="${lang}/${s.id}.html">${s.id}</a></li>`).join('')}</ul>`).join('');
  fs.writeFileSync(path.join(outDir, 'index.html'), `<!DOCTYPE html><meta charset="utf-8"><title>LINUX notification previews</title>${index}`);

  const { c } = JSON.parse(fs.readFileSync(path.join(SRC, 'tokens.json'), 'utf8'));
  const pairs = [
    ['cream', 'card_hi'], ['text', 'card_hi'], ['muted', 'card_hi'], ['lime', 'chip'], ['ink', 'lime'],
    ['cream', 'card'], ['muted', 'card'], ['muted2', 'card'], ['lime', 'card'],
    ['cream', 'panel'], ['text', 'panel'], ['muted', 'panel'], ['lime', 'panel'],
    ['cream', 'page'], ['muted2', 'page'], ['lime', 'page'],
  ];
  const contrastRows = pairs.map(([fg, bg]) => ({ pair: `${fg} on ${bg}`, ratio: contrast(c[fg], c[bg]) }));
  for (const r of contrastRows) if (r.ratio < 4.5) failures.push(`contrast ${r.pair} is ${r.ratio.toFixed(2)}:1 (< 4.5)`);

  console.log(rows.map((r) => `${r.ok ? 'ok  ' : 'FAIL'} ${r.id.padEnd(40)} ${String(r.bytes).padStart(6)} B  ${r.images} img  ${r.links} links`).join('\n'));
  console.log(`\ncontrast (WCAG AA needs 4.5:1): ${contrastRows.map((r) => `${r.pair} ${r.ratio.toFixed(1)}`).join(' · ')}`);
  console.log(`\npreviews: ${path.relative(process.cwd(), outDir) || outDir}/index.html`);
  if (failures.length) {
    console.error(`\n${failures.length} problem(s):\n${failures.map((f) => `  - ${f}`).join('\n')}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
