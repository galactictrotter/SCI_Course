# Lesson 6 production findings

Date: 2026-08-01

## Production result

Lesson 6, titled `Introduction à la Science de l'Intelligence Créatrice`, was produced from ten source screenshots using the deterministic HTML package.

The canonical content contains:

- 3 Points principaux
- 15 Résumé long items
- 8 question-and-answer pairs
- 3 Place de la leçon paragraphs

The generated deck contains 34 slides:

- 1 cover
- 1 Points principaux slide
- 6 Résumé long slides
- 8 question-only slides
- 16 paired Discussion slides
- 2 Place de la leçon slides

## Transcription findings

The source captures contained two visibly truncated fragments in the teacher answers:

- `les eff` was reconstructed as `les effets`.
- `se ra` was reconstructed as `se raffine`.

These minimal reconstructions are recorded in the Questions transcript so that the canonical teaching copy is readable without hiding uncertainty in the source.

## Typography finding

French inversion forms may wrap at ordinary hyphens in browser-rendered question text. In the long question `diffère‑t‑elle`, nonbreaking hyphens prevent an orphaned `t-` at the end of a line. Use this treatment selectively when the visual QA render shows an awkward inversion break; do not modify the global pagination or typography rules for a single phrase.

## Verification

The final deck must pass:

- schema and structural validation
- the shared 3-item / 850-character prose policy
- question-only sequencing before Discussion pairs
- `et fin` markers for all five sections
- full browser rendering at 1600 × 1000
- font loading, overflow detection, and keyboard navigation checks
- individual visual inspection of every rendered slide
