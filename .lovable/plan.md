
# Gauteng Schools Directory (2023)

A clean, modern public website where parents and students can browse and search all schools in the Gauteng 2023 directory.

## Data
- Convert `Gauteng2023.xlsx` into a static JSON file bundled with the app (no backend, fast loads).
- Normalize fields like school name, EMIS number, district, sector (public/independent), phase (primary/secondary/combined), quintile, address, suburb, town, postal code, phone, email, principal — based on whatever columns exist in the sheet.

## Pages

**Home / Directory (`/`)**
- Hero: "Find a school in Gauteng" with a large search bar (search by name, suburb, district, EMIS).
- Filter sidebar: District, Sector, Phase, Quintile, Town/Suburb.
- Active filter chips + "Clear all".
- Result count + sort (A–Z, by district).
- Results as cards in a responsive grid: name, type badges, suburb, phone, "View details" link.
- Pagination (or infinite scroll) for performance with thousands of schools.

**School detail (`/schools/:id`)**
- Full info: name, all contact details, address block, principal, phase, sector, quintile, EMIS.
- "Copy phone / email" buttons, click-to-call, click-to-email.
- "Open in Google Maps" link using the address.
- Back to directory.

**About (`/about`)**
- Short note: data source, year (2023), disclaimer that info may be outdated, who it's for.

**404** — keep existing NotFound.

## UX details
- Sticky header with logo/title + search.
- Mobile: filters collapse into a slide-over drawer.
- Empty state when no results match.
- Skeleton loaders while JSON loads.
- Fully keyboard-accessible.

## Style
- Clean & modern, light theme.
- Friendly accent color (calm blue/teal), generous whitespace, rounded cards, subtle shadows.
- Sans-serif (Inter), clear typographic hierarchy.
- All colors & tokens defined in `index.css` + `tailwind.config.ts` (semantic design tokens, no hardcoded colors in components).

## Tech
- React + Vite + Tailwind + shadcn/ui (already in the project).
- React Router for `/`, `/schools/:id`, `/about`.
- Static `src/data/schools.json` generated once from the uploaded XLSX.
- Client-side fuzzy search + filtering with `useMemo`.
