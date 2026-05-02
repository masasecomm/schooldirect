## Goal

Add **Namibia** as a second country alongside South Africa, with a **flat permalink** of the form:

```text
/namibia/{school-name}-namibia
```

(no province/region segment, country name appended to the slug as you requested). South African URLs stay exactly as they are today (`/south-africa/<province>/<slug>`).

## Country model (new)

Introduce a lightweight country layer next to the existing province registry.

`src/lib/countries.ts` (new):

```ts
export type CountrySlug = "south-africa" | "namibia";

export interface CountryConfig {
  slug: CountrySlug;
  name: string;                  // "Namibia"
  shortName: string;             // "NA"
  geoCountry: string;            // "NA" / "ZA"
  hasProvinces: boolean;         // ZA: true, NA: false
  // URL builder per country — keeps SA's existing path untouched and
  // gives Namibia the flat shape you asked for.
  schoolPath: (school) => string;
}
```

- South Africa keeps `hasProvinces: true` and the existing `/south-africa/<province>/<slug>` builder.
- Namibia uses `hasProvinces: false` and `(school) => /namibia/${slug(school.name)}-namibia`.

`schoolHref()` in `src/lib/schools.ts` becomes a thin dispatcher to the country's `schoolPath`. Existing Gauteng/WC/etc. links don't change.

## Data layout

```text
src/data/
  namibia/
    schools.json        ← single file (no year split unless you tell me otherwise)
```

Fields will mirror the existing `School` interface where the sheet has them; missing fields become `null`. The Google Sheet you linked requires OAuth that I can't access from here, so:

**You upload the sheet** (export as `.xlsx` or `.csv`) the same way you did the special-schools files, and I:
1. Inspect actual columns
2. Map them to the `School` interface (name, town, region, contact, learners, etc.)
3. Write `src/data/namibia/schools.json`

If years like 2023/2024/2025 aren't in the sheet, Namibia ships as a single snapshot (no year filter on Namibia pages).

## Schema changes

`src/lib/schools.ts`:
- `School.countrySlug: CountrySlug` (new, required)
- `School.provinceSlug` becomes optional (`ProvinceSlug | null`) since Namibia rows won't have one
- `getSchools(year, provinceSlug?)` extended with optional `countrySlug?`
- New `getSchoolsByCountry(countrySlug)` for country-filtered listings
- `findSchool` unchanged — still keyed on EMIS id (or whatever Namibia's id column is; if Namibia has no EMIS, I'll use a stable hash of `name+town`)

## Routing

`src/App.tsx` adds:

```text
/namibia                          → Index (country = NA)
/namibia/:slug                    → SchoolDetail (Namibia school)
```

`SchoolDetail` already extracts the school via `idFromSlug`. For Namibia slugs ending in `-namibia` instead of `-<id>`, I'll teach `idFromSlug` to:
1. Strip a trailing country-name segment (`-namibia`, `-south-africa`) if present
2. Then look for the trailing numeric id, otherwise look up by exact slug match

That way `cool-school-namibia` resolves to the right record.

`schoolHref` for SA stays `…<id>`; for Namibia it ends with `…-namibia` per your spec.

## UI changes

- **Landing (`src/pages/Landing.tsx`)** – add a "Browse by country" section with two cards: South Africa, Namibia. SA card links to `/south-africa`, Namibia card to `/namibia`.
- **Index (`src/pages/Index.tsx`)** – when `:country === "namibia"`, switch the directory to country-mode: hide province filters, show region/town facets sourced from Namibia data, and update the hero copy ("Every school in Namibia").
- **SchoolDetail** – breadcrumbs become country-aware: `Home › Namibia › <school>` (no province crumb when the country has no provinces). Principal-history copy and FAQ generators read `country.name` instead of always `province.name`.
- **SchoolCard** – uses `schoolHref(school)` so it just works.
- **SiteFooter** – data-source list adds the Namibian source ("Ministry of Education, Arts and Culture" — confirm with you).

## SEO

`src/lib/seo.ts` + `SchoolSeo`:
- `addressCountry` already implied as ZA — make it dynamic from country
- `geo.region` → ZA-XX for SA, `NA` (or `NA-XX` if Namibia regions are present) for Namibia
- Breadcrumb JSON-LD: SA chain unchanged; Namibia chain is `Home › Namibia › School`
- Title/description fall back to country name when no province is set

## Sitemap (`scripts/generate-sitemap.mjs`)

- Add a country loop. For SA, walk provinces (current behaviour). For Namibia, load `src/data/namibia/schools.json` directly.
- Static URLs add `/namibia` plus per-school Namibia URLs.
- Continue emitting `sitemap-static.xml`, `sitemap-schools.xml`, `sitemap.xml`, `sitemap-index.xml`.

## Files touched

**New**
- `src/lib/countries.ts`
- `src/data/namibia/schools.json` (after you upload the sheet)

**Edited**
- `src/lib/provinces.ts` (province → optional, no behaviour change for SA)
- `src/lib/schools.ts` (country dispatch in `schoolHref`, `idFromSlug` strips country suffix, Namibia dataset import, country-aware getters)
- `src/lib/seo.ts`, `src/components/seo/SchoolSeo.tsx` (country-aware geo/breadcrumb)
- `src/components/schools/SchoolIntro.tsx`, `SiteFooter.tsx`
- `src/pages/Landing.tsx` (country picker), `Index.tsx` (country mode), `SchoolDetail.tsx` (breadcrumb)
- `src/App.tsx` (`/namibia`, `/namibia/:slug`)
- `scripts/generate-sitemap.mjs` (country loop)

## What I need from you

1. **Upload the Namibia data** as `.xlsx` or `.csv` (export from the Google Sheet → File → Download). I can't read the sheet via the link directly because it needs OAuth.
2. Confirm:
   - Single snapshot (no year split) for Namibia? Default = **yes**.
   - Show Namibia in the same global search as SA, or keep it country-scoped only? Default = **both** (global search includes NA, country pages stay focused).

Once the file lands I'll wire it all up in one pass.
