# Project audit — 2026-09-05

Scope: the shared Ruby slide generator, templates, validator, browser QA runner, build commands, and all 30 lessons with `content.yaml`. Source wording was not edited.

## Findings and changes

- **Stale Lesson 4 output:** its manifest lacked the current pagination policy. Rebuilt the deck from the existing YAML; the shared pagination policy produces 45 slides instead of 50. Refreshed its browser report and screenshots, removing the five obsolete screenshots.
- **Incomplete structural validation:** HTML articles could be removed without detection because only manifest counts and footer text were checked. Validation now compares HTML slide IDs and titles, enforces section sequence/index/final-marker consistency, checks section counts and lesson metadata, and verifies all six bundled fonts against their source bytes.
- **Inconsistent input validation:** build and validate now share content checks, reject unknown fields as required by the schema, and report malformed YAML clearly. Invalid or legacy manifests produce actionable errors instead of stack traces.
- **Parallel build race:** `make -j production` previously allowed validation to run alongside the build. Validation now runs after the build succeeds. Lesson arguments are quoted.
- **Destructive QA startup:** a failed browser launch previously erased the last screenshots. QA now captures into a temporary directory, preserves prior artifacts if inspection crashes, and closes the browser in a `finally` block. URL-to-path conversion now handles paths containing spaces.
- Added 12 regression tests using Node's built-in test runner and isolated temporary fixtures. Documented prerequisites and test commands.

## Verification

- `npm test`: 12 tests passed, including deliberate artifact corruption and browser launch failure.
- `make -j4 production LESSON=Lesson-4`: passed.
- Structural validation: 30 of 30 YAML-backed lessons passed.
- Lesson 4 browser QA: all 45 slides passed at 1600 × 1000; fonts loaded, no reported overflow, and navigation passed. Spot-checked a rendered screenshot.
- `git diff --check`: passed.

## Limits and follow-up

- Registry DNS was unavailable during `npm install`. Browser QA used the installed runtime's Playwright 1.62.1 with local Google Chrome; the package pins 1.61.1. A fresh install of the pinned dependency remains unverified.
- Other lessons received structural validation, not fresh browser QA. Lessons without `content.yaml` and historical alternate decks are outside the generator checks.
- Validation is structural, not an HTML integrity signature: it does not prove that every body paragraph matches source text or that an unchanged-content deck reflects the latest templates. Browser QA remains necessary after template or layout changes.
- No editorial or factual assessment of lesson material was performed.
