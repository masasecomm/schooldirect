

## Goal

Extract every **2026 Decentralised Walk-In Centre** from the four uploaded posters into a single structured dataset, and render it as a clean, browsable list page in the app. After this lands, you'll tell me what to do with it next (link from school pages, filter by location, etc.).

## What gets built

### 1. Data file: `src/data/walk-in-centres.json`

I'll OCR/transcribe all four posters into one JSON array. Each entry:

```json
{
  "region": "Ekurhuleni",
  "subRegion": "Ekurhuleni North",
  "centre": "District Office (Walk-In Centre)",
  "address": "Munpen Building, 78 Howard Avenue, Benoni",
  "areasServed": ["Birchleigh", "Kempton Park", "Edenvale", "..."],
  "contacts": [
    { "name": "V. Petlo", "phone": "082 562 8053" },
    { "name": "O. Mzimela", "phone": "082 562 7878" }
  ]
}
```

Covers the four posters:
- **Ekurhuleni** (Ekurhuleni North, Ekurhuleni South, Gauteng East)
- **Johannesburg** (JHB Central, East, West, North, South)
- **Tshwane** (Gauteng North, Tshwane North, Tshwane South, Tshwane West)
- **Sedibeng** (Gauteng West, Sedibeng West, Sedibeng East)

### 2. Helper: `src/lib/walk-in-centres.ts`

Typed loader + small utilities (group by region, search by area name).

### 3. New page: `/admissions` (route added in `App.tsx`)

A simple list view, matching the existing site style (SiteHeader / SiteFooter, cards, tokens from `index.css`):

- Page header: "2026 Online Admissions — Walk-In Centres (Grade 1 & 8)"
- Search box: filter by centre, area, or contact name
- Region filter chips: Ekurhuleni / Johannesburg / Tshwane / Sedibeng / All
- Grouped sections by sub-region, each centre as a card showing:
  - Centre name + address (with "Open in Maps" link)
  - Areas served as small badges
  - Contacts list with click-to-call (`tel:`) and copy-number buttons

### 4. Nav entry

Add an "Admissions" link in `SiteHeader` so the page is discoverable.

## Out of scope (for now)

- No linking from individual school pages yet — waiting for your next instruction.
- No matching of a school's suburb to its walk-in centre yet.
- No backend / Lovable Cloud needed; data is static JSON.

## Technical notes

- All four images will be transcribed in one pass; I'll spot-check for OCR mistakes in phone numbers.
- Phone numbers stored as display strings (e.g. `"082 562 8053"`); a normalised digits-only field can be added later if needed for `tel:` links — initially I'll just strip spaces inline.
- No new dependencies.

