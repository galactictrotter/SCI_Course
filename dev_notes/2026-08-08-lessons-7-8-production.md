# Lessons 7 and 8 HTML production

Date: 2026-08-08

## Source scope

The scanned PDFs were rendered and reviewed page by page. Their embedded text layer is empty, so the approved source material was transcribed from the page images.

The HTML decks include only the established four-section workflow:

1. Points principaux
2. Résumé long
3. Questions du professeur and paired Discussion answers
4. Place de la leçon

`Analogies - Illustrations` and `Court résumé` are intentionally excluded, as agreed for both lessons.

## Generated packages

| Lesson | Slides | Points | Résumé long | Questions | Discussion states | Place |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 55 | 1 | 16 | 12 | 24 | 1 |
| 8 | 48 | 2 | 10 | 11 | 22 | 2 |

Each package has a canonical `content.yaml`, four source-section transcript folders, a generated standalone HTML deck, manifest, bundled fonts, and per-slide browser-QA renders.

## Verification

Both decks passed the deterministic structural validator. Browser QA rendered every slide at 1600 × 1000, verified the three bundled font roles, exercised Right Arrow, End, and Home navigation, and reported no overflow or failures.

The generated PNGs were visually reviewed as complete slide sequences, with dense question-and-answer and final-section slides additionally inspected at full size. No clipping, overlap, or broken pagination was found in the rendered decks.
