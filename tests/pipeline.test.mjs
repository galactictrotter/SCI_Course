import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sci-course-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const name of ['src', 'templates', 'config', 'assets', 'menu.svg', 'arrow-left.svg', 'arrow-right.svg', 'arrow-left-to-line.svg', 'arrow-right-to-line.svg']) {
    fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
  }
  fs.mkdirSync(path.join(dir, 'Lesson-test'));
  fs.copyFileSync(path.join(root, 'Lesson-5/content.yaml'), path.join(dir, 'Lesson-test/content.yaml'));
  const run = (script) => spawnSync('ruby', [`src/${script}_slides.rb`, 'Lesson-test'], { cwd: dir, encoding: 'utf8' });
  const artifact = (name) => path.join(dir, 'Lesson-test/slides', name);
  const build = run('build');
  assert.equal(build.status, 0, build.stderr);
  return { dir, run, artifact };
}

test('build is deterministic and validates', (t) => {
  const { run, artifact } = fixture(t);
  const before = ['index.html', 'manifest.json'].map((name) => fs.readFileSync(artifact(name), 'utf8'));
  assert.equal(run('build').status, 0);
  assert.deepEqual(['index.html', 'manifest.json'].map((name) => fs.readFileSync(artifact(name), 'utf8')), before);
  const validation = run('validate');
  assert.equal(validation.status, 0, validation.stderr);
});

for (const [name, change, message] of [
  ['missing HTML slide', (f) => {
    fs.writeFileSync(f.artifact('index.html'), fs.readFileSync(f.artifact('index.html'), 'utf8').replace(/<article\b[\s\S]*?<\/article>/, ''));
  }, /HTML slide IDs/],
  ['incorrect section counts', (f) => {
    const manifest = JSON.parse(fs.readFileSync(f.artifact('manifest.json')));
    manifest.section_slide_counts.questions += 1;
    fs.writeFileSync(f.artifact('manifest.json'), JSON.stringify(manifest));
  }, /section slide counts/],
  ['out-of-order discussion states', (f) => {
    const manifest = JSON.parse(fs.readFileSync(f.artifact('manifest.json')));
    const i = manifest.slides.findIndex((slide) => slide.role === 'discussion_question');
    [manifest.slides[i].role, manifest.slides[i + 1].role] = [manifest.slides[i + 1].role, manifest.slides[i].role];
    fs.writeFileSync(f.artifact('manifest.json'), JSON.stringify(manifest));
  }, /slide sequence/],
  ['stale layout', (f) => fs.appendFileSync(path.join(f.dir, 'templates/slides.css.erb'), '\n/* layout changed */\n'), /generated layout is stale/],
  ['measured overflow', (f) => {
    const manifest = JSON.parse(fs.readFileSync(f.artifact('manifest.json')));
    const slide = manifest.slides.find((slide) => slide.measurement);
    slide.measurement.measured_height = slide.measurement.available_height + 20;
    fs.writeFileSync(f.artifact('manifest.json'), JSON.stringify(manifest));
  }, /measured overflow/],
  ['damaged footer navigation', (f) => {
    const html = fs.readFileSync(f.artifact('index.html'), 'utf8').replace('id="section-select"', 'id="broken-section-select"');
    fs.writeFileSync(f.artifact('index.html'), html);
  }, /footer navigation mismatch/],
  ['missing font', (f) => fs.unlinkSync(f.artifact('assets/fonts/lora-400.ttf')), /bundled font/],
  ['damaged font', (f) => fs.writeFileSync(f.artifact('assets/fonts/lora-400.ttf'), 'broken'), /bundled font/],
  ['malformed manifest', (f) => fs.writeFileSync(f.artifact('manifest.json'), '{'), /invalid content or generated artifacts/],
  ['legacy manifest', (f) => {
    const manifest = JSON.parse(fs.readFileSync(f.artifact('manifest.json')));
    delete manifest.pagination_policy;
    fs.writeFileSync(f.artifact('manifest.json'), JSON.stringify(manifest));
  }, /rebuild the lesson/],
  ['stale content', (f) => fs.appendFileSync(path.join(f.dir, 'Lesson-test/content.yaml'), '\n'), /deck is stale/],
]) {
  test(`validation rejects ${name}`, (t) => {
    const f = fixture(t);
    change(f);
    const result = f.run('validate');
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, message);
    assert.doesNotMatch(result.stderr, /in '<main>'/);
  });
}

for (const [name, source, message] of [
  ['invalid YAML', 'lesson: [', /invalid YAML/],
  ['unknown content fields', null, /unknown fields/],
]) {
  test(`both commands reject ${name} clearly`, (t) => {
    const f = fixture(t);
    const content = path.join(f.dir, 'Lesson-test/content.yaml');
    if (source) fs.writeFileSync(content, source);
    else fs.appendFileSync(content, '\nunexpected_field: typo\n');
    for (const script of ['build', 'validate']) {
      const result = f.run(script);
      assert.equal(result.status, 1);
      assert.match(result.stderr, message);
      assert.doesNotMatch(result.stderr, /in '<main>'/);
    }
  });
}

test('a browser launch failure preserves the previous QA artifacts', (t) => {
  const f = fixture(t);
  const mock = path.join(f.dir, 'node_modules/playwright');
  fs.mkdirSync(mock, { recursive: true });
  fs.writeFileSync(path.join(mock, 'index.js'), 'exports.chromium = { launch: async () => { throw new Error("test launch failure"); } };');
  fs.mkdirSync(f.artifact('qa'));
  fs.writeFileSync(f.artifact('qa/previous.png'), 'previous screenshot');
  fs.writeFileSync(f.artifact('qa-report.json'), '{"previous":true}');
  const result = spawnSync(process.execPath, ['src/browser_qa.mjs', 'Lesson-test'], { cwd: f.dir, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /test launch failure/);
  assert.equal(fs.readFileSync(f.artifact('qa/previous.png'), 'utf8'), 'previous screenshot');
  assert.equal(fs.readFileSync(f.artifact('qa-report.json'), 'utf8'), '{"previous":true}');
  assert.equal(fs.readdirSync(f.artifact('')).some((name) => name.startsWith('.qa-pending-')), false);
});

test('footer controls navigate sections, preserve keyboard behavior, and follow lesson links', async (t) => {
  const f = fixture(t);
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const { chromium } = createRequire(import.meta.url)('playwright');
  const { checkNavigation } = await import('../src/navigation_qa.mjs');
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({ headless: true, ...(fs.existsSync(chrome) ? { executablePath: chrome } : {}) });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto(pathToFileURL(f.artifact('index.html')).href);
  const manifest = JSON.parse(fs.readFileSync(f.artifact('manifest.json')));
  assert.deepEqual((await checkNavigation(page, manifest)).failures, []);
  await page.evaluate(() => window.deckQA.show(3));
  await page.click('#lesson-menu-toggle');
  await page.locator('#lesson-menu a[aria-current="page"]').click();
  await page.waitForURL('**#/1');
  assert.equal(await page.evaluate(() => window.deckQA.currentSlide()), 1);
  assert.equal(await page.locator('#lesson-menu').isVisible(), false);
  await page.click('#lesson-menu-toggle');
  await page.locator('#lesson-menu a[aria-current="page"]').click();
  assert.equal(await page.locator('#lesson-menu').isVisible(), false, 'current lesson closes the menu even when already on slide 1');
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.click('#last-slide');
  assert.equal(await page.evaluate(() => window.deckQA.currentSlide()), manifest.slide_count);
  const fits = await page.locator('.deck-navigation').evaluate(nav => {
    const r = nav.getBoundingClientRect();
    const left = document.querySelector('.is-active .course-footer').getBoundingClientRect();
    const right = document.querySelector('.is-active .global-pagination').getBoundingClientRect();
    return r.left > left.right && r.right < right.left && r.bottom <= innerHeight;
  });
  assert.equal(fits, true, 'controls fit between the footer labels at a smaller viewport');
});
