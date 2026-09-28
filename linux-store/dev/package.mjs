// Builds the deliverables in ../dist:
//   linux-liquid-glass-theme.zip   ← upload this in Shopify (theme folders at zip root)
//   LINUX-theme-delivery.zip       ← everything: the theme zip + install guide (AR/EN)
//                                    + hero video masters + brand assets used
// Runs theme-check first and aborts on errors.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { check, Severity } from '@shopify/theme-check-node';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const themeRoot = path.join(root, 'theme');
const dist = path.join(root, 'dist');
const name = process.argv[2] || 'linux-liquid-glass-theme';

const offenses = await check(themeRoot);
const errors = offenses.filter((o) => o.severity === Severity.ERROR);
if (errors.length) {
  console.error(`theme-check: ${errors.length} error(s) — fix them before packaging (node check.mjs)`);
  process.exit(1);
}

// Do not label a release import-checked when the required runtime is missing.
try {
  execFileSync('ruby', [path.join(root, 'dev', 'shopify-lint.rb')], { stdio: 'inherit' });
} catch {
  console.error('Shopify import validation failed. Use the declared Ruby runtime and install liquid 5.8.7, then resolve all findings before packaging.');
  process.exit(1);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// 1) Shopify theme zip
const themeZip = path.join(dist, `${name}.zip`);
execFileSync('zip', ['-qr', '-X', themeZip, 'assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates', '-x', '*.DS_Store'], { cwd: themeRoot, stdio: 'inherit' });
const size = fs.statSync(themeZip).size;
const count = execFileSync('unzip', ['-Z1', themeZip]).toString().trim().split('\n').length;
console.log(`${path.relative(process.cwd(), themeZip)} — ${count} files, ${(size / 1024 / 1024).toFixed(1)} MB`);
if (size > 50 * 1024 * 1024) { console.error('Shopify rejects theme zips over 50 MB'); process.exit(1); }

// 2) Delivery bundle
const stage = path.join(dist, 'LINUX-theme-delivery');
fs.mkdirSync(path.join(stage, 'hero-video'), { recursive: true });
fs.mkdirSync(path.join(stage, 'brand-assets'), { recursive: true });
fs.copyFileSync(themeZip, path.join(stage, `${name}.zip`));
fs.copyFileSync(path.join(root, 'INSTALL.md'), path.join(stage, 'INSTALL.md'));
fs.copyFileSync(path.join(root, 'ADMIN-GUIDE.md'), path.join(stage, 'ADMIN-GUIDE.md'));
fs.copyFileSync(path.join(root, 'CHECKOUT-BRANDING.md'), path.join(stage, 'CHECKOUT-BRANDING.md'));
fs.copyFileSync(path.join(root, 'CHANGELOG.md'), path.join(stage, 'CHANGELOG.md'));
for (const f of ['hero-1080.mp4', 'hero-720.mp4', 'hero-mobile.mp4', 'hero-embroidery-poster.webp', 'hero-embroidery-poster-v2.webp']) fs.copyFileSync(path.join(themeRoot, 'assets', f), path.join(stage, 'hero-video', f));
for (const f of fs.readdirSync(path.join(themeRoot, 'assets')).filter((f) => /^(mascot-|brand-|favicon-|wordmark)/.test(f))) fs.copyFileSync(path.join(themeRoot, 'assets', f), path.join(stage, 'brand-assets', f));
// 3) Optional kits: Shopify email notification templates and the social ad kit
const copyTree = (src, dst, keep = () => true, rel = '') => {
  for (const entry of fs.readdirSync(path.join(src, rel), { withFileTypes: true })) {
    const child = path.join(rel, entry.name);
    if (!keep(child, entry)) continue;
    if (entry.isDirectory()) copyTree(src, dst, keep, child);
    else { fs.mkdirSync(path.dirname(path.join(dst, child)), { recursive: true }); fs.copyFileSync(path.join(src, child), path.join(dst, child)); }
  }
};
const notifications = path.join(root, 'notifications');
if (fs.existsSync(notifications)) copyTree(notifications, path.join(stage, 'email-notifications'), (child) => !/^(dev|node_modules)(\/|$)/.test(child) && !child.endsWith('.DS_Store'));
const marketing = path.join(root, 'marketing');
if (fs.existsSync(path.join(marketing, 'out'))) {
  copyTree(path.join(marketing, 'out'), path.join(stage, 'ad-kit'), (child) => /\.(jpe?g|mp4)$/i.test(child));
  for (const f of ['README.md', 'copy.json']) if (fs.existsSync(path.join(marketing, f))) fs.copyFileSync(path.join(marketing, f), path.join(stage, 'ad-kit', f));
}
const licences = path.join(root, 'licenses');
if (fs.existsSync(licences)) copyTree(licences, path.join(stage, 'licenses'), (child) => !child.endsWith('.DS_Store'));
const bundle = path.join(dist, 'LINUX-theme-delivery.zip');
execFileSync('zip', ['-qr', '-X', bundle, 'LINUX-theme-delivery'], { cwd: dist, stdio: 'inherit' });
fs.rmSync(stage, { recursive: true, force: true });
console.log(`${path.relative(process.cwd(), bundle)} — ${(fs.statSync(bundle).size / 1024 / 1024).toFixed(1)} MB`);

// 4) Studio product photos — upload per product in Shopify (not part of the theme)
const photos = path.join(root, 'photos');
if (fs.existsSync(path.join(photos, 'manifest.json'))) {
  const photoZip = path.join(dist, 'LINUX-product-photos.zip');
  execFileSync('zip', ['-qr', '-X', photoZip, 'photos', '-x', '*.DS_Store', 'photos/_*'], { cwd: root, stdio: 'inherit' });
  console.log(`${path.relative(process.cwd(), photoZip)} — ${(fs.statSync(photoZip).size / 1024 / 1024).toFixed(1)} MB`);
}
