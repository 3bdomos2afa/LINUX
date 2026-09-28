#!/usr/bin/env node
/**
 * Exports PNG versions of theme/assets/wordmark.svg for Settings → Notifications → Customize email
 * templates (email clients do not render SVG reliably). Opens each page with the agent-browser CLI,
 * then captures it over the DevTools protocol with a transparent background at 2× scale.
 *   node dev/export-logo.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT } from './build.mjs';

const SESSION = ['--session', 'notif'];
const ab = (...args) => execFileSync('agent-browser', [...SESSION, ...args], { encoding: 'utf8' }).trim();

const svg = fs.readFileSync(path.resolve(ROOT, '../theme/assets/wordmark.svg'), 'utf8').replace(/<title>[\s\S]*?<\/title>/, '');
const page = (css, inner) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}${css}</style></head><body>${inner}</body></html>`;
// Badge: cream wordmark on a forest pill, readable on Shopify's white default emails and on these dark ones.
const variants = [
  {
    file: 'email-logo-badge.png', width: 300, height: 88,
    html: page('.b{box-sizing:border-box;width:300px;height:88px;border-radius:44px;background:linear-gradient(180deg,#0f3d2a 0%,#043020 62%);border:1.5px solid #284c3c;border-top-color:#5b7a66;box-shadow:inset 0 1px 0 rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center}.b svg{display:block;width:172px;height:auto}', `<div class="b">${svg}</div>`),
  },
  {
    file: 'email-logo-cream.png', width: 300, height: 80,
    html: page('.p{width:300px;height:80px;display:flex;align-items:center;justify-content:center}.p svg{display:block;width:280px;height:auto}', `<div class="p">${svg}</div>`),
  },
];

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (!pending.has(msg.id)) return;
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    id += 1;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  return new Promise((resolve, reject) => {
    ws.onopen = () => resolve({ send, close: () => ws.close() });
    ws.onerror = () => reject(new Error(`cannot connect to ${wsUrl}`));
  });
}

const outDir = path.join(ROOT, 'assets');
fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'linux-logo-'));
for (const v of variants) {
  const htmlFile = path.join(tmp, `${v.file}.html`);
  fs.writeFileSync(htmlFile, v.html);
  const url = pathToFileURL(htmlFile).href;
  ab('open', url);
  const client = await cdp(ab('get', 'cdp-url'));
  const { targetInfos } = await client.send('Target.getTargets');
  const target = targetInfos.find((t) => t.type === 'page' && t.url === url);
  if (!target) throw new Error(`page ${url} not found`);
  const { sessionId } = await client.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  await client.send('Emulation.setDeviceMetricsOverride', { width: v.width, height: v.height, deviceScaleFactor: 2, mobile: false }, sessionId);
  await client.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }, sessionId);
  const { data } = await client.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: v.width, height: v.height, scale: 1 } }, sessionId);
  await client.send('Emulation.setDefaultBackgroundColorOverride', {}, sessionId);
  await client.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
  client.close();
  fs.writeFileSync(path.join(outDir, v.file), Buffer.from(data, 'base64'));
  console.log(`assets/${v.file} (${v.width * 2}×${v.height * 2})`);
}
fs.rmSync(tmp, { recursive: true, force: true });
