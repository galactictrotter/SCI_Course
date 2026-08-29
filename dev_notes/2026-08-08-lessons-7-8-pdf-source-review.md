# Lessons 7 and 8 PDF source review

Date: 2026-08-08

## Sources reviewed

- `Lesson-7/Cours-de-SIC-07.pdf` — 13 A4 scanned pages
- `Lesson-08/Cours-de-SIC-08.pdf` — 10 A4 scanned pages

Both documents are image-only scans with no embedded extractable text. Their contents must therefore be transcribed from the rendered pages and visually checked against the PDFs.

## HTML deck scope

The new decks will follow the established Lesson 6 HTML workflow and contain only these sections:

1. Points principaux
2. Résumé long
3. Questions du professeur, rendered as question-only slides and paired Discussion question/answer slides
4. Place de la leçon

The PDFs also contain `Analogies - Illustrations` and `Court résumé` sections. These are intentionally excluded from the HTML decks and are not part of the canonical `content.yaml` files for Lessons 7 and 8.

## Implications for production

- Create the Lesson 7 and Lesson 8 source-folder structures and transcripts from their PDFs.
- Preserve source wording in the canonical content, logging any necessary reconstruction of visibly truncated scan text.
- Generate both decks through the shared deterministic builder and validate them against the existing pagination, sequencing, font, and browser-QA expectations.
