
# Show Centre Number in the Matric Results block

The matric dataset (`src/data/matric-results.json`) already includes a `centreNo` field for every school that has matric results — it's the Department of Basic Education exam centre number used in the NSC results report. We'll surface it in the `MatricResultsCard` header so parents can cross-reference DBE publications.

## Change

**File**: `src/pages/SchoolDetail.tsx` — inside `MatricResultsCard`, just under the "Matric results" heading, add a small line:

> Centre number: `12345678`

- Rendered in monospaced font for legibility.
- Only renders if `results.centreNo` exists (defensive).
- Same muted style as other meta lines in the card.

No other files need to change — `centreNo` is already exposed via `MatricResults` in `src/lib/schools.ts` and passed to the card.

## Result

On any school with matric data, the Matric Results card header will now read:

```
GRADE 12 NSC PASS RATE
Matric results
Centre number: 12345678
```
