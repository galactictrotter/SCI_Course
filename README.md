# Cours de SIC — deterministic HTML slides

This package turns a lesson's `content.yaml` into a self-contained 16:10 HTML slide deck. Content changes by lesson; layout, typography, sequencing, pagination, and presenter interactions remain fixed.

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

## Browser QA

Install the exact development dependency once and run:

```bash
npm install
npm run qa -- Lesson-5
```

Browser QA checks every slide at 1600 × 1000, verifies keyboard navigation and bundled fonts, detects content overflow, and writes `slides/qa-report.json` plus full-slide PNGs under `slides/qa/`.

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

Points principaux, Résumé long, and Place de la leçon share one pagination policy: no more than 3 rendered items or 850 combined characters per slide. A source item longer than 850 characters continues on a new slide with the same number and a `suite` label, preserving the source numbering and wording. Questions and Discussion are deliberate exceptions and always retain one question per slide/state.

## Editorial policy

The generator does not rewrite source text. Corrections must be made explicitly in the lesson's `content.yaml`.
