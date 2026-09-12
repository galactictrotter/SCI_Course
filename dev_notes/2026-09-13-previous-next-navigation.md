# Previous and next slide buttons

Date: 2026-09-13

Added the supplied `arrow-left.svg` and `arrow-right.svg` to the shared footer. The order is lesson menu, first slide, previous slide, section dropdown, next slide, last slide. The new buttons use the same slide navigation function as the keyboard and disable at the first/last slide. Accessible labels and tooltips identify both actions.

Left/right keyboard navigation remains active while a slide-navigation button has focus, allowing users to switch between mouse and keyboard. Dropdown and lesson-menu keyboard handling is preserved. No reading layout or slide grouping changed.

The regression and browser navigation checks exercise both directions, both endpoint states, and keyboard arrows immediately after button clicks. All complete lessons are rebuilt from the shared template.

Validation: all 18 regression tests passed; all 30 complete decks (1,300 slides) passed structural and browser QA with refreshed screenshots. The wider control group was visually inspected at 1600 × 1000 and 1024 × 768.
