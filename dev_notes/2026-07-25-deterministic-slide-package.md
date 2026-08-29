# Repeatable deterministic slide-generation package

Date: 2026-07-25

## Objective

Turn the established Cours de SIC lesson workflow into a reference-backed template and deterministic slide generator. Screenshots provide only the content; the package controls every design and sequencing decision.

## Proposed package structure

```text
sci-course-deck/
├── template/
│   └── canonical-deck.pptx
├── config/
│   ├── design-tokens.json
│   └── lesson.schema.json
├── lessons/
│   └── lesson-05/
│       ├── 01/
│       ├── 02/
│       ├── 03/
│       ├── 04/
│       └── content.yaml
├── src/
│   ├── transcribe.mjs
│   ├── paginate.mjs
│   ├── build-deck.mjs
│   └── validate-deck.mjs
└── package.json
```

## Structured content model

```yaml
lesson:
  number: 5
  title: "Titre de la leçon"

points_principaux:
  - "Premier point…"
  - "Deuxième point…"

resume_long:
  - "Premier paragraphe…"
  - "Deuxième paragraphe…"

questions:
  - question: "Première question ?"
    answer: "Première réponse."

place_de_la_lecon:
  - "Premier paragraphe…"
```

## Fixed build logic

Every lesson generates the following sequence:

1. Cover
2. Points principaux
3. Résumé long
4. Questions-only sequence
5. Discussion sequence:
   - question slide
   - matching question-and-answer slide
6. Place de la leçon

The paired Discussion slides provide reliable arrow-key response reveals.

The generator automatically enforces:

- Section pagination starting at `1`
- `et fin` on every section's final slide
- Global `x of y` pagination
- Questions-only slides before Discussion
- One question per slide
- Matching question and response ordering
- Two paragraphs per slide where appropriate
- Consistent section names and footer text

## Frozen design tokens

- Background: `#F7F5F0`
- Text: `#141414`
- Red: `#C94C3B`
- Titles: EB Garamond
- Headers and footers: Barlow Condensed
- Main text: Lora
- Fixed font sizes, margins, text-block heights and positions
- Fixed aspect ratio
- Fixed footer position and spacing rules

Future generations should not make independent visual decisions.

## Deterministic validation

The validator should fail the build if it finds:

- Incorrect section numbering
- Missing or misplaced `et fin`
- Incorrect global pagination
- Missing questions or answers
- Question-and-answer ordering errors
- Wrong fonts, colors or background
- Unexpected slide dimensions
- Overflowing text
- Empty slides or unresolved source codes
- Design elements outside permitted coordinates

## Intended command

```bash
npm run lesson -- lessons/lesson-05
```

The command should:

1. Transcribe the screenshots.
2. Create the Markdown transcript files.
3. Validate `content.yaml`.
4. Generate a fresh deck from the canonical template.
5. Run structural and visual checks.

## Packaging recommendation

Package the workflow as both:

- A repository generator, which guarantees deterministic behavior.
- A personal Codex presentation template, which provides a convenient entry point for each new lesson.
