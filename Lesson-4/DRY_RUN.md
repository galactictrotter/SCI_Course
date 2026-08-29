# Lesson 4 dry run

Status: ready for deck generation.

## Source check

- `01 Points_Principaux`: 3 screenshots
- `02 Resume_long`: 8 screenshots
- `03 QA_Professeurs`: 5 screenshots containing 11 questions and answers
- The lesson title indicated by the source material is: **Connaissance de la SIC par l’expérience personnelle**.

## Repeatable deck structure

1. Cover and lesson content
2. Points principaux
3. Résumé long
4. Question-only section for student work
5. Paired discussion sequence: question-only slide followed by the matching question-and-answer slide

## Resolved risks

- Source screenshots have inconsistent dimensions; the deck will normalize them to the established 16:9 layout.
- The source QA pages combine questions and answers; they will be separated into question-only and question-plus-answer slides.
- Native click animations are not available through the connected Slides API; paired slides provide the same presentation sequence with the second click advancing to the answer.
- The established borderless, left-aligned, whitespace-based design tokens will be applied to every generated slide.
