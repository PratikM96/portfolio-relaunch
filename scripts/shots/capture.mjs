/**
 * Output-section screenshots for the Portfolio System case study.
 *
 * The §Output gallery on /work/portfolio-system is a device x theme matrix of
 * the live site. Those captures used to be hand-driven and unrecorded, which
 * meant "re-shoot after a design change" was a reconstruction job. This file IS
 * the record: the URLs, the viewports, the theme forcing, and the framing rules
 * all live here.
 *
 *   node scripts/shots/capture.mjs             # all 12
 *   node scripts/shots/capture.mjs desktop     # one device
 *   node scripts/shots/capture.mjs d-home      # one shot, by output name
 *
 * Requires Chrome + network access to the live site. Writes straight into
 * src/assets/work/portfolio-system/ — Astro's pipeline re-encodes from there, so
 * these are SOURCES and are captured at high quality, not at delivery size.
 *
 * Why the viewports are what they are:
 *   desktop  1440x810 CSS  = exactly 16:9, the `gallery` block's ratio
 *   mobile    390x694 CSS  = exactly 9:16, the `flyer` block's ratio
 * Both at deviceScaleFactor 2, so a 2x display has real pixels to render (the
 * ladders in OutputGrid.astro top out near 2x the CSS slot). Capturing at 1x is
 * what made the desktop shots read soft.
 *
 * Viewport shots, never full-page: the nav is fixed, so a full-page capture
 * scrolls it out of frame and the `fit: cover` crop then cuts the hero apart.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = join(ROOT, 'src/assets/work/portfolio-system');
const SITE = 'https://mehtapratik.com';

const CHROME = [
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

// The pages shown per device. Desktop shows the system across page kinds (home,
// the spec page, a case study); mobile shows the same system responding.
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

  // Reduced motion so the .rev / .rev-load reveals render at their end state
  // instead of racing the screenshot (global.css forces opacity:1, transform:none).
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
    { name: 'prefers-color-scheme', value: s.theme },
  ]);

  // Seed localStorage before any page script runs. `pm-theme` is the site's key
  // (Base.astro's no-flash script) and `pm-consent` keeps the cookie banner out
  // of frame — both are read before first paint, so this has to be evaluate-on-
  // new-document, not a post-load evaluate.
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
