/**
 * Screenshot helper. Captures at a tall viewport rather than using fullPage,
 * because `overflow-x: clip` inflates scrollWidth and puppeteer's fullPage
 * capture widens the canvas to match, shifting every element sideways.
 *
 * Usage: node scripts/shot.mjs <route-without-leading-slash> <width> <height> <outfile>
 */
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';

const [, , route = '', w = '1440', h = '2200', out = 'shot'] = process.argv;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p));

const server = await createServer({ server: { port: 5197, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h) });
await page.goto('http://localhost:5197/' + route, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: `qa-screenshots/${out}.png` });
console.log(`qa-screenshots/${out}.png`);
await browser.close();
await server.close();
