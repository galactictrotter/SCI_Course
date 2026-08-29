# Lessons 9 and 10 HTML production

Date: 2026-08-15

## Source scope

The scanned lesson PDFs were rendered and reviewed page by page. Their embedded text layers are empty, so the approved presentation material was transcribed from the page images.

The HTML decks follow the established lesson sequence:

1. Points principaux
2. Résumé long
3. Questions du professeur
4. Discussion, with paired question and answer states
5. Place de la leçon

`Analogies - Illustrations` and `Court résumé` are intentionally excluded, consistently with Lessons 7 and 8.

## Generated packages

| Lesson | Slides | Point items | Résumé items | Questions | Discussion states | Place paragraphs | Place slides |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 9 | 49 | 5 | 23 | 10 | 20 | 6 | 3 |
| 10 | 46 | 5 | 21 | 10 | 20 | 3 | 3 |

Each package contains a canonical `content.yaml`, four source-section transcript folders, a generated standalone HTML deck, manifest, bundled fonts, and per-slide browser-QA renders.

## Place de la leçon completeness

The final section was transcribed in full for both lessons. Every source paragraph is represented by exactly one numbered `place_de_la_lecon` item: six numbered points for Lesson 9 and three numbered points for Lesson 10. Pagination may place more than one numbered paragraph on a slide, but no paragraph is merged, summarized, or omitted.

## Source fidelity

The transcriptions preserve source wording, including several grammatical or typographical quirks in the printed material. One visibly incomplete spelling in Lesson 10, `apliquée`, was normalized to `appliquée`; all other source-specific wording was retained. Non-breaking spaces before question marks prevent orphan punctuation in the question slides.

## Verification

Both decks passed the deterministic structural validator. Browser QA rendered all 95 slides at 1600 × 1000, verified the bundled font roles, exercised keyboard navigation, and reported no overflow or failures.

The complete rendered sequences were visually reviewed at full size. No clipping, overlap, broken pagination, or missing paragraph was found.
