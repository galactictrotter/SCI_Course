# Shared footer navigation

Date: 2026-09-12

## Request and implementation

The area between the course label and page counter now contains a persistent centered navigation group. It uses the supplied `menu.svg`, `arrow-left-to-line.svg`, and `arrow-right-to-line.svg` icons without changing their paths or proportions. Controls use the existing Barlow Condensed typeface, palette, and footer alignment. Reading text, slide grouping, and page counts remain unchanged.

- The lesson menu lists 01–33 with source titles, highlights the current lesson, and scrolls to accommodate long titles. Links use the real directory names, including Lesson-08 and Lesson-09.
- The first/last buttons go to the current lesson's endpoints and disable at those endpoints.
- The section dropdown sits between those buttons, targets each section's first generated page, and stays synchronized with keyboard and hash navigation. The cover is included as “Titre de la leçon”.
- Menu dismissal supports Escape, outside click, leaving the controls, and selecting the current lesson. The lesson list supports arrow keys and Home/End. Native dropdown and button keyboard input no longer triggers global slide shortcuts.
- Interactive controls are hidden in print. Navigation appears once per deck, outside hidden slide articles, avoiding duplicate focus targets.

## Audit findings

The footer has sufficient horizontal space for the requested controls. Reading content ends above the controls; browser QA additionally checks actual text rectangles on every slide, including Q&A, for collisions.

The earlier global key handler intercepted arrow, Home/End, Space, and F keys regardless of focused element. It now leaves control keyboard behavior intact. Selecting the current lesson also explicitly closes the menu when already at page 1, where no hash change would fire.

The course menu cannot provide missing material. Lessons 1–3 have no complete decks and are disabled. Lesson 2 has a confirmed title; titles for Lessons 1 and 3 remain “Titre à confirmer”. The source gaps are recorded in [the early-lesson audit](./2026-09-05-lessons-1-3-source-review.md).

Cross-lesson navigation needs the course folder structure, locally or on a host. Moving only one HTML deck does not carry the other lesson destinations with it.

## Verification

Structural validation compares the generated footer with its source catalog and actual section starts. Build signatures include the icons, navigation source, and lesson catalog so changed titles or folder names cannot silently leave stale menus.

Browser QA covers all section jumps, endpoint buttons, menu entry count and destination existence, keyboard isolation, Escape focus restoration, outside-click dismissal, and print hiding. Regression tests additionally cover a damaged footer, the current-lesson link from both another slide and the cover, and control placement at a smaller viewport. Screenshots were visually reviewed at 1600 × 1000 and 1024 × 768.

Final results: all 30 decks rebuilt and structurally validated, all 18 regression tests passed, and all 1,300 slides passed full browser QA with no footer overlap. Every available cross-lesson destination was also clicked and its title and first slide verified. Reports and screenshot counts match all manifests. Lesson 16 had one screenshot timeout during concurrent QA and passed its isolated rerun. Verification used local Chrome and the bundled Playwright runtime; the earlier limitation on testing a fresh pinned npm install remains.

[Lesson 10 menu preview](../Lesson-10/slides/navigation-menu.png)
