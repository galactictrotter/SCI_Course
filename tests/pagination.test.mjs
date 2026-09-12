import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'config/design-tokens.json')));
const cssResult = spawnSync('ruby', ['-rjson', '-rerb', '-e', `
  tokens = JSON.parse(File.read('config/design-tokens.json'))
  colors = tokens.fetch('colors'); layout = tokens.fetch('layout'); type = tokens.fetch('type')
  canvas_width = 1600; canvas_height = 1000; content_pagination = tokens.fetch('pagination').fetch('content_sections')
  puts ERB.new(File.read('templates/slides.css.erb')).result(binding)
`], { cwd: root, encoding: 'utf8' });
assert.equal(cssResult.status, 0, cssResult.stderr);
const item = (body, number = 1) => `<div class="numbered-item"><div class="item-number">${number}.</div><div class="item-body">${body}</div></div>`;
function measure(sections) {
  return spawnSync(process.execPath, ['src/measure_pagination.mjs'], {
    cwd: root, encoding: 'utf8', input: JSON.stringify({ css: cssResult.stdout, font_dir: path.join(root, 'assets/fonts'), viewport: { width: 1600, height: 1000 }, policy: tokens.pagination.content_sections, sections })
  });
}
test('real browser fit uses wrapping and list height, preserves points, and removes count/character cutoffs', () => {
  const sections = {
    four_short: Array.from({length:4}, (_,i) => item('<p>Un point court.</p>',i+1)),
    over_850: Array.from({length:3}, (_,i) => item(`<p>${'Texte court. '.repeat(25)}</p>`,i+1)),
    narrow: Array.from({length:5}, (_,i) => item(`<p>${'iii '.repeat(90)}</p>`,i+1)),
    wide: Array.from({length:5}, (_,i) => item(`<p>${'WWW '.repeat(90)}</p>`,i+1)),
    prose: Array.from({length:3}, (_,i) => item(`<p>${'Un point. '.repeat(12)}</p>`,i+1)),
    bullets: Array.from({length:3}, (_,i) => item(`<ul>${'<li>Un point.</li>'.repeat(12)}</ul>`,i+1))
  };
  const result = measure(sections);
  assert.equal(result.status, 0, result.stderr);
  const pages = JSON.parse(result.stdout).sections;
  assert.equal(pages.four_short.length, 1);
  assert.equal(pages.over_850.length, 1);
  assert.ok(pages.wide.length > pages.narrow.length, 'font width must affect grouping');
  assert.ok(pages.bullets.length > pages.prose.length, 'bullet rows must affect grouping');
  for (const [name, groups] of Object.entries(pages)) {
    assert.deepEqual(groups.flatMap(p => Array.from({length:p.end-p.start+1}, (_,i) => p.start+i)), sections[name].map((_,i) => i));
    assert.ok(groups.every(p => p.measured_height <= p.available_height));
    assert.ok(groups.every(p => p.start === p.end || p.font_size === 32));
  }
});
test('an unfit whole point fails explicitly instead of splitting or silently shrinking', () => {
  const result = measure({ impossible: [item(`<p>${'Un texte très long. '.repeat(700)}</p>`)] });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /point 1 cannot fit at 24px/);
});
