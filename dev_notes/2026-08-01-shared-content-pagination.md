# Shared pagination policy and teaching-flow exceptions

Date: 2026-08-01

## Decision

Use one shared pagination rule for all multi-item prose sections:

- Maximum 3 numbered items per slide
- Maximum 850 combined characters per slide

The shared rule applies to:

- Points principaux
- Résumé long
- Place de la leçon

## Exceptions

Questions and Discussion remain explicit exceptions because their sequencing serves the classroom workflow:

- Questions: exactly one question per slide
- Discussion: one question-only slide followed by one slide containing the same question and its response

These exceptions ensure that students first receive all questions individually, then reconvene for the question-and-response sequence.

## Implementation requirement

The shared limits must live in `config/design-tokens.json`, not as separate values inside the builder. The manifest must record the active policy, and validation must reject slides that exceed either shared limit. Questions and Discussion must continue to be validated against their one-question rules.
