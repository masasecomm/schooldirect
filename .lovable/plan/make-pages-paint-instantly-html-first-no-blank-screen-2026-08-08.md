# Make pages paint instantly (HTML-first, no blank screen)

## What's happening now

The deployed site ships an empty `index.html` with `<div id="root"></div>`. The browser must download and execute the React bundle, then the router picks the page, then content appears — that's the ~5 seconds of white screen.

A prerender script already exists (`scripts/prerender.mjs`) that writes fully-rendered static HTML for every route, but the GitHub Pages workflow only runs it when someone manually triggers the workflow with `prerender: true`. Normal pushes deploy the empty shell.

## Can it be pure HTML and CSS?

Partly, and that's the right goal. Rather than rebuilding the whole site as hand-written HTML (which would mean losing the filters, province browsing, rating dialog and contact form), the plan is:

- Every page is served as real, complete HTML + CSS — visible instantly, crawlable, no blank flash.
- JavaScript still loads afterwards, in the background, only to power the interactive bits (filters, menus, dialogs). If it never loads, the page still reads fine.

That gives AMP-like speed without throwing away functionality.

## Plan

1. **Always prerender on deploy**
   Change the GitHub Pages workflow to run `node scripts/prerender.mjs` on every push, not only on manual dispatch. Result: each route ships static HTML with its text, headings, meta tags and JSON-LD already in the file.

2. **Inline critical CSS + preload the stylesheet**
   Ensure the prerendered HTML carries the stylesheet link early so text and layout paint without waiting for JS.

3. **Defer the JS so it never blocks paint**
   Keep the module script deferred and drop render-blocking third-party work from the head: self-host or `font-display: swap` the Inter font (currently a blocking Google Fonts stylesheet), and keep AdSense/analytics on the existing idle-callback path.

4. **Trim the first-load JavaScript**
   - Make the landing page not pull in the heavy shared UI it doesn't need (sheet/menu, tooltip provider, toasters, react-query) — load those only where used.
   - Confirm the multi-MB school data stays out of the entry chunk and is fetched per-route only.

5. **Prerender build reliability**
   The site has ~26k routes; prerendering all of them on every push is slow. Prerender the high-value routes on every push (home, country and province directories, admissions, special needs, WCED) and keep the full school-page prerender as the manual/scheduled run.

## Technical notes

- Files touched: `.github/workflows/deploy-github-pages.yml`, `scripts/prerender.mjs` (route filtering + optional full mode), `index.html` (font loading), `src/App.tsx` and `src/pages/Landing.tsx` (provider/import slimming).
- No data, routing, or content changes — URLs stay identical.
- Verification: build locally, inspect a prerendered `dist/.../index.html` to confirm visible text is present in the file, and check the entry JS size.
