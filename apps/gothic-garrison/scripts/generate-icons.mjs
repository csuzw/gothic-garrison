// Rasterises the Gothic Garrison fortress emblem into the PNG icon set the PWA
// manifest references. Uses the already-installed Playwright Chromium so we
// don't add an image-processing dependency. Re-run after editing the emblem:
//
//   pnpm --filter gothic-garrison icons:generate
//
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../static/icons');

const GOLD = '#c9a24a';
const BG = '#1a160f'; // gothic base for opaque (maskable / apple) icons

// Keep this path in sync with src/lib/components/Logo.svelte + static/favicon.svg.
const PATH = `M8 56 L8 10 L12 10 L12 14 L13 14 L13 10 L17 10 L17 14 L18 14 L18 10 L22 10 L22 16 L27 16 L27 20 L29.5 20 L29.5 16 L34.5 16 L34.5 20 L37 20 L37 16 L42 16 L42 10 L46 10 L46 14 L47 14 L47 10 L51 10 L51 14 L52 14 L52 10 L56 10 L56 56 Z M27 56 L27 44 Q27 36 32 36 Q37 36 37 44 L37 56 Z M14 32 L14 26 Q14 22 15 22 Q16 22 16 26 L16 32 Z M48 32 L48 26 Q48 22 49 22 Q50 22 50 26 L50 32 Z M30 31 L30 26 Q30 24 32 24 Q34 24 34 26 L34 31 Z`;

function html({ size, opaque, scale }) {
  // `scale` insets the emblem so maskable/apple icons keep the artwork inside
  // the platform safe zone.
  const inner = Math.round(size * scale);
  const bg = opaque ? `background:${BG};` : '';
  return `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;${bg}display:flex;align-items:center;justify-content:center;">
    <svg width="${inner}" height="${inner}" viewBox="0 0 64 64" fill="${GOLD}" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg"><path d="${PATH}"/></svg>
  </body></html>`;
}

const targets = [
  { file: 'icon-192.png', size: 192, opaque: false, scale: 1 },
  { file: 'icon-512.png', size: 512, opaque: false, scale: 1 },
  { file: 'icon-maskable-512.png', size: 512, opaque: true, scale: 0.8 },
  { file: 'apple-touch-icon.png', size: 180, opaque: true, scale: 0.78 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const t of targets) {
    const page = await browser.newPage({
      viewport: { width: t.size, height: t.size },
      deviceScaleFactor: 1,
    });
    await page.setContent(html(t), { waitUntil: 'load' });
    await page.screenshot({
      path: resolve(outDir, t.file),
      omitBackground: !t.opaque,
      clip: { x: 0, y: 0, width: t.size, height: t.size },
    });
    await page.close();
    console.log(`wrote icons/${t.file} (${t.size}x${t.size})`);
  }
} finally {
  await browser.close();
}
