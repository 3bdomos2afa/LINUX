import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
const widths = (process.env.VIEWPORTS || '320,375,390,430,1024,1440').split(',').map(Number);
const routes = ['/', '/?view=customize', '/pages/customize', '/products/hoodie-anime-black', '/collections/all', '/cart'];
const typography = fs.readFileSync(path.join(here, 'verify-typography.js'), 'utf8');
const results = [];

function browser(...args) {
  let out;
  try { out = execFileSync('agent-browser', ['--json', ...args], { encoding: 'utf8', timeout: 45000 }); }
  catch (error) {
    const failure = error.stdout && JSON.parse(error.stdout);
    throw new Error(failure?.error || error.stderr || error.message);
  }
  const result = JSON.parse(out);
  if (!result.success) throw new Error(result.error || out);
  return result.data;
}

for (const locale of ['ar', 'en']) {
  for (const width of widths) {
    browser('set', 'viewport', String(width), width >= 1024 ? '1000' : '844');
    for (const route of routes) {
      const url = `${base}${locale === 'ar' ? '/ar' : ''}${route}`;
      try {
        browser('errors', '--clear');
        browser('open', url);
        browser('wait', '700');
        const data = browser('eval', typography).result;
        const errorData = browser('errors');
        const errors = errorData.errors || [];
        if (errors.length) throw new Error(JSON.stringify(errors));
        if (!data.passed) throw new Error('Typography assertion did not complete');
        results.push({ ...data, browserErrors: errors.length });
        console.log(`PASS ${locale} ${width}px ${route}`);
      } catch (error) {
        results.push({ locale, viewport: width, path: route, passed: false, error: String(error.message) });
        console.error(`FAIL ${locale} ${width}px ${route}: ${error.message}`);
      }
    }
  }
}

const output = path.join(root, '.hoplite/artifacts/responsive-verification.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ recordedAt: new Date().toISOString(), results }, null, 2));
const failed = results.filter((result) => !result.passed);
console.log(`${results.length - failed.length}/${results.length} responsive checks passed. Evidence: ${output}`);
if (failed.length) process.exitCode = 1;
