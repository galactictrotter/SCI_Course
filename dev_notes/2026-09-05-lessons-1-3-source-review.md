# Lessons 1–3 — source audit and corrections

Audit date: 2026-09-05. Scope: source coverage, transcription accuracy, lesson attribution, and readiness for the shared HTML production pipeline. This is not a factual review of the teachings.

## Clearly missing from the available project sources

| Lesson | Required source material still missing |
| --- | --- |
| 1 | Official title, main points, résumé long, and positively identified question/answer pages |
| 2 | Résumé long |
| 3 | Official title and Place de la leçon |

Lesson 2's probable Q&A and context pages exist, but their lesson attribution remains unconfirmed because no number is visible. This is an attribution uncertainty, not an absence of text.

Additional supporting material is absent: the teaching examples referenced by the unnumbered Q&A's answer 10, and the illustrations referenced by Lesson 3's answer 13. These references have been preserved; no substitute answers were invented.

## Inventory and attribution

| Current location | Inspected source coverage | Attribution |
| --- | --- | --- |
| `Lesson-2/01 Points_Principaux` | 2 PNGs and transcription: title, 2 main points, 7 objectives under point 2 | Explicit **Leçon 2** heading. Moved from Lesson-1. |
| `Lesson-1/02 QA_Professeurs` | 3 PNGs and transcription: 10 complete Q&A pairs | Unnumbered. Objectives and World Plan questions suggest Lesson 2; not yet confirmed. |
| `Lesson-1/03 Place_Lesson_Dans_Cours` | 2 PNGs and transcription: 3 paragraphs on experience and knowledge | Explicit reference to “cette première leçon”. |
| `Lesson-1/04 Place lesson dans le cours` | 2 PNGs and transcription: 3 different paragraphs on possibilities, knowledge/action/fulfillment, and the torch analogy | Unnumbered. Strong wording/subject match with Lesson 2. |
| `Lesson-3/01 Points_Principaux` | 2 PNGs and transcription: points 1–7 | Second image footer explicitly reads **Leçon 3**. |
| `Lesson-3/02 Resume_long` | 7 PNGs and transcription: items 1–22 | Lesson 3 file grouping; all numbered items present. |
| `Lesson-3/03 QA_Professeurs` | 5 PNGs: questions and answers 1–13 | Lesson 3 file grouping; answers recovered into `questions_reponses.md`. |
| `Lesson-3/04 Place lesson dans le cours` and `05 Place_Lesson_Dans_Cours` | Only `.DS_Store` in each | No source content. |

Every early-lesson screenshot has been visually inspected across this audit and its preceding source checks. All existing transcriptions were read. The two context texts under Lesson-1 are distinct, not duplicates, and neither is labelled Résumé long.

The source PDF directory and both ZIP inventories contain only Lessons 11–33. No missing early-lesson sections were found there. There was no Lesson-2 directory before this correction.

## Fixes applied

1. Moved the explicitly labelled Lesson 2 main-point folder from `Lesson-1/01 Points_Principaux` to `Lesson-2/01 Points_Principaux`. Verified every moved file's SHA-256 before and after; all bytes are unchanged. Added folder README files with current paths, attribution, and missing-source status. Unnumbered material remains at its original location.
2. Corrected the unnumbered Q&A's answer 1 to **Le repos et l'activité.** The screenshot at 8.09.54 p.m. supports this; the earlier Markdown incorrectly said **L'expansion et l'activité.**
3. Recovered all 13 Lesson 3 answers from `01.png` through `05.png` into `questions_reponses.md`, with image links. Corrected question 8 to **Guru Dev** in both Q&A files; `04.png` establishes this wording.
4. Corrected Lesson 3 résumé item 15 from **Nous remarquerons** to **Nous remarquons**, matching `Cours-de-SIC-Lecon-3-Resume-Long-5.png`.
5. Preserved answer 1's unusual numbered line layout in a Markdown code block so it does not collapse when displayed. The phrase beside 6 continues beside 7; its intended division needs the original page or editorial clarification before slide adaptation.

Existing punctuation, typography, and clear grammatical normalizations remain in place. Examples: the unnumbered Q&A's “un meilleure” → “une meilleure” and “ma paix” → “la paix”; Lesson 3's main-point “les buts de la pratique”; curly apostrophes and reflowed lines. These are distinguished from the substantive transcription corrections above. The main-point and résumé item sequences have no gaps.

## Verification and production status

- Moved files are byte-identical to their originals.
- Checked contiguous item numbering: 2 Lesson 2 main points, 10 unnumbered Q&A pairs, 7 Lesson 3 main points, 22 résumé items, and 13 questions/answers in both Lesson 3 Q&A views.
- Checked the new README and recovered-answer links resolve locally and both Lesson 3 question lists agree.
- `git diff --check` passes.

The corrections and source organization are complete for the material available. Complete production `content.yaml` files and decks for Lessons 1–3 remain blocked by the missing sources listed above. No placeholders, guessed official titles, invented answers, or cross-lesson content substitutions were added.
