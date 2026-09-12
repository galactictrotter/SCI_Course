# Browser-measured whole-point pagination

Date: 2026-09-05

## Active policy

For online read-aloud sessions, every numbered source point stays complete and in order on one slide. Main points, résumé, and Place sections share a 32px reading size, 32px semibold point numbers, and clear spacing between points. The 850-character and three-point limits have been removed.

The build measures candidate groups in Chrome using the actual slide CSS and bundled fonts. It chooses the fewest fitting slides, then balances unused rendered height. This accounts for real line wrapping and bullet-list height. The reading area is 650px high with an 8px safety allowance. A single point that cannot fit at 32px gets its own slide at the largest fitting size in 2px steps, with a 24px minimum. An indivisible point that cannot fit at that minimum stops the build with an error.

Questions and the questions-only/paired-discussion sequence retain their existing layout. Source wording is unchanged.

The shared policy is in `config/design-tokens.json`; browser measurement is in `src/measure_pagination.mjs`. Manifests record each reading slide's measured height, size, and source range, plus browser/Playwright versions. Validation detects stale generator, template, token, or font inputs. Browser QA independently checks the final reading area and font size.

## Results and exceptions

All 30 complete YAML-backed lessons (4–33) were rebuilt: 1,300 slides, down from the intermediate 1,397. Lesson 10 now has 43 slides rather than 46. Its résumé point 12 now shares a slide with points 13–14; every reading slide in that lesson uses 32px.

Only six slides require smaller text to preserve a complete point:

| Lesson | Slide | Point | Size |
| --- | --- | --- | --- |
| 20 | 8 | Résumé 8 | 30px |
| 21 | 12 | Résumé 13 | 28px |
| 23 | 6 | Résumé 4 | 30px |
| 23 | 8 | Résumé 6 | 24px |
| 23 | 9 | Résumé 7 | 30px |
| 33 | 55 | Place 1 | 30px |

Lessons 1–3 remain blocked by incomplete or ambiguously attributed source material, as detailed in [their source audit](./2026-09-05-lessons-1-3-source-review.md). They inherit this shared policy when complete content becomes available.

## Verification

- Structural validation passed for all 30 decks.
- Full browser QA passed for all 1,300 slides at 1600 × 1000; screenshots and reports were refreshed and their counts matched the manifests.
- Generated reading text and point order matched the YAML across all 30 lessons.
- Representative Lesson 10 slides and the longest Lesson 23 point were visually inspected.
- All 16 regression tests passed. Tests cover browser-measured fit, widths, bullet heights, removal of arbitrary limits, complete point ranges, oversized-point rejection, stale layouts, and recorded overflow.
- Verification used local Chrome with bundled Playwright 1.62.1. Installation and testing of the project's pinned Playwright 1.61.1 remain unverified because npm registry access failed in this environment.

## Final slide counts

| Lesson | Slides |
| --- | --- |
| Lesson-4 | 44 |
| Lesson-5 | 41 |
| Lesson-6 | 34 |
| Lesson-7 | 50 |
| Lesson-08 | 43 |
| Lesson-09 | 44 |
| Lesson-10 | 43 |
| Lesson-11 | 41 |
| Lesson-12 | 44 |
| Lesson-13 | 47 |
| Lesson-14 | 47 |
| Lesson-15 | 26 |
| Lesson-16 | 48 |
| Lesson-17 | 41 |
| Lesson-18 | 50 |
| Lesson-19 | 41 |
| Lesson-20 | 43 |
| Lesson-21 | 48 |
| Lesson-22 | 43 |
| Lesson-23 | 31 |
| Lesson-24 | 40 |
| Lesson-25 | 40 |
| Lesson-26 | 37 |
| Lesson-27 | 46 |
| Lesson-28 | 59 |
| Lesson-29 | 42 |
| Lesson-30 | 42 |
| Lesson-31 | 38 |
| Lesson-32 | 51 |
| Lesson-33 | 56 |
