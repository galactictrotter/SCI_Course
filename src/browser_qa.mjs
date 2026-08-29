import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (error) {
  process.stderr.write("ERROR: Playwright 1.61.1 is required. Run npm install first.\n");
  process.exit(1);
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
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
fs.rmSync(qaDir, { recursive: true, force: true });
fs.mkdirSync(qaDir, { recursive: true });

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const launchOptions = fs.existsSync(chromePath)
  ? { headless: true, executablePath: chromePath }
  : { headless: true };

const browser = await chromium.launch(launchOptions);
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
  await page.screenshot({
    path: path.join(qaDir, `slide-${String(number).padStart(3, "0")}.png`),
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

const uniqueOverflows = [...new Set(overflowSlides)];
if (uniqueOverflows.length) failures.push(`content overflow: ${uniqueOverflows.join(", ")}`);

const report = {
  generated_at: new Date().toISOString(),
  viewport: { width: 1600, height: 1000 },
  slide_count: manifest.slide_count,
  fonts: loadedFonts,
  overflow_slides: uniqueOverflows,
  navigation: { arrow_right: afterRight, end: afterEnd, home: afterHome },
  failures
};
fs.writeFileSync(path.join(lessonDir, "slides", "qa-report.json"), `${JSON.stringify(report, null, 2)}\n`);

await browser.close();

if (failures.length) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Browser QA passed for ${manifest.slide_count} slides\n`);
