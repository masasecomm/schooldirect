# Fix blank AdSense unit on SchoolDetail

## Problem
The 300x600 skyscraper between the details and enrolment sections renders blank. The markup and slot ID match the snippet you pasted, so the issue is how the React component drives AdSense in a SPA, not the slot config.

Two known AdSense-in-React failure modes are present in `AdSenseSkyscraper` (`src/pages/SchoolDetail.tsx` lines 177–210):

1. **Double push on the same `<ins>`** — React 18 StrictMode mounts effects twice in dev, and SPA navigation re-mounts the component. Calling `adsbygoogle.push({})` on an `<ins>` that already has `data-adsbygoogle-status="done"` (or `"unfilled"`) throws *"All 'ins' elements... already have ads in them"* and the slot stays blank.
2. **Zero-width parent at push time** — if the `<ins>` is measured at 0px wide when push runs (e.g. inside a collapsed flex parent on first paint), AdSense marks it `unfilled` and never retries.

## Fix (single file: `src/pages/SchoolDetail.tsx`)

Rewrite `AdSenseSkyscraper` so each mount gets a fresh `<ins>` and only pushes once after the element has real width:

- Use a `ref` to the `<ins>` and a `pushedRef` guard so we never push twice.
- Before pushing, check `ins.getAttribute('data-adsbygoogle-status')` is null (not yet processed).
- Wait for the ins to have `offsetWidth > 0` (poll up to ~10s) before pushing, so the unit fills reliably on slow first paints.
- Add `data-full-width-responsive="false"` and keep the fixed 300x600 inline style (matches your snippet).
- Force a fresh DOM node on route change by giving the wrapper a `key` derived from the school slug at the call site.

No other components, routes, styles, or business logic change. The global loader script in `index.html` stays as-is.

## Out of scope
- No new ad units, no layout/visual changes, no changes to other pages.
- No edits to `index.html` (loader is already correct).
