# Lessons 13–33 HTML presentation production

## Scope

Lessons 13 through 33 were produced from the 21 scanned course PDFs in `source_files/`. The source set contains 199 image-only pages, so the text was recovered by French OCR and checked against page images wherever recognition was ambiguous.

Each lesson now contains the same four-section source structure used by the existing workflow:

1. Points principaux
2. Résumé long
3. Questions / réponses
4. Place de la leçon

The dedicated source sections **Analogies - Illustrations** and **Court résumé** are intentionally omitted from every generated HTML deck. Questions that mention an analogy remain when they belong to the source Questions / réponses section.

## Produced files

Every `Lesson-13` through `Lesson-33` directory contains:

- four section transcript notes;
- `content.yaml`, which is the editable source of truth;
- `slides/index.html`, a standalone 1600 × 1000 HTML deck;
- `slides/manifest.json`;
- locally bundled font assets;
- `slides/qa-report.json`;
- one full-slide QA PNG for every generated slide.

| Lesson | Points | Résumé | Q/R | Place | Slides |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 13 | 4 | 15 | 11 | 4 | 52 |
| 14 | 9 | 31 | 10 | 1 | 52 |
| 15 | 6 | 12 | 5 | 2 | 30 |
| 16 | 5 | 25 | 11 | 2 | 51 |
| 17 | 6 | 24 | 10 | 4 | 43 |
| 18 | 5 | 17 | 12 | 3 | 54 |
| 19 | 4 | 17 | 10 | 3 | 47 |
| 20 | 5 | 11 | 10 | 5 | 50 |
| 21 | 6 | 13 | 11 | 5 | 56 |
| 22 | 7 | 13 | 10 | 6 | 46 |
| 23 | 3 | 7 | 7 | 2 | 38 |
| 24 | 3 | 16 | 9 | 5 | 42 |
| 25 | 5 | 10 | 10 | 2 | 45 |
| 26 | 3 | 11 | 8 | 8 | 41 |
| 27 | 8 | 17 | 10 | 5 | 56 |
| 28 | 5 | 8 | 15 | 15 | 66 |
| 29 | 4 | 9 | 10 | 2 | 46 |
| 30 | 6 | 10 | 10 | 4 | 46 |
| 31 | 4 | 12 | 8 | 2 | 44 |
| 32 | 3 | 12 | 12 | 3 | 56 |
| 33 | 3 | 14 | 13 | 2 | 59 |
| **Total** | **104** | **304** | **212** | **85** | **1,020** |

## Workflow updates

The shared renderer now splits source items longer than 850 characters into continuation slides. Continuations retain the original item number and add a visible `suite` label; the source wording and order are preserved.

Long lesson titles use a two-line title treatment. Title elements were added to the browser overflow checks, so title clipping is reported in the same way as body clipping.

Lessons 14 and 15 preserve their source comparisons as paired SIC/Physique and SIC/Biologie entries. Lesson 31 contains three visibly incomplete source fragments; they are identified as incomplete rather than silently completed or invented.

## Validation

All 21 lessons passed the deterministic validator after the final source cleanup. Browser QA then visited all 1,020 slides at the native 1600 × 1000 viewport and verified:

- bundled font loading;
- keyboard navigation;
- slide count and order;
- title and body overflow;
- screenshot generation.

Every final QA report has an empty `overflow_slides` list and an empty `failures` list. The final QA artifact set contains exactly 1,020 PNGs. Full-size visual inspection covered comparison, dense continuation, closing, and incomplete-source slides in addition to the automated checks.

## Repository boundary

The publication repository excludes `source_files/`, every PDF, and every ZIP archive. Generated HTML, YAML, transcripts, manifests, fonts, QA reports, and QA screenshots remain part of the repository.
