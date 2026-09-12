# Cours de SIC — deterministic HTML slides

This package turns a lesson's `content.yaml` into a self-contained 16:10 HTML slide deck. Content changes by lesson; layout, typography, sequencing, pagination, and presenter interactions remain fixed.

## Requirements

Ruby 2.7 or later, Node.js 20 or later, Playwright, and a browser are required for builds. Install with `npm install`; on systems without Google Chrome at its standard macOS location, also run `npx playwright install chromium`.

The builder renders the actual point markup with bundled fonts in headless Chromium to determine which complete points fit together. Validation alone uses Ruby without a browser. Finished decks remain self-contained and need no build tools to present.

## Build a lesson

```bash
make production LESSON=Lesson-5
```

The generated deck is written to `Lesson-5/slides/index.html` with a machine-readable `manifest.json` and bundled fonts.

The package can also be run directly without Make:

```bash
ruby src/build_slides.rb Lesson-5
ruby src/validate_slides.rb Lesson-5
```

In environments with npm, the equivalent commands are `npm run lesson -- Lesson-5` and `npm run validate -- Lesson-5`.

## Regression checks

Run `npm test` or `make test` after installing the requirements. Tests use isolated temporary lesson copies and real browser measurements. They cover deterministic builds, invalid input, stale artifacts, missing slides, section sequencing, bundled fonts, actual text/list fit, and preservation of QA results after a browser launch failure.

Validation compares generated slide IDs and titles with the manifest, verifies complete source-point numbering, checks measured dimensions and font sizes, and detects stale generator, layout, and font inputs. Rebuild a lesson when validation reports stale or legacy artifacts. Structural validation does not replace browser QA or editorial review.

## Browser QA

Install the exact development dependency once and run:

```bash
npm install
npm run qa -- Lesson-5
```

Browser QA checks every slide at 1600 × 1000, verifies keyboard navigation and bundled fonts, detects content overflow, and writes `slides/qa-report.json` plus full-slide PNGs under `slides/qa/`.

Screenshots from the previous run are retained until the new browser inspection finishes; a launch or capture failure leaves them intact.

Long lesson titles use a two-line title treatment and are included in the same overflow check as the slide body.

## Presenter controls

- Right arrow, down arrow, space or Page Down: next slide
- Left arrow, up arrow, Backspace or Page Up: previous slide
- Home / End: first / last slide
- `F`: enter or leave fullscreen

The Discussion section uses paired slides: the first shows the question, and the next reveals the same question with its answer.

## Fixed production logic

1. Cover
2. Points principaux
3. Résumé long
4. Questions-only sequence
5. Discussion question/answer sequence
6. Place de la leçon

Section pagination begins at 1 and the final slide of every section receives `et fin`. Global pagination is calculated only after the full slide sequence is assembled.

Points principaux, Résumé long, and Place de la leçon use a consistent 32px reading size with bold 32px point numbers. Pagination uses actual browser-rendered height, wrapping, bullet spacing, and bundled fonts; there is no character-count or item-count cutoff. The builder finds the fewest pages that fit, then balances their occupied height.

Each numbered point remains complete, with its bullets, on one slide. Only a point that cannot fit alone at 32px uses a smaller size, in 2px steps down to 24px. Smaller text is never used to squeeze several points together. If a whole point still cannot fit at 24px, the build stops with its section and number rather than splitting or clipping it. Questions and Discussion retain their existing presentation and sequence.

The manifest records the measured height, font size, source-point range, browser version, and build signature. Run browser QA after building to verify the complete deck and refresh screenshots.

## Editorial policy

The generator does not rewrite source text. Corrections must be made explicitly in the lesson's `content.yaml`.

## Footer navigation

Every generated deck has a centered footer control group using the supplied SVG icons: lesson menu, first slide, previous slide, section dropdown, next slide, and last slide. The section dropdown jumps to the cover or the first slide of Points principaux, Résumé long, Questions, Discussion, or Place de la leçon. Its selection follows the current slide.

The lesson menu lists 01–33 and reads titles and actual folder names from `Lesson-*/content.yaml`. Lessons without complete sources are shown as unavailable; known early-lesson titles are retained in `config/incomplete-lessons.json`. Titles for Lessons 1 and 3 still need confirmation. Cross-lesson links require the sibling lesson folders to remain together when copying or hosting the course. A standalone deck retains its within-lesson controls.

Use Tab to focus controls. The lesson list supports Up/Down and Home/End; Escape closes it and restores focus. Left/right keyboard arrows also work while a slide-navigation button has focus, so readers can switch between clicking and keyboard navigation. Other control keys retain their native behavior. The controls are hidden when printing. Changes to the lesson catalog or SVG icons invalidate existing builds, so rebuild all lessons after changing titles or adding a lesson.
