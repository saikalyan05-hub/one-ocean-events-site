/**
 * Screenshot a modal.
 *
 * The modal state lives in context and only opens from a click, so this drives
 * the real UI rather than poking React: navigate, click a selector (or a chain
 * of them), wait for `.modal-panel`, then capture the viewport.
 *
 * Usage: node scripts/shot-modal.mjs <route|_> <selector[|selector...]> <w> <h> <out>
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

const [route = '_', chain = '', w = '1440', h = '900', out = 'modal'] = process.argv.slice(2);

const server = await createServer({ server: { port: 5196, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h) });
await page.goto('http://localhost:5196/' + (route === '_' ? '' : route), {
  waitUntil: 'networkidle2',
});

/*
 * A chain entry is either a selector to click, or `selector=value` to fill.
 * Filling goes through the element's native value setter and a dispatched
 * `input` event rather than page.type, because React reads the synthetic event
 * and `<select>`/`<input type=date>` do not accept keystrokes reliably.
 */
for (const entry of chain.split('|').filter(Boolean)) {
  const eq = entry.indexOf('=');
  const selector = eq === -1 ? entry : entry.slice(0, eq);
  await page.waitForSelector(selector, { visible: true, timeout: 8000 });

  if (eq === -1) {
    await page.click(selector);
  } else {
    const value = entry.slice(eq + 1);
    await page.$eval(
      selector,
      (el, v) => {
        const proto = Object.getPrototypeOf(el);
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      value,
    );
  }
  await new Promise((r) => setTimeout(r, 400));
}

/* A missing dialog still gets captured — the screenshot of where the chain
   stopped is what tells you which click failed to land. */
try {
  await page.waitForSelector('.modal-panel', { visible: true, timeout: 8000 });
} catch {
  console.error('no .modal-panel — capturing the page as it stands');
}
await new Promise((r) => setTimeout(r, 700));

/*
 * No `clip`. Puppeteer's clip box is in *page* coordinates, so once it has
 * scrolled down to reach a trigger button, a clip of {0,0} captures the top of
 * the document rather than what is on screen — which for a fixed-position
 * dialog means a screenshot with no dialog in it. `captureBeyondViewport:
 * false` takes exactly the visible viewport, wherever the page happens to sit.
 */
await page.screenshot({ path: `qa-screenshots/${out}.png`, captureBeyondViewport: false });
console.log(`qa-screenshots/${out}.png`);

await browser.close();
await server.close();
