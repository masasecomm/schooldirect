## Goal

On the school detail page (e.g. `/south-africa/gauteng/kanana-primary-school-...`), display every block in a single vertical column. Nothing on the side. On desktop the column is centered with comfortable max width.

## Current layout

In `src/pages/SchoolDetail.tsx` (around lines 2266 and 2358), the page uses:

- An outer `grid lg:grid-cols-3` that puts "Contact information" (col-span-2) and "School details" side-by-side on desktop.
- An inner `grid md:grid-cols-2 xl:grid-cols-3` for all the data cards (Learners, Educators, Leadership, Matric, Feeder Zone, Walk-in, Calendar, Fees, Similar, Contact form).

This creates 2–3 columns on tablet/desktop.

## Change

Replace both grids with a single centered column:

1. Outer wrapper: remove `grid lg:grid-cols-3`. Use `flex flex-col gap-6 max-w-3xl mx-auto`.
2. Drop `lg:col-span-2` from "Contact information" Card and `lg:col-span-3` from the inner cards wrapper.
3. Inner cards wrapper: replace `grid gap-6 md:grid-cols-2 xl:grid-cols-3` with `flex flex-col gap-6` (or just unwrap and let cards live directly in the outer flex column).
4. Apply the same `max-w-3xl mx-auto` constraint to the `SchoolIntro` wrapper above so the whole page reads as one centered column.
5. Optionally also center the breadcrumb / title block with the same max width for visual consistency (confirm with user — see Question).

Result on every breakpoint: one card per row, full width of the column, centered on desktop, edge-to-edge on mobile (within container padding).

## Files to edit

- `src/pages/SchoolDetail.tsx` — only layout class changes around lines ~2262 and ~2266–2419. No card internals change.

## Out of scope

- Card internal layouts (charts, pictograms, tables) stay as-is.
- Header, footer, breadcrumbs, FAQ section behaviour unchanged (only optional centering).
