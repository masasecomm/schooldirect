import { useMemo } from "react";
import { Banknote, Info, Users, Wallet, ExternalLink, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Per-learner allocation card.
 *
 * Source: National Norms and Standards for School Funding (NNSSF).
 * Provincial Education Departments allocate funds per learner based on the
 * school's quintile. Quintile 1-3 are no-fee schools and receive the highest
 * per-learner allocation. Quintile 4 and 5 charge fees and receive less.
 *
 * National target amounts (no-fee threshold and fee-paying allocations):
 *   Q1, Q2, Q3 -> R1 702 per learner
 *   Q4         -> R838 per learner
 *   Q5         -> R289 per learner
 */

type QuintileNum = 1 | 2 | 3 | 4 | 5;

const ALLOCATION: Record<QuintileNum, number> = {
  1: 1702,
  2: 1702,
  3: 1702,
  4: 838,
  5: 289,
};

const fmtRand = (n: number) => `R${n.toLocaleString("en-ZA")}`;
const fmtRandRounded = (n: number) => `R${Math.ceil(n).toLocaleString("en-ZA")}`;

const parseQuintile = (q?: string | null): QuintileNum | null => {
  if (!q) return null;
  const m = String(q).match(/[1-5]/);
  if (!m) return null;
  return Number(m[0]) as QuintileNum;
};

export const SchoolFeesCard = ({
  schoolName,
  quintile,
  learners,
  noFee,
}: {
  schoolName: string;
  quintile?: string | null;
  learners?: number | null;
  noFee?: string | null;
}) => {
  const q = parseQuintile(quintile);
  const data = useMemo(() => {
    if (!q) return null;
    const perLearner = ALLOCATION[q];
    const isNoFee = q <= 3;
    const totalAllocation =
      typeof learners === "number" && learners > 0 ? perLearner * learners : null;
    const perLearnerMonthly = perLearner / 12;
    const totalMonthly = totalAllocation != null ? totalAllocation / 12 : null;
    return { perLearner, isNoFee, totalAllocation, perLearnerMonthly, totalMonthly };
  }, [q, learners]);

  if (!q || !data) {
    return (
      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                School fees
              </div>
              <h2 className="mt-1 text-lg font-semibold">{schoolName} Fees</h2>
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Quintile not on record for this school. Per-learner allocation cannot be shown.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { perLearner, isNoFee, totalAllocation, perLearnerMonthly, totalMonthly } = data;
  const tone = isNoFee ? "emerald" : q === 4 ? "amber" : "rose";
  const toneClasses: Record<string, { bg: string; text: string; chip: string }> = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      chip: "bg-amber-100 text-amber-800 border-amber-200",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-800",
      chip: "bg-rose-100 text-rose-800 border-rose-200",
    },
  };
  const tc = toneClasses[tone];

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              School fees and funding
            </div>
            <h2 className="mt-1 text-lg font-semibold">{schoolName} Fees</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              This is the money the government allocates for your child at this school each
              year, set by the Provincial Education Department under the National Norms and
              Standards for School Funding.
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Banknote className="h-5 w-5" />
          </div>
        </div>

        {/* Status banner */}
        <div className={`mt-5 rounded-xl border px-4 py-3 ${tc.chip}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                Quintile {q}
              </div>
              <div className="text-sm font-semibold">
                {isNoFee ? "No-fee school" : "Fee-paying school"}
              </div>
            </div>
            <Badge variant="outline" className={`border-0 ${tc.bg} ${tc.text} font-semibold`}>
              Q{q}
            </Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed opacity-90">
            {isNoFee
              ? "Quintile 1 to 3 schools serve the poorest areas. They cannot charge school fees and receive the highest government allocation per learner."
              : q === 4
              ? "Quintile 4 schools are in better-resourced areas. They charge fees and receive a smaller allocation per learner."
              : "Quintile 5 schools are in the wealthiest areas. They charge fees and receive the smallest government allocation per learner."}
          </p>
        </div>

        {/* Per-learner stat */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Banknote className="h-3.5 w-3.5" />
              Per learner, per year
            </div>
            <div className="mt-1 text-3xl font-bold tracking-tight leading-none">
              {fmtRand(perLearner)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {fmtRandRounded(perLearnerMonthly)} per month for your child
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Per child, per month
            </div>
            <div className="mt-1 text-3xl font-bold tracking-tight leading-none">
              {fmtRandRounded(perLearnerMonthly)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {fmtRand(perLearner)} per year for your child
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-6">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            How {schoolName} compares
          </div>
          <div className="mt-2 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Quintile</th>
                  <th className="px-3 py-2 font-semibold">Type</th>
                  <th className="px-3 py-2 text-right font-semibold">Per learner</th>
                </tr>
              </thead>
              <tbody>
                {([
                  { label: "Q1 - Q3", type: "No-fee, poorest areas", amount: 1702, match: q <= 3 },
                  { label: "Q4", type: "Fee-paying, wealthy areas", amount: 838, match: q === 4 },
                  { label: "Q5", type: "Fee-paying, wealthiest areas", amount: 289, match: q === 5 },
                ]).map((row) => (
                  <tr
                    key={row.label}
                    className={`border-t border-border ${row.match ? "bg-primary-soft/40 font-semibold" : ""}`}
                  >
                    <td className="px-3 py-2">{row.label}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.type}</td>
                    <td className="px-3 py-2 text-right">{fmtRand(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Figures are national target amounts under the National Norms and Standards for
            School Funding. Actual provincial allocations may vary year to year.
          </p>
        </div>

        <a
          href="https://eelawcentre.org.za/wp-content/uploads/funding-in-public-schools-2024-1.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Read the full guide: Funding in Public Schools (2024)
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
};