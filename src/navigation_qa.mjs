import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function checkNavigation(page, manifest) {
  const failures = [];
  const current = () => page.evaluate(() => window.deckQA.currentSlide());
  const expectSlide = async (expected, action) => {
    if (await current() !== expected) failures.push(`${action}: expected slide ${expected}, got ${await current()}`);
  };
  await page.evaluate(() => window.deckQA.show(1));
  if (!await page.locator('#previous-slide').isDisabled()) failures.push('previous-slide button remains enabled at start');
  await page.locator('#next-slide').click();
  await expectSlide(2, 'next-slide button');
  await page.keyboard.press('ArrowRight');
  await expectSlide(3, 'keyboard after clicking next');
  await page.locator('#previous-slide').click();
  await expectSlide(2, 'previous-slide button');
  await page.keyboard.press('ArrowLeft');
  await expectSlide(1, 'keyboard after clicking previous');
  await page.locator('#last-slide').click();
  await expectSlide(manifest.slide_count, 'last-slide button');
  if (!await page.locator('#last-slide').isDisabled()) failures.push('last-slide button remains enabled at end');
  if (!await page.locator('#next-slide').isDisabled()) failures.push('next-slide button remains enabled at end');
  await page.locator('#previous-slide').click();
  await expectSlide(manifest.slide_count - 1, 'previous from last slide');
  await page.locator('#first-slide').click();
  await expectSlide(1, 'first-slide button');
  if (!await page.locator('#first-slide').isDisabled()) failures.push('first-slide button remains enabled at start');

  const sections = manifest.slides.filter((slide, i, slides) => i === 0 || slide.section !== slides[i - 1].section);
  const options = await page.locator('#section-select option').evaluateAll(options => options.map(option => Number(option.value)));
  if (JSON.stringify(options) !== JSON.stringify(sections.map(slide => slide.number))) failures.push('section destinations differ from manifest');
  for (const section of sections) {
    await page.selectOption('#section-select', String(section.number));
    await expectSlide(section.number, `section ${section.section || 'cover'}`);
    const last = manifest.slides.filter(slide => slide.section === section.section).at(-1);
    await page.evaluate(number => window.deckQA.show(number), last.number);
    if (await page.locator('#section-select').inputValue() !== String(section.number)) failures.push('section selection does not follow slide navigation');
  }
  await page.locator('#section-select').focus();
  const beforeKey = await current();
  await page.keyboard.press('f');
  await expectSlide(beforeKey, 'dropdown keyboard isolation');
  if (await page.evaluate(() => !!document.fullscreenElement)) failures.push('dropdown typing activates fullscreen');

  await page.locator('#lesson-menu-toggle').click();
  if (!await page.locator('#lesson-menu').isVisible()) failures.push('lesson menu does not open');
  if (await page.locator('#lesson-menu li').count() !== 33) failures.push('lesson menu must list 33 lessons');
  const links = await page.locator('#lesson-menu a').evaluateAll(links => links.map(link => ({ href: link.href, text: link.textContent })));
  for (const link of links) {
    if (!fs.existsSync(fileURLToPath(link.href))) failures.push(`missing lesson destination: ${link.text.trim()}`);
  }
  const menuSlide = await current();
  await page.keyboard.press('End');
  await expectSlide(menuSlide, 'lesson menu End key isolation');
  if (!await page.locator('#lesson-menu a').last().evaluate(link => link === document.activeElement)) failures.push('End does not focus last lesson');
  await page.keyboard.press('Escape');
  if (await page.locator('#lesson-menu').isVisible()) failures.push('Escape does not close lesson menu');
  if (!await page.locator('#lesson-menu-toggle').evaluate(button => button === document.activeElement)) failures.push('Escape does not restore focus');
  await page.locator('#lesson-menu-toggle').click();
  await page.locator('.is-active .lesson-title, .is-active .cover-title').click();
  if (await page.locator('#lesson-menu').isVisible()) failures.push('outside click does not close lesson menu');
  await page.emulateMedia({ media: 'print' });
  if (await page.locator('.deck-navigation').isVisible()) failures.push('navigation appears in print');
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => { document.activeElement.blur(); window.deckQA.show(1); });
  return { failures, section_count: sections.length, lesson_count: 33, linked_lessons: links.length };
}
