#!/usr/bin/env node
/**
 * LINUX social ad kit renderer: templates/*.html × copy.json → out/*.png + out/story-offer-*.mp4
 *
 *   node linux-store/marketing/render.mjs                all creatives, Arabic + English, stills + videos
 *   node linux-store/marketing/render.mjs --lang ar      one locale (ar | en | ar,en)
 *   node linux-store/marketing/render.mjs --only story-code,feed-drop
 *   node linux-store/marketing/render.mjs --no-video     PNGs only
 *   node linux-store/marketing/render.mjs --video-only   story videos only
 *
 * Needs the agent-browser CLI (browser session "ads"; override with ADS_SESSION) and ffmpeg/ffprobe
 * built with libx264. Fonts are read from ../theme/assets and are never copied into marketing/.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(HERE, 'templates');
const OUT = path.join(HERE, 'out');
const THEME_ASSETS = path.resolve(HERE, '../theme/assets');
const SESSION = process.env.ADS_SESSION || 'ads';
const FONTS = ['thmanyahsans-Regular.woff2', 'thmanyahsans-Medium.woff2', 'thmanyahsans-Black.woff2', 'froople.otf', 'mochi-tubby.ttf'];
// Instagram/TikTok/Facebook story UI covers roughly the top 250px and bottom 340px of a 1920px frame.
const STORY_SAFE = { top: 250, bottom: 340 };
const VIDEO_MAX_BYTES = 3_000_000;

const STILLS = [
  { id: 'feed-drop', creative: 'feed_drop', w: 1080, h: 1350 },
  { id: 'feed-studio', creative: 'feed_studio', w: 1080, h: 1350 },
  { id: 'story-code', creative: 'story_code', w: 1080, h: 1920, safe: STORY_SAFE },
  { id: 'story-delivery', creative: 'story_delivery', w: 1080, h: 1920, safe: STORY_SAFE },
  { id: 'carousel-cover', creative: 'carousel_cover', w: 1080, h: 1080 },
];

// Overlay layers in stacking order: fade in at `at` over `dur` seconds while rising `rise` px.
// `frost` layers also get a blurred copy of the footage behind their glass shapes.
const VIDEO = {
  id: 'story-offer',
  template: 'video-overlay',
  creative: 'video_offer',
  w: 1080,
  h: 1920,
  safe: STORY_SAFE,
  seconds: 9,
  fps: 24,
  zoom: 0.035,
  layers: [
    { name: 'scrim', at: 0, dur: 0.4, rise: 0 },
    { name: 'top', at: 0.3, dur: 0.6, rise: 36, frost: true },
    { name: 'panel', at: 0.85, dur: 0.8, rise: 120, frost: true },
    { name: 'chip', at: 1.9, dur: 0.6, rise: 40, frost: true },
    { name: 'cta', at: 2.4, dur: 0.6, rise: 56 },
  ],
};

const USAGE = `Usage: node linux-store/marketing/render.mjs [--lang ar,en] [--only ${[...STILLS.map((s) => s.id), VIDEO.id].join(',')}] [--no-video | --video-only] [--keep]`;

function parseArgs(argv) {
  const opts = { langs: ['ar', 'en'], only: null, stills: true, video: true, keep: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = () => {
      const v = argv[(i += 1)];
      if (!v) throw new Error(`${flag} needs a value\n${USAGE}`);
      return v.split(',').map((s) => s.trim()).filter(Boolean);
    };
    if (flag === '--lang') opts.langs = value();
    else if (flag === '--only') opts.only = value();
    else if (flag === '--no-video') opts.video = false;
    else if (flag === '--video-only') opts.stills = false;
    else if (flag === '--keep') opts.keep = true;
    else if (flag === '-h' || flag === '--help') opts.help = true;
    else throw new Error(`Unknown option ${flag}\n${USAGE}`);
  }
  return opts;
}

function run(cmd, args, { input, encoding } = {}) {
  const res = spawnSync(cmd, args, { input, encoding, maxBuffer: 512 * 1024 * 1024 });
  if (res.error) throw new Error(`${cmd}: ${res.error.message}`);
  if (res.status !== 0) {
    const detail = `${res.stderr || ''}`.trim() || `${res.stdout || ''}`.trim();
    throw new Error(`${cmd} ${args.slice(0, 3).join(' ')} … exited with ${res.status}\n${detail.slice(-2000)}`);
  }
  return res.stdout;
}

const browser = (...args) => run('agent-browser', ['--session', SESSION, ...args], { encoding: 'utf8' });

function browserEval(js) {
  const lines = run('agent-browser', ['--session', SESSION, '--json', 'eval', js], { encoding: 'utf8' }).trim().split('\n');
  const msg = JSON.parse(lines[lines.length - 1]);
  if (!msg.success) throw new Error(`agent-browser eval failed: ${JSON.stringify(msg.error)}`);
  return msg.data.result;
}

const READY_JS = `new Promise((resolve) => {
  const t0 = Date.now();
  (function poll() {
    if (window.__kitReady) resolve({ ready: true, href: location.href });
    else if (Date.now() - t0 > 20000) resolve({ ready: false, href: location.href });
    else setTimeout(poll, 50);
  })();
})`;
const FONTS_JS = 'document.fonts.ready.then(() => [...document.fonts].filter((f) => f.status !== "loaded").map((f) => `${f.family} ${f.weight}`))';

let COPY;
let TMP;

function buildPage(template, data) {
  const src = path.join(TEMPLATES, `${template}.html`);
  const html = fs.readFileSync(src, 'utf8');
  if (!html.includes('<!-- kit:inject -->')) throw new Error(`${path.relative(process.cwd(), src)} is missing the <!-- kit:inject --> marker`);
  const payload = JSON.stringify(data).replace(/</g, '\\u003c');
  const base = pathToFileURL(TEMPLATES + path.sep).href;
  const file = path.join(TMP, `${template}.${data.lang}.${data.layer || 'all'}.${data.matte || 'full'}.html`);
  fs.writeFileSync(file, html.replace('<!-- kit:inject -->', `<base href="${base}">\n<script id="kit-data" type="application/json">${payload}</script>`));
  return file;
}

function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  const head = Buffer.alloc(24);
  fs.readSync(fd, head, 0, 24, 0);
  fs.closeSync(fd);
  if (head.toString('ascii', 1, 4) !== 'PNG') throw new Error(`${file} is not a PNG`);
  return { w: head.readUInt32BE(16), h: head.readUInt32BE(20) };
}

/** Renders one template state to a PNG and returns the page's QA findings. */
function capture({ template, creative, lang, w, h, safe = null, layer = null, matte = null, out }) {
  const file = buildPage(template, { lang, creative, copy: COPY, safe, layer, matte });
  const url = pathToFileURL(file).href;
  browser('set', 'viewport', String(w), String(h));
  browser('open', url);
  const state = browserEval(READY_JS);
  if (state.href !== url) throw new Error(`browser session "${SESSION}" shows ${state.href}, expected ${url}`);
  if (!state.ready) throw new Error(`${template} (${lang}) did not finish loading`);
  const missingFonts = browserEval(FONTS_JS);
  if (missingFonts.length) throw new Error(`fonts failed to load (${missingFonts.join(', ')}); they are read from ${THEME_ASSETS}`);
  const issues = browserEval('window.__kitAudit()');
  browser('screenshot', out);
  const size = pngSize(out);
  if (size.w !== w || size.h !== h) throw new Error(`${path.basename(out)} is ${size.w}×${size.h}, expected ${w}×${h}`);
  return issues;
}

function rawRgb(file, w, h) {
  const buf = run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1']);
  if (buf.length !== w * h * 3) throw new Error(`unexpected pixel count in ${file}`);
  return buf;
}

/** Recovers colour + alpha from the same layer rendered on black and on white (difference matting). */
function matte(onBlack, onWhite, out, w, h) {
  const b = rawRgb(onBlack, w, h);
  const wt = rawRgb(onWhite, w, h);
  const px = Buffer.alloc(w * h * 4);
  for (let i = 0, j = 0; i < b.length; i += 3, j += 4) {
    const a = 255 - (wt[i] - b[i] + wt[i + 1] - b[i + 1] + wt[i + 2] - b[i + 2]) / 3;
    const alpha = a <= 0 ? 0 : a >= 255 ? 255 : Math.round(a);
    if (alpha) {
      const k = 255 / alpha;
      px[j] = Math.min(255, Math.round(b[i] * k));
      px[j + 1] = Math.min(255, Math.round(b[i + 1] * k));
      px[j + 2] = Math.min(255, Math.round(b[i + 2] * k));
    }
    px[j + 3] = alpha;
  }
  run('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${h}`, '-i', 'pipe:0', out], { input: px });
}

function probe(file) {
  const info = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate:format=duration,size', '-of', 'json', file], { encoding: 'utf8' }));
  const v = info.streams.find((s) => s.codec_type === 'video');
  const a = info.streams.find((s) => s.codec_type === 'audio');
  return { v, a, duration: Number(info.format.duration), size: Number(info.format.size) };
}

function renderVideo(lang, problems) {
  const { w, h, seconds, fps, safe, template, creative } = VIDEO;
  const background = path.resolve(HERE, COPY.shared.images.video_background);
  if (!fs.existsSync(background)) throw new Error(`video background not found: ${background}`);

  const layers = VIDEO.layers.map((layer) => {
    const base = path.join(TMP, `${lang}-${layer.name}`);
    const shot = (matteMode, out) => capture({ template, creative, lang, w, h, safe, layer: layer.name, matte: matteMode, out });
    const issues = shot('black', `${base}-black.png`);
    shot('white', `${base}-white.png`);
    matte(`${base}-black.png`, `${base}-white.png`, `${base}.png`, w, h);
    issues.forEach((issue) => problems.push(`${VIDEO.id}-${lang} [${layer.name}]: ${issue}`));
    if (layer.frost) shot('mask', `${base}-mask.png`);
    return { ...layer, png: `${base}.png`, mask: layer.frost ? `${base}-mask.png` : null };
  });

  const inputs = ['-i', background];
  let count = 1;
  const addStill = (file) => {
    inputs.push('-loop', '1', '-framerate', String(fps), '-t', String(seconds), '-i', file);
    count += 1;
    return count - 1;
  };
  const frames = Math.round(seconds * fps);
  const z = `(${VIDEO.zoom}*in/${frames - 1})`;
  const frosted = layers.filter((l) => l.mask);
  const graph = [
    // Upscale the 540×960 phone footage and push in slowly; perspective resamples sub-pixel, so no zoompan jitter.
    `[0:v]fps=${fps},scale=${w}:${h}:flags=lanczos,setsar=1,perspective=x0='W*${z}':y0='H*${z}':x1='W*(1-${z})':y1='H*${z}':x2='W*${z}':y2='H*(1-${z})':x3='W*(1-${z})':y3='H*(1-${z})':interpolation=cubic:eval=frame,split=2[base][soft]`,
  ];
  if (frosted.length) {
    // Blur at half resolution (the footage is 540×960 anyway), boost saturation and dim a touch like smoke glass.
    graph.push(`[soft]scale=${w / 2}:${h / 2},gblur=sigma=12,eq=saturation=1.35:brightness=-0.05,scale=${w}:${h}:flags=bicubic,split=${frosted.length}${frosted.map((_, i) => `[soft${i}]`).join('')}`);
  } else {
    graph.push('[soft]nullsink');
  }
  let current = 'base';
  let step = 0;
  let frostIndex = 0;
  const stack = (label, y) => {
    step += 1;
    graph.push(`[${current}][${label}]overlay=x=0:y=${y}[v${step}]`);
    current = `v${step}`;
  };
  for (const layer of layers) {
    const fade = `fade=t=in:st=${layer.at}:d=${layer.dur}:alpha=1`;
    const y = layer.rise ? `'${layer.rise}*pow(1-clip((t-${layer.at})/${layer.dur},0,1),3)'` : '0';
    if (layer.mask) {
      const m = addStill(layer.mask);
      graph.push(`[${m}:v]format=gray[mask${frostIndex}]`, `[soft${frostIndex}][mask${frostIndex}]alphamerge,${fade}[frost${frostIndex}]`);
      stack(`frost${frostIndex}`, y);
      frostIndex += 1;
    }
    const o = addStill(layer.png);
    graph.push(`[${o}:v]format=rgba,${fade}[layer${o}]`);
    stack(`layer${o}`, y);
  }
  graph.push(`[${current}]format=yuv420p[vout]`);
  inputs.push('-f', 'lavfi', '-t', String(seconds), '-i', 'anullsrc=r=48000:cl=stereo');
  const audio = count;

  const out = path.join(OUT, `${VIDEO.id}-${lang}.mp4`);
  for (const crf of [23, 26, 29, 32]) {
    run('ffmpeg', [
      '-v', 'error', '-y', ...inputs,
      '-filter_complex', graph.join(';'),
      '-map', '[vout]', '-map', `${audio}:a`,
      '-t', String(seconds), '-r', String(fps),
      '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-level:v', '4.1', '-pix_fmt', 'yuv420p',
      '-crf', String(crf), '-maxrate', '2600k', '-bufsize', '5200k', '-g', String(fps * 2),
      '-c:a', 'aac', '-b:a', '48k', '-shortest', '-movflags', '+faststart', out,
    ]);
    if (fs.statSync(out).size <= VIDEO_MAX_BYTES) break;
  }
  const info = probe(out);
  if (info.v.width !== w || info.v.height !== h || info.v.pix_fmt !== 'yuv420p' || info.v.codec_name !== 'h264') {
    throw new Error(`${path.basename(out)} came out as ${info.v.codec_name} ${info.v.width}×${info.v.height} ${info.v.pix_fmt}`);
  }
  if (info.size > VIDEO_MAX_BYTES) problems.push(`${path.basename(out)} is ${(info.size / 1e6).toFixed(2)} MB (target ≤ 3 MB)`);

  // Static cover frame for the post picker / previews: the same overlay on a still, with real backdrop blur.
  const cover = path.join(OUT, `${VIDEO.id}-${lang}-cover.png`);
  capture({ template, creative, lang, w, h, safe, out: cover }).forEach((issue) => problems.push(`${path.basename(cover)}: ${issue}`));
  return [out, cover, info];
}

function preflight() {
  for (const [cmd, flag] of [['agent-browser', '--version'], ['ffmpeg', '-version'], ['ffprobe', '-version']]) {
    const res = spawnSync(cmd, [flag], { encoding: 'utf8' });
    if (res.error || res.status !== 0) throw new Error(`${cmd} is required but was not found on PATH`);
    if (cmd === 'ffmpeg' && !res.stdout.includes('--enable-libx264')) throw new Error('ffmpeg must be built with libx264');
  }
  const missing = FONTS.filter((f) => !fs.existsSync(path.join(THEME_ASSETS, f)));
  if (missing.length) throw new Error(`fonts missing from ${THEME_ASSETS}: ${missing.join(', ')}`);
  const images = Object.values(COPY.shared.images).flat();
  const absent = images.filter((p) => !/^(?:[a-z]+:|\/)/i.test(p) && !fs.existsSync(path.resolve(HERE, p)));
  if (absent.length) throw new Error(`images listed in copy.json were not found: ${absent.join(', ')}`);
}

const human = (bytes) => (bytes >= 1e6 ? `${(bytes / 1e6).toFixed(2)} MB` : `${Math.round(bytes / 1e3)} KB`);
const rel = (file) => path.relative(process.cwd(), file) || file;

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(USAGE);
    return;
  }
  COPY = JSON.parse(fs.readFileSync(path.join(HERE, 'copy.json'), 'utf8'));
  for (const lang of opts.langs) if (!COPY[lang]) throw new Error(`copy.json has no "${lang}" section`);
  preflight();
  fs.mkdirSync(OUT, { recursive: true });
  TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'linux-ads-'));
  const problems = [];
  const wanted = (id) => !opts.only || opts.only.includes(id);
  try {
    if (opts.stills) {
      for (const still of STILLS.filter((s) => wanted(s.id))) {
        for (const lang of opts.langs) {
          const out = path.join(OUT, `${still.id}-${lang}.png`);
          const issues = capture({ template: still.id, ...still, lang, out });
          issues.forEach((issue) => problems.push(`${still.id}-${lang}: ${issue}`));
          console.log(`✓ ${rel(out)}  ${still.w}×${still.h}  ${human(fs.statSync(out).size)}${issues.length ? `  ⚠ ${issues.length} issue(s)` : ''}`);
        }
      }
    }
    if (opts.video && wanted(VIDEO.id)) {
      for (const lang of opts.langs) {
        const [out, cover, info] = renderVideo(lang, problems);
        console.log(`✓ ${rel(out)}  ${info.v.width}×${info.v.height} ${info.v.codec_name} ${info.v.pix_fmt}  ${info.duration.toFixed(1)} s  ${human(info.size)}`);
        console.log(`✓ ${rel(cover)}  ${VIDEO.w}×${VIDEO.h}  ${human(fs.statSync(cover).size)}`);
      }
    }
  } finally {
    spawnSync('agent-browser', ['--session', SESSION, 'close'], { encoding: 'utf8' });
    if (!opts.keep) fs.rmSync(TMP, { recursive: true, force: true });
    else console.log(`temporary pages kept in ${TMP}`);
  }
  // Posting copies: high-quality JPEGs (the PNG masters stay local; they are git-ignored).
  const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
  for (const f of fs.existsSync(outDir) ? fs.readdirSync(outDir).filter((n) => n.endsWith('.png')) : []) {
    const jpg = path.join(outDir, f.replace(/\.png$/, '.jpg'));
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(outDir, f), '-q:v', '2', jpg], { encoding: 'utf8' });
    if (r.status !== 0) problems.push(`JPEG export failed for ${f}: ${r.stderr}`);
  }
  if (problems.length) {
    console.log(`\n⚠ ${problems.length} layout issue(s) — shorten the copy in copy.json or adjust the template:`);
    problems.forEach((p) => console.log(`  - ${p}`));
    process.exitCode = 1;
  }
}

try {
  main();
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exitCode = 1;
}
