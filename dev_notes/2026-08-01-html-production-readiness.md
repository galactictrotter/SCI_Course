# HTML slide-production readiness assessment

Date: 2026-08-01

The content layer is ready, but the HTML production system is not yet implemented.

## Ready

- Standardized Lesson 5 folders
- Valid `content.yaml`
- Complete 5 / 22 / 10 / 4 content sequences
- Question-only and question-and-answer logic defined
- Design tokens and pagination rules documented

## Required for production

- Canonical 16:10 HTML slide template
- CSS design-token implementation
- YAML-to-HTML build script
- Arrow-key question-and-answer reveal logic
- Section and global pagination generator
- Automatic `et fin` markers
- Overflow and structural validation
- A repeatable production command
- Browser rendering and visual QA

## Editorial policy

The YAML faithfully preserves source wording, including apparent source-language inconsistencies. Editorial correction remains a separate, explicit pass so production does not silently change the source.

## Readiness conclusion

The material is ready to build the production package, but an HTML production build should not be considered deliverable until the template, generator, interaction logic, and validation system exist and pass browser QA.
