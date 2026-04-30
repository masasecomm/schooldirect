## Goal

Add **Western Cape** as a second province alongside Gauteng so every page, SEO signal, sitemap, JSON-LD, FAQ, breadcrumbs and geo tag works the same way it does for Gauteng today — and make adding any future province a JSON drop-in.

## Province registry (single source of truth)

Create `src/lib/provinces.ts`:

```ts
export type ProvinceSlug = "gauteng" | "western-cape";

export interface ProvinceConfig {
  slug: ProvinceSlug;
  name: string;          // "Western Cape"
  shortName: string;     // "WC"
  geoRegion: string;     // "ZA-WC"
  dataDir: string;       // "western-cape" — folder under src/data/
  dept: string;          // "Western Cape Education Department"
}

export const PROVINCES: ProvinceConfig[] = [ /* gauteng + western-cape */ ];
export const getProvince = (slug: string) => ...;
export const getProvinceForSchool = (school) => ...; // looks up by school.provinceSlug
```

Every Gauteng-specific string in the codebase becomes a lookup against this registry.

## Data layout

```text
src/data/
  gauteng/
    schools-2023.json
    schools-2024.json
    schools-2025.json
    matric-results.json
  western-cape/
    schools-2023.json
    schools-2024.json
    schools-2025.json
    matric-results.json
```

- Move existing `src/data/schools-*.json` and `matric-results.json` into `src/data/gauteng/`.
- Add a `provinceSlug: ProvinceSlug` field to the `School` interface (set per dataset on load — file/folder is the source of truth, no manual tagging needed).
- `getSchools(year)` returns **all provinces merged**; add `getSchools(year, provinceSlug?)` to filter.
- For Western Cape, ship empty-but-valid arrays (`[]`) until the user supplies real data, so the build never breaks.

## Routing

`src/App.tsx`:

```text
/                                                → Index (all provinces)
/south-africa                                    → Index
/south-africa/:province                          → Index (filtered to province)
/south-africa/:province/:slug                    → SchoolDetail
/schools/:slug                                   → SchoolDetail (legacy redirect)
```

`schoolHref(school)` becomes `/south-africa/${province.slug}/${schoolSlug(school)}` using `getProvinceForSchool(school)`.

## SEO refactor (`src/lib/seo.ts` + `src/components/seo/SchoolSeo.tsx`)

Replace every hardcoded `"Gauteng"` / `"ZA-GP"` with values from the school's province:

- `buildTitle` → `… — ${place}, ${province.name} | Fees, Contact, Matric Results`
- `buildDescription` → `… in ${place}, ${province.name}.`
- `buildKeywords` → fallback uses `province.name` instead of `"Gauteng"`
- `buildSchoolJsonLd` →
  - `address.addressRegion = province.name`
  - Breadcrumb position 3 → `{ name: province.name, item: ${SITE_URL}/south-africa/${province.slug} }`
  - District breadcrumb → links to `/south-africa/${province.slug}` not the hardcoded gauteng path
- `placeOf` fallback → `province.name`
- `buildSchoolFaqs` → "in the latest ${province.name} dataset", "${where}, ${province.name}, South Africa"
- `SchoolSeo`:
  - `<meta name="geo.region" content={province.geoRegion} />`
  - `geo.placename` fallback → `province.name`

## Page-level changes

**`src/pages/SchoolDetail.tsx`**
- Hero breadcrumb shows the school's actual province (`<Link to={"/south-africa/" + province.slug}>{province.name}</Link>`), not always "Gauteng".
- Canonical path uses `schoolHref(school)`.
- Principal-history sentences ("our Gauteng directory", "no other postings…") become `our ${province.name} directory` / `… in ${province.name}`.

**`src/pages/Index.tsx`**
- Read `:province` route param. If present, filter schools/facets to that province and adjust hero copy ("Every school in Western Cape…"); otherwise keep the all-South-Africa view.
- Pass province context into `SchoolCard` links through the existing `schoolHref`.

**`src/components/schools/SchoolIntro.tsx`** — same Gauteng→province substitution as `seo.ts`.

**`src/components/schools/SiteFooter.tsx`** — replace the static "Data source: Gauteng Department of Education, 2023" with a list built from provinces actually present in the data, e.g. *"Data sources: Gauteng DoE, Western Cape Education Department"*.

**`src/lib/year-context.tsx`** — rename `STORAGE_KEY` from `"gauteng-schools-year"` to `"sa-schools-year"` (purely cosmetic).

**`src/lib/walk-in-centres.ts`** — gate `findWalkInCentresForSchool` on `province.slug === "gauteng"`. Western Cape returns `[]` and the section silently hides on the school page (per your choice).

**`index.html`** — generic copy: "Every school in South Africa", drop province from `<title>` / OG / Twitter, update the SearchAction `target` to `/south-africa?q=...`.

## Sitemap (`scripts/generate-sitemap.mjs`)

- Walk every province in the registry, load each year's JSON from `src/data/<dataDir>/`.
- Static URL list becomes:
  - `/`, `/south-africa`, `/about`, `/admissions`
  - One entry per province: `/south-africa/<slug>`
- School URLs use the province-aware path.
- Continue emitting `sitemap-static.xml`, `sitemap-schools.xml`, `sitemap.xml`, `sitemap-index.xml`. Optionally split schools by province later — not needed now.

## Migration & safety net

- Keep the old `/schools/:slug` route (already present) and add a one-liner client redirect on `SchoolDetail` mount: if URL is `/schools/...` or `/south-africa/gauteng/...` for a school whose actual province is different, `navigate(schoolHref(school), { replace: true })`. This protects any old indexed URLs.

## Verification checklist

- `/south-africa/western-cape` renders the directory filtered to WC (currently empty placeholder).
- `/south-africa/gauteng/<existing-slug>` still renders exactly as today (same title, JSON-LD, breadcrumbs).
- `npm run build` followed by sitemap generation produces both province URL sets.
- View-source on a Gauteng school page shows `addressRegion: "Gauteng"` / `geo.region: ZA-GP`; on a future WC school it shows `Western Cape` / `ZA-WC`.

## Adding province #3 later

Once this lands, adding e.g. KwaZulu-Natal is just:
1. Append a row to `PROVINCES` in `src/lib/provinces.ts`.
2. Drop `src/data/kwazulu-natal/schools-{2023,2024,2025}.json` + `matric-results.json`.

Everything else (routes, SEO, breadcrumbs, FAQ, sitemap, geo tags) is already generic.
