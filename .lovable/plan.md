## Goal

Reframe the "About this school" block so it reads like honest guidance for a parent who is deciding whether to enrol their child here. Strip the card so it feels like editorial advice, not a UI widget. Add a unique opinion on the principal's impact since 2023 (matric + enrolment trend), and end with a clear nudge to keep reading the rest of the page before deciding.

## Audience and voice

- Reader = a parent weighing this school for their child.
- Voice: South African second-language English. Plain words. Short sentences. Declarative. No hedging ("might", "could").
- Speak to the parent directly where it helps ("what you should know", "before you decide").
- No em dashes, no curly quotes, no emojis.

## Changes

### 1. `src/components/schools/SchoolIntro.tsx` — strip the card, reframe as parent guidance

- Remove `Card`, `CardContent`, the `Sparkles` icon and the rounded icon tile.
- Render as a plain `<section>` with no border, no shadow, no background box. Just spacing.
- New structure:
  - Eyebrow (small, uppercase, muted): "For parents deciding"
  - `<h2>`: "What you should know about {name} before you enrol"
  - Tiny "Last reviewed: {date}" line, muted.
  - Paragraph 1 — Snapshot: the existing factual sentences (`buildIntroSentences`) reframed slightly so the lead-in talks to the parent ("Here is what the numbers say about the school your child would attend.").
  - Paragraph 2 — Principal impact opinion (new, see below).
  - Paragraph 3 — Decision nudge: "This is only the headline. Scroll down to see fees, contact details, application dates, full matric history, walk-in centres and the principal's record before you make your choice."

### 2. New helper in the same file: `buildPrincipalImpactParagraph(school, matric, currentYear)`

Returns one short parent-facing paragraph, or `null` if there is no signal.

Inputs already available on the page:
- `school.principal`
- `matric.y2023 / y2024 / y2025` pass percentages
- Learner counts for 2023 vs current year (via a small helper, see step 3)

Logic:
1. matricDelta = `y2025.pct - y2023.pct` (when both exist).
2. enrolDelta% = change in learners from 2023 to current viewing year.
3. Verdict label based on both signals:
   - matric +5 and enrol +5%: "a clear positive impact you can take comfort in"
   - matric +5, enrol -5%: "stronger results, but fewer families are choosing the school - worth asking why"
   - matric -5, enrol +5%: "the school is growing, but matric results have slipped - ask how grades will be supported"
   - both down: "a worrying trend you should raise with the school before enrolling"
   - both flat: "a steady hand since 2023, with no big swings either way"
4. Sentence template (parent-facing):
   "Since 2023, the leadership under {principal or 'the current principal'} shows {verdict}. Matric pass rate moved from {a}% to {b}% ({+/-x.x} points). Enrolment moved from {n1} to {n2} learners ({+/-y.y}%). Use this when you weigh up the school for your child."
5. Primary schools / no matric data: use enrolment-only sentence framed for parents:
   "Since 2023, enrolment at {name} has {grown/shrunk/stayed flat} from {n1} to {n2} learners. Parents are {voting with their feet / staying loyal / drifting away} - a useful signal when you decide."
6. If neither signal exists, return null (paragraph is omitted).

The opinion is built only from the school's own numbers, so each page stays factual and unique.

### 3. Tiny helper in `src/lib/schools.ts`

- `getLearnersInYear(schoolId: string, year: DataYear): number | null`

Used to fetch the 2023 baseline regardless of which year the user is currently viewing.

### 4. No other changes

`SchoolDetail.tsx` keeps the same call site:
`<SchoolIntro school={school} matric={matricResults} />`
Only the component's internal rendering and the new helper change. No routing, SEO, or data changes.

## Out of scope

- No new icons or visual styling beyond removing the card.
- No edits to other sections of the page.
- No changes to data files or business logic outside the small helper above.
