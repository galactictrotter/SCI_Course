import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { checkNavigation } from "./navigation_qa.mjs";

const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (error) {
  process.stderr.write("ERROR: Playwright 1.61.1 is required. Run npm install first.\n");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lessonArg = process.argv[2];
if (!lessonArg) {
  process.stderr.write("ERROR: usage: npm run qa -- Lesson-N\n");
  process.exit(1);
}

const lessonDir = path.resolve(root, lessonArg);
if (!lessonDir.startsWith(`${root}${path.sep}`)) {
  process.stderr.write("ERROR: lesson directory is outside the package root\n");
  process.exit(1);
}

const htmlPath = path.join(lessonDir, "slides", "index.html");
const manifestPath = path.join(lessonDir, "slides", "manifest.json");
if (!fs.existsSync(htmlPath) || !fs.existsSync(manifestPath)) {
  process.stderr.write("ERROR: build the lesson before browser QA\n");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const qaDir = path.join(lessonDir, "slides", "qa");
const pendingQaDir = fs.mkdtempSync(path.join(lessonDir, "slides", ".qa-pending-"));

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const launchOptions = fs.existsSync(chromePath)
  ? { headless: true, executablePath: chromePath }
  : { headless: true };

let browser;
try {
  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  const failures = [];
  const reportedCount = await page.evaluate(() => window.deckQA.slideCount);
  if (reportedCount !== manifest.slide_count) {
    failures.push(`slide count mismatch: browser=${reportedCount}, manifest=${manifest.slide_count}`);
  }

  const loadedFonts = await page.evaluate(() => ({
    title: document.fonts.check('700 16px "EB Garamond"'),
    interface: document.fonts.check('16px "Barlow Condensed"'),
    body: document.fonts.check('16px "Lora"')
  }));
  for (const [role, loaded] of Object.entries(loadedFonts)) {
    if (!loaded) failures.push(`font failed to load: ${role}`);
  }

  const overflowSlides = [];
  for (let number = 1; number <= manifest.slide_count; number += 1) {
    await page.evaluate((slideNumber) => window.deckQA.show(slideNumber), number);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const currentOverflows = await page.evaluate(() => window.deckQA.overflows());
    overflowSlides.push(...currentOverflows);
    const expected = manifest.slides[number - 1].measurement;
    if (expected) {
      const actual = await page.evaluate(() => {
        const body = document.querySelector('.is-active .reading-content');
        if (!body) return null;
        const last = body.lastElementChild;
        return { font_size: parseFloat(getComputedStyle(body).fontSize),
          height: Math.ceil(last.getBoundingClientRect().bottom - body.getBoundingClientRect().top) };
      });
      if (!actual || actual.font_size !== expected.font_size || actual.height > expected.available_height + 1) {
        failures.push(`reading layout differs from measured fit: slide ${number}`);
      }
    }
    const footerOverlap = await page.evaluate(() => {
      const nav = document.querySelector('.deck-navigation').getBoundingClientRect();
      const body = document.querySelector('.is-active .slide-content');
      if (!body) return false;
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.bottom > nav.top && rect.top < nav.bottom && rect.right > nav.left && rect.left < nav.right) return true;
        }
      }
      return false;
    });
    if (footerOverlap) failures.push(`content overlaps footer controls: slide ${number}`);
    await page.screenshot({
      path: path.join(pendingQaDir, `slide-${String(number).padStart(3, "0")}.png`),
      animations: "disabled"
    });
  }

  await page.evaluate(() => window.deckQA.show(1));
  await page.keyboard.press("ArrowRight");
  const afterRight = await page.evaluate(() => window.deckQA.currentSlide());
  if (afterRight !== 2) failures.push(`ArrowRight navigation failed: ${afterRight}`);
  await page.keyboard.press("End");
  const afterEnd = await page.evaluate(() => window.deckQA.currentSlide());
  if (afterEnd !== manifest.slide_count) failures.push(`End navigation failed: ${afterEnd}`);
  await page.keyboard.press("Home");
  const afterHome = await page.evaluate(() => window.deckQA.currentSlide());
  if (afterHome !== 1) failures.push(`Home navigation failed: ${afterHome}`);

  const footerNavigation = await checkNavigation(page, manifest);
  failures.push(...footerNavigation.failures);

  const uniqueOverflows = [...new Set(overflowSlides)];
  if (uniqueOverflows.length) failures.push(`content overflow: ${uniqueOverflows.join(", ")}`);

  const report = {
    generated_at: new Date().toISOString(),
    viewport: { width: 1600, height: 1000 },
    slide_count: manifest.slide_count,
    fonts: loadedFonts,
    overflow_slides: uniqueOverflows,
    footer_navigation: footerNavigation,
    navigation: { arrow_right: afterRight, end: afterEnd, home: afterHome },
    failures
  };
  fs.rmSync(qaDir, { recursive: true, force: true });
  fs.renameSync(pendingQaDir, qaDir);
  fs.writeFileSync(path.join(lessonDir, "slides", "qa-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  if (failures.length) {
    process.stderr.write(`${failures.join("\n")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Browser QA passed for ${manifest.slide_count} slides\n`);
  }
} catch (error) {
  process.stderr.write(`ERROR: Browser QA failed: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  fs.rmSync(pendingQaDir, { recursive: true, force: true });
}
