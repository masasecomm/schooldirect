## Goal

Give the school detail page (e.g. `/south-africa/gauteng/...`) the same visual header as the home page: a full-width blue gradient hero with the `SiteHeader` floating on top in light colors, and the school's title block centered inside it. Below the hero, the existing centered single-column content stays as-is.

## Current state

In `src/pages/SchoolDetail.tsx` (around lines 2230–2260):

- `<SiteHeader />` is rendered on a plain white background (no `overHero`).
- Below it, inside `<main className="container py-8">`, sits the breadcrumb, "Back to directory" link, badge row, `<h1>` school name, district line, and then the `SchoolIntro` card.
- All of these are left-aligned at desktop widths; only `SchoolIntro` and the cards below are centered with `max-w-3xl mx-auto`.

The home page (`src/pages/Index.tsx`) wraps the header in:

```tsx
<section className="relative border-b border-border/60" style={{ background: "var(--hero-gradient)" }}>
  <SiteHeader overHero />
  <div className="container pb-16 pt-28 md:pb-24 md:pt-36">
    <div className="mx-auto max-w-3xl text-center text-primary-foreground">...</div>
  </div>
</section>
```

We will mirror that pattern on the school page.

## Change

In `src/pages/SchoolDetail.tsx`:

1. Replace the bare `<SiteHeader />` with a hero `<section>` that uses `style={{ background: "var(--hero-gradient)" }}` and renders `<SiteHeader overHero />` inside it.

2. Move the following blocks from the top of `<main>` into that hero section, centered (`mx-auto max-w-3xl text-center text-primary-foreground`):
   - Breadcrumb (light variant — use `text-primary-foreground/80` and `hover:text-primary-foreground`)
   - "Back to directory" link (light variant)
   - Badge row (keep current badge variants; they read fine on the gradient — verify Quintile/Outline badges, may need `border-white/40 text-primary-foreground` override)
   - `<h1>` school name (already large; will inherit white text from parent)
   - District subtitle (use `text-primary-foreground/80`)

3. Use the same vertical rhythm as Home: `pb-16 pt-28 md:pb-24 md:pt-36` on the inner container.

4. Keep `<main className="container flex-1 py-8">` for everything below (SchoolIntro, contact card, data cards) — they already render as a single centered column from the previous change.

5. Remove the now-duplicated breadcrumb / back link / badges / h1 / district from the old position inside `<main>`.

## Result

- Top of every school page: blue gradient hero, white nav, centered school title and metadata.
- Visual parity with Home, About, Admissions style.
- No layout change to the cards below; mobile and desktop both stay one centered column.

## File to edit

- `src/pages/SchoolDetail.tsx` — header section restructure only (~lines 2230–2270). No other files change.

## Out of scope

- `SiteHeader` internals (already supports `overHero`).
- Card content, FAQ, footer.
- Breadcrumb component itself — only utility classes are adjusted at the call site.
