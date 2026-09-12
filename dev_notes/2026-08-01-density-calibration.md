# Global 850-character density calibration

> Superseded by the [whole-point read-aloud policy](2026-09-05-whole-point-pagination.md). The 850-character ceiling now applies only to combinations of points; a single point is never split.

Date: 2026-08-01

## Decision

All multi-item prose sections use the same deterministic pagination limits:

- Maximum 3 numbered items per slide
- Maximum 850 combined characters per slide

The rule applies to Points principaux, Résumé long, and Place de la leçon. Questions and Discussion remain teaching-flow exceptions with one question per slide or state.

## What we learned

Character count alone does not determine useful slide density. The item-count ceiling preserves readable structure, while the character ceiling prevents excessive text. Both constraints are required.

At 800 characters, Place de la leçon in Lesson 5 produced three uneven slides containing 641, 516, and 329 characters. Raising the limit to 850 paired the final two paragraphs into one 845-character slide, producing two balanced slides containing 641 and 845 characters.

The same 850-character simulation did not alter pagination in Points principaux or Résumé long. The global rule therefore improved balance without increasing their density or changing their slide counts.

## Package principle

Prefer one shared rule when it produces acceptable results across all standard prose sections. Do not introduce section-specific overrides unless repeated evidence shows that a section has genuinely different layout needs. This keeps generation, manifests, validation, and future lesson behavior easier to understand and reproduce.

## Verification expectation

Every production build must still pass both layers of QA:

1. Structural validation of item counts, character counts, sequencing, pagination, and final markers.
2. Browser rendering of every slide to detect overflow, font-loading failures, and navigation problems.
