# Whole-point pagination for online read-aloud sessions

Date: 2026-09-05

Superseded by [browser-measured whole-point pagination](./2026-09-05-rendered-fit-pagination.md). The 850-character and three-point ceilings below are historical, not active.

## Classroom requirement

Students read numbered points aloud to other students online. A point must remain on one slide so the reader can finish it without a page change. This replaces the previous policy that split long items into `suite` fragments.

## Superseded intermediate rule

- Break only between complete source points, preserving their wording, bullets, order, and numbers.
- Combine at most three points and at most 850 characters per slide. These are ceilings for combinations, not targets to fill.
- Put a point longer than 850 characters on its own slide, complete. Never split at a sentence or word boundary.
- Choose the fewest feasible slides, then balance their text amounts by minimizing the sum of squared differences from the character ceiling. This avoids preventable three-plus-one and nearly-full-plus-tiny page groupings.
- Keep the existing font sizes for ordinary slides; use 24px for prose above 1,400 characters. No automatic shrinking below 24px was added. Browser QA must catch any future whole point that cannot fit.
- Preserve the questions-only and paired discussion sequence.

The strategy and limits live in `config/design-tokens.json`; the algorithm is in `src/pagination.rb`. Validation allows a single long point above the character ceiling, checks every source number appears exactly once and in order, and rejects continuation markup. Tests verify exact complete-point preservation across every YAML-backed lesson, including bullet lists and long points.

## Results

All 30 YAML-backed lessons were rebuilt. Total slides decreased from 1,431 to 1,397. Résumé slides below 180 characters decreased from six to zero; main-point slides below that threshold decreased from eight to two. Some short standalone slides remain where adjacent whole points cannot be combined within the limits.

Illustrative changes:

- Lesson 13 main points: 444 / 52 characters became 196 / 300.
- Lesson 13 résumé point 6: formerly split into 763 / 114 characters; now stays complete on one slide.
- Lesson 23 résumé point 6: all 2,234 characters stay together, visually checked at 24px.

Source YAML was unchanged. Decks, manifests, QA reports, and screenshots were regenerated; obsolete screenshots were removed by the QA runner. Lessons 1–3 still await the missing sources documented in their source audit.

## Verification

- 17 regression tests passed.
- Structural validation passed for all 30 lessons.
- Browser QA passed across the 30 rebuilt decks at 1600 × 1000, covering overflow, fonts, and navigation. The longest point was additionally inspected at the larger 24px size and Lesson 23's screenshots refreshed afterward.
- The browser check uses local Chrome and bundled Playwright 1.62.1; fresh installation of the pinned npm version remains unverified from the earlier audit.

## Slide counts

| Lesson | Before | After |
| --- | --- | --- |
| Lesson-4 | 45 | 45 |
| Lesson-5 | 43 | 43 |
| Lesson-6 | 34 | 34 |
| Lesson-7 | 55 | 55 |
| Lesson-08 | 48 | 48 |
| Lesson-09 | 49 | 49 |
| Lesson-10 | 46 | 46 |
| Lesson-11 | 45 | 45 |
| Lesson-12 | 46 | 46 |
| Lesson-13 | 52 | 50 |
| Lesson-14 | 52 | 51 |
| Lesson-15 | 30 | 30 |
| Lesson-16 | 51 | 51 |
| Lesson-17 | 43 | 43 |
| Lesson-18 | 54 | 54 |
| Lesson-19 | 47 | 47 |
| Lesson-20 | 50 | 48 |
| Lesson-21 | 56 | 51 |
| Lesson-22 | 46 | 46 |
| Lesson-23 | 38 | 33 |
| Lesson-24 | 42 | 42 |
| Lesson-25 | 45 | 45 |
| Lesson-26 | 41 | 40 |
| Lesson-27 | 56 | 54 |
| Lesson-28 | 66 | 61 |
| Lesson-29 | 46 | 43 |
| Lesson-30 | 46 | 46 |
| Lesson-31 | 44 | 40 |
| Lesson-32 | 56 | 54 |
| Lesson-33 | 59 | 57 |
