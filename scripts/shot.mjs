/**
 * Screenshot helper.
 *
 * `overflow-x: clip` on <body> makes the document report a ~10k scrollWidth, and
 * puppeteer's fullPage capture widens the canvas to match — which is why earlier
 * captures came out 10727px wide with the page squeezed into the left edge. An
 * explicit `clip` box pins the capture to the viewport width instead.
 *
 * Usage: node scripts/shot.mjs <route|_ for home> <width> <height> <outfile>
 *        node scripts/shot.mjs --batch <width> <height> <route:name,...>
 */
import { existsSync, mkdirSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

mkdirSync('qa-screenshots', { recursive: true });

const args = process.argv.slice(2);
let jobs = [];
let w;
let h;

if (args[0] === '--batch') {
  [, w, h] = args;
  jobs = args[3].split(',').map((pair) => {
    const [route, name] = pair.split(':');
    return { route: route === '_' ? '' : route, name: name || route || 'home' };
  });
} else {
  const [route = '_', width = '1440', height = '2200', out = 'shot'] = args;
  w = width;
  h = height;
  jobs = [{ route: route === '_' ? '' : route, name: out }];
}

const server = await createServer({ server: { port: 5197, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h) });

for (const job of jobs) {
  await page.goto('http://localhost:5197/' + job.route, { waitUntil: 'networkidle2' });
  // Let fonts settle and scroll-reveal observers fire for below-the-fold bands.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 450));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 900));

  const full = await page.evaluate(() => document.body.scrollHeight);
  await page.screenshot({
    path: `qa-screenshots/${job.name}.png`,
    clip: { x: 0, y: 0, width: Number(w), height: Math.min(Math.max(full, 400), Number(h)) },
  });
  console.log(`qa-screenshots/${job.name}.png`);
}

await browser.close();
await server.close();
