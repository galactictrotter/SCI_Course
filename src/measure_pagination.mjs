import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
let browser;
let temporary;
try {
  const { chromium } = require('playwright');
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'sci-measure-'));
  const css = input.css.replaceAll('url("assets/fonts/', `url("${pathToFileURL(input.font_dir + path.sep).href}`);
  const documentPath = path.join(temporary, 'measure.html');
  fs.writeFileSync(documentPath, `<!doctype html><html lang="fr"><meta charset="utf-8"><style>${css}</style><body><main class="deck-stage"><article class="slide is-active"><section class="slide-content reading-content"></section></article></main></body></html>`);
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  browser = await chromium.launch({ headless: true, ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {}) });
  const page = await browser.newPage({ viewport: input.viewport });
  await page.goto(pathToFileURL(documentPath).href);
  await page.evaluate(async () => {
    await Promise.all([document.fonts.load('400 32px "Lora"'), document.fonts.load('600 32px "Barlow Condensed"')]);
    await document.fonts.ready;
    for (const family of ['Lora', 'Barlow Condensed']) {
      if (![...document.fonts].some(f => f.family.replaceAll('"', '') === family && f.status === 'loaded')) throw new Error(`Font not loaded: ${family}`);
    }
  });
  const sections = await page.evaluate(({ sections, policy }) => {
    const container = document.querySelector('.reading-content');
    const available = container.clientHeight - policy.bottom_safety_px;
    function measure(html, size) {
      container.style.fontSize = `${size}px`;
      container.innerHTML = html;
      const children = [...container.children];
      const height = Math.ceil(children.at(-1).getBoundingClientRect().bottom - container.getBoundingClientRect().top);
      const horizontalOverflow = container.scrollWidth > container.clientWidth + 1;
      return { height, fits: !horizontalOverflow && height <= available };
    }
    const result = {};
    for (const [section, items] of Object.entries(sections)) {
      const candidates = items.map(() => []);
      for (let start = 0; start < items.length; start++) {
        let html = '';
        for (let end = start; end < items.length; end++) {
          html += items[end];
          let size = policy.font_size;
          let fit = measure(html, size);
          // Only an indivisible point that cannot fit alone gets smaller text.
          if (!fit.fits && end === start) {
            while (!fit.fits && size > policy.min_single_point_font_size) {
              size = Math.max(policy.min_single_point_font_size, size - policy.font_step);
              fit = measure(html, size);
            }
            if (!fit.fits) throw new Error(`${section} point ${start + 1} cannot fit at ${size}px; source point was not split`);
            candidates[start].push({ start, end, font_size: size, measured_height: fit.height, available_height: available });
            break;
          }
          if (!fit.fits) break;
          candidates[start].push({ start, end, font_size: size, measured_height: fit.height, available_height: available });
        }
      }
      // Fewest pages first; then balance actual occupied height, not characters.
      const best = Array(items.length + 1);
      best[items.length] = { count: 0, cost: 0, pages: [] };
      for (let start = items.length - 1; start >= 0; start--) {
        for (const candidate of candidates[start]) {
          const rest = best[candidate.end + 1];
          const count = rest.count + 1;
          const cost = rest.cost + (available - candidate.measured_height) ** 2;
          if (!best[start] || count < best[start].count || (count === best[start].count && cost < best[start].cost)) {
            best[start] = { count, cost, pages: [candidate, ...rest.pages] };
          }
        }
      }
      result[section] = best[0].pages;
    }
    return result;
  }, { sections: input.sections, policy: input.policy });
  process.stdout.write(JSON.stringify({ sections, browser: browser.version(), playwright: require('playwright/package.json').version }));
} catch (error) {
  process.stderr.write(`ERROR: Rendered pagination failed: ${error.message}\nInstall Playwright and Chrome or Playwright Chromium before building.\n`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (temporary) fs.rmSync(temporary, { recursive: true, force: true });
}
