## SEO + Performance Hardening Plan

The site already has a strong foundation: per-school titles/descriptions, JSON-LD for `School`, `WebPage`, `BreadcrumbList`, `FAQPage`, a build-time XML sitemap, and `robots.txt`. The big gaps are:

1. **It is a client-rendered SPA** — Google can render JS, but most other crawlers (Bing, social previews, AI bots, smaller search engines) see an empty `<div id="root">`. This is the single biggest SEO win.
2. **`index.html` metadata is stale** ("Gauteng Schools Directory 2023", points to `lovable.dev` OG image, canonical is `/`).
3. **Schema coverage on a school "article" page can be richer** (LocalBusiness, Person for principal, ItemList for nearby schools, Article/Dataset where appropriate).
4. **Performance**: Google Fonts blocking request, no image lazy-loading conventions, no preloading of the school JSON, no code splitting for heavy routes.

### What you will get

- Every page (home, Gauteng list, every school detail, about, admissions) shipped as **pre-rendered static HTML** with full meta tags + JSON-LD already in the source. Crawlers and social previews work instantly. No backend needed.
- Correct, unique `<title>`, description, canonical, OG and Twitter tags on every URL.
- Richer structured data per school: `School` + `LocalBusiness` + `Person` (principal) + `ItemList` (nearby schools) + `BreadcrumbList` + `FAQPage` + `WebPage`. Optional `Dataset` on the Gauteng list page.
- A proper `sitemap.xml` (already there) plus a `sitemap-index.xml`, image sitemap entries, and `lastmod` driven by data file mtimes (not "today").
- Smaller, faster pages: self-hosted variable Inter font, route-level code-splitting, `loading="lazy"` + `decoding="async"` on images, `<link rel="preload">` for the current year's school JSON, and removal of the Lovable tagger from production.

### Steps

1. **Prerender to static HTML (biggest SEO lift)**
   - Add `vite-react-ssg` (or `react-snap` as fallback) to the build.
   - At build time, walk every route from the sitemap (~3,000 school slugs + static pages) and emit one `index.html` per route with React rendered to string and `react-helmet-async` flushed into `<head>`.
   - Output goes to `dist/` so cPanel serves real HTML — no SPA fallback needed for crawlers.

2. **Fix `index.html` defaults**
   - Update title/description/canonical/OG image to match current site ("School Direct — Find a school in Gauteng").
   - Replace the `lovable.dev` OG image with a hosted one in `/public/og/default.png`.
   - Remove the Lovable Twitter handle.
   - Add `<link rel="preconnect">` only if we keep Google Fonts (we won't — see step 6).

3. **Expand Schema.org per school page**
   - Keep current `School` + `WebPage` + `BreadcrumbList` + `FAQPage`.
   - Add a second type to the school node: `["School", "EducationalOrganization", "LocalBusiness"]` so it qualifies for local pack results, with `priceRange` ("Free" for no-fee, "R" for fee-paying), `openingHours`, `image`.
   - Add `Person` node for the principal, linked from the school via `employee`.
   - Add `ItemList` for the "Nearby schools" block already on the page.
   - Add `Article` schema for the intro paragraph (`headline`, `datePublished`, `dateModified`, `author: School Direct`) so the page can show "Last updated" in SERPs.
   - Wire `dateModified` to the data file's actual mtime, not `new Date()`.

4. **Sitemap improvements**
   - Use the data JSON file's mtime for each school's `<lastmod>` instead of today's date.
   - Add `<image:image>` entries where we have a school image.
   - Split into `sitemap-schools.xml` + `sitemap-static.xml` and add `sitemap-index.xml` (Google handles up to 50k per file fine but indexing is cleaner).
   - Add `Sitemap:` lines to `robots.txt` for each.

5. **List/landing pages**
   - Gauteng list page: add `CollectionPage` + `ItemList` JSON-LD with the visible schools (first page only, paginated rel-prev/next via `<link>`).
   - Add unique `<title>`/`<meta description>` per filter combination using react-helmet-async.

6. **Performance**
   - Drop the blocking Google Fonts `<link>`. Self-host Inter variable woff2 in `/public/fonts/` with `font-display: swap` declared in `index.css`. Saves ~200ms TTFB on first load and removes a third-party request.
   - Vite: enable manual chunks so `recharts`, `@radix-ui/*`, and the schools JSON each split out. Today everything ships in one bundle.
   - `vite.config.ts`: add `build.cssCodeSplit: true` (default), `build.target: "es2020"`, and `esbuild.legalComments: "none"`.
   - Add `loading="lazy"` and `decoding="async"` to every `<img>` not in the first viewport.
   - Preload only the current year's `schools-2025.json` via `<link rel="preload" as="fetch" crossorigin>`.
   - Strip `lovable-tagger` from production (already mode-gated, verify).

7. **Misc SEO polish**
   - Add `hreflang="en-ZA"` self-reference link tag on every page.
   - Add `<link rel="alternate" type="application/rss+xml">` only if you want a feed (skip unless you ask).
   - Add a humans-readable `/sitemap` HTML page linking to district indexes — helps both users and crawlers crawl the long tail.
   - Add `Organization` JSON-LD on the home page with `logo`, `sameAs` (your social links if you have them).
   - Verify Core Web Vitals locally with `npm run build && npx serve dist` and Lighthouse — target 95+ on all four scores.

### Technical notes

- Prerendering ~3,000 routes adds ~30-60s to the build but is one-shot at deploy time. The cPanel deploy workflow already exists (`deploy-cpanel.yml`) — only the artifact contents change, not the pipeline.
- React 18 + `renderToString` + `react-helmet-async`'s `HelmetProvider` collect head tags per route; we inject them into a per-route `index.html` template.
- Routes that depend on `useYear` context will be prerendered with the default year (2025); the year switcher continues to work client-side.
- All current behaviour stays — this is purely additive.

### Out of scope (ask if you want them)

- Translating pages (Afrikaans, isiZulu) — would require content + hreflang variants.
- Server-side rendering with a live Node host — prerendering is enough and runs on cPanel static hosting.
- AMP — deprecated by Google, not worth it.
- Paid SEO tools / Google Search Console wiring — manual one-time setup on your side.
