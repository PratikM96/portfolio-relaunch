/**
 * §Output screenshots for the Portfolio System case study — a device x theme matrix of the live site. This file IS the record of how they were captured.
 *
 *   node scripts/shots/capture.mjs             # all 12
 *   node scripts/shots/capture.mjs desktop     # one device
 *   node scripts/shots/capture.mjs d-home      # one shot, by output name
 *
 * Requires Chrome + network. Writes into src/assets/work/portfolio-system/, so these are SOURCES: captured at high quality, never at delivery size.
 *
 * The viewports are exact block ratios — desktop 1440x810 (16:9, `gallery`), mobile 390x694 (9:16, `flyer`) — both at deviceScaleFactor 2, because 1x is what made the desktop shots read soft. Viewport shots, never full-page: the nav is fixed, and a full-page capture scrolls it out of frame.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = join(ROOT, 'src/assets/work/portfolio-system');
const SITE = 'https://mehtapratik.com';

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
if (!CHROME) { console.error('Chrome not found — edit the CHROME list.'); process.exit(1); }

// device -> viewport. deviceScaleFactor 2 on both: these are 2x sources.
const DEVICE = {
  desktop: { prefix: 'd', width: 1440, height: 810, deviceScaleFactor: 2, hasTouch: false, isMobile: false },
  mobile: { prefix: 'm', width: 390, height: 694, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
};

// The pages shown per device.
const PAGES = {
  desktop: [
    { name: 'home', url: '/' },
    { name: 'brand', url: '/brand' },
    { name: 'dealnews', url: '/work/dealnews' },
  ],
  mobile: [
    { name: 'home', url: '/' },
    { name: 'about', url: '/about' },
    { name: 'journal', url: '/journal' },
  ],
};

const ALL = Object.entries(DEVICE).flatMap(([device, vp]) =>
  PAGES[device].flatMap((p) =>
    ['dark', 'light'].map((theme) => ({ device, vp, theme, name: `${vp.prefix}-${p.name}`, url: SITE + p.url })),
  ),
);

const arg = process.argv[2];
const shots = !arg
  ? ALL
  : ALL.filter((s) => s.device === arg || s.name === arg || `${s.name}-${s.theme}` === arg);
if (!shots.length) {
  console.error(`Nothing matches "${arg}". Try: desktop, mobile, or one of ` + [...new Set(ALL.map((s) => s.name))].join(', '));
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb'] });

for (const s of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.vp.width, height: s.vp.height, deviceScaleFactor: s.vp.deviceScaleFactor, hasTouch: s.vp.hasTouch, isMobile: s.vp.isMobile });

  // Reduced motion so the reveals render at their end state, not mid-animation.
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
    { name: 'prefers-color-scheme', value: s.theme },
  ]);

  // Both keys are read before first paint, so this must be evaluate-on-new-document, not a post-load evaluate.
  await page.evaluateOnNewDocument((theme) => {
    try {
      localStorage.setItem('pm-theme', theme);
      localStorage.setItem('pm-consent', 'denied');
    } catch (e) {}
  }, s.theme);

  await page.goto(s.url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));

  const buf = await page.screenshot({ type: 'webp', quality: 95, captureBeyondViewport: false });
  const file = join(OUT, `${s.name}-${s.theme}.webp`);
  writeFileSync(file, buf);
  console.log(`  ${(s.name + '-' + s.theme + '.webp').padEnd(22)} ${s.vp.width * 2}x${s.vp.height * 2}  ${(buf.length / 1024).toFixed(0)}KB  ${s.url}`);
  await page.close();
}

await browser.close();
console.log(`\n${shots.length} shot(s) -> src/assets/work/portfolio-system/`);
