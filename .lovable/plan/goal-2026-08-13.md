Remove the data-sources line from the site footer

## Goal
Remove the footer text that lists all education departments: "Data sources: Gauteng Department of Education · ... · Singapore Ministry of Education".

## Current state
`src/components/schools/SiteFooter.tsx` renders two footer lines:
1. Copyright / tagline
2. "Data sources: {activeDepts}"

The `activeDepts` variable is read from `src/data/_generated/landing-summary.json` and joined with " · " in the component.

## Changes
1. In `src/components/schools/SiteFooter.tsx`:
   - Remove the "Data sources" paragraph.
   - Remove the now-unused `activeDepts` constant.
   - Keep the copyright / tagline paragraph and the existing styling/layout.

2. Verify the footer still compiles and the remaining content is centered/aligned correctly.

## Out of scope
- No changes to `src/data/_generated/landing-summary.json` or `scripts/generate-landing-summary.mjs`.
- No changes to other pages or components.
