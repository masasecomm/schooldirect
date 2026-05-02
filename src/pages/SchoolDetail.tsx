import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Hash,
  Users,
  GraduationCap,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  Compass,
  School as SchoolIcon,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { ContactSchoolCard } from "@/components/schools/ContactSchoolCard";
import { SchoolCalendarCard } from "@/components/schools/SchoolCalendarCard";
import { SchoolFeesCard } from "@/components/schools/SchoolFeesCard";
import { SchoolIntro } from "@/components/schools/SchoolIntro";
import { SchoolSeo } from "@/components/seo/SchoolSeo";
import { SchoolFaq } from "@/components/seo/SchoolFaq";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  findSchool,
  titleCase,
  displayName,
  cleanAddress,
  getSchools,
  AVAILABLE_YEARS,
  idFromSlug,
  schoolHref,
  schoolSlug,
  formatPhone,
  type DataYear,
  getMatricResults,
  type MatricResults,
  findPrincipalAtOtherSchools,
  findNamibiaSchoolBySlug,
} from "@/lib/schools";
import { getProvinceForSchool } from "@/lib/provinces";
import { toast } from "@/hooks/use-toast";
import {
  findWalkInCentresForSchool,
  mapsHref as walkInMapsHref,
  telHref,
} from "@/lib/walk-in-centres";

const APPLICATION_HISTORY: {
  year: string;
  opened: string;
  closed: string;
  predicted?: boolean;
}[] = [
  {
    year: "2027",
    opened: "Mid-July 2026 (predicted)",
    closed: "Late August 2026 (predicted)",
    predicted: true,
  },
  { year: "2026", opened: "24 July 2025", closed: "29 August 2025" },
  { year: "2025", opened: "11 July 2024", closed: "12 August 2024" },
];

const Detail = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground break-words">{value}</div>
    </div>
  </div>
);

// Years displayed in chronological order (oldest -> newest)
const HISTORY_YEARS: DataYear[] = [...AVAILABLE_YEARS].sort() as DataYear[];

const formatDelta = (diff: number, pct: number) =>
  `${diff > 0 ? "+" : ""}${diff.toLocaleString()} (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`;

const TrendChip = ({
  from,
  to,
  size = "sm",
}: {
  from: number | null;
  to: number | null;
  size?: "sm" | "md";
}) => {
  if (from == null || to == null || from === 0) return null;
  const diff = to - from;
  const pct = (diff / from) * 100;
  const up = diff > 0;
  const down = diff < 0;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  const cls = up
    ? "text-emerald-700 bg-emerald-100"
    : down
    ? "text-rose-700 bg-rose-100"
    : "text-muted-foreground bg-muted";
  const sizing =
    size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizing} ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {formatDelta(diff, pct)}
    </span>
  );
};

/**
 * Single human pictogram. Filled when "active" (representing learners present),
 * outlined/muted otherwise. Uses currentColor so the parent can theme it.
 */
const HumanFigure = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 48"
    className={`h-10 w-5 transition-colors ${
      active ? "text-primary" : "text-muted-foreground/25"
    }`}
    fill="currentColor"
    aria-hidden="true"
  >
    {/* head */}
    <circle cx="12" cy="6" r="5" />
    {/* body: shoulders + torso */}
    <path d="M3 18c0-4 4-6 9-6s9 2 9 6v10c0 1.5-1 2.5-2.5 2.5H5.5C4 30.5 3 29.5 3 28V18z" />
    {/* legs */}
    <rect x="5" y="30" width="5.5" height="16" rx="1.2" />
    <rect x="13.5" y="30" width="5.5" height="16" rx="1.2" />
  </svg>
);

/**
 * Learner Enrolment card with human-figure pictograms.
 * Each row = one year. A row of FIGURE_COUNT figures shows the proportion
 * relative to the highest value across the displayed years.
 */
const LearnerEnrolmentCard = ({
  values,
  educators,
  matric,
  school,
}: {
  values: Record<DataYear, number | null>;
  educators?: Record<DataYear, number | null>;
  matric?: MatricResults | null;
  school?: { noFee?: string | null; quintile?: string | null; phase?: string | null };
}) => {
  const FIGURE_COUNT = 10;
  const series = HISTORY_YEARS.map((y) => ({ year: y, value: values[y] }));
  const numeric = series.filter(
    (s): s is { year: DataYear; value: number } => typeof s.value === "number",
  );
  const max = numeric.length ? Math.max(...numeric.map((s) => s.value)) : 0;
  const latest = [...series].reverse().find((s) => typeof s.value === "number");
  const earliest = series.find((s) => typeof s.value === "number");
  const overallDiff =
    latest && earliest && latest.year !== earliest.year
      ? latest.value - earliest.value
      : null;
  const avg = numeric.length
    ? Math.round(numeric.reduce((sum, s) => sum + s.value, 0) / numeric.length)
    : null;

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Learner enrolment
            </div>
            <h2 className="mt-1 text-lg font-semibold">Learners over time</h2>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Headline */}
        <div className="mt-5 flex items-end gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Latest ({latest?.year ?? "—"})
            </div>
            <div className="text-4xl font-bold tracking-tight leading-none">
              {latest ? latest.value.toLocaleString() : "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">learners</div>
          </div>
          {overallDiff != null && earliest && latest && (
            <div className="ml-auto flex flex-col items-end gap-1">
              <TrendChip from={earliest.value} to={latest.value} size="md" />
              <div className="text-[11px] text-muted-foreground">
                vs {earliest.year}
              </div>
            </div>
          )}
        </div>

        {/* Pictogram rows */}
        <div className="mt-6 space-y-4">
          {series.map((s) => {
            const ratio =
              typeof s.value === "number" && max > 0 ? s.value / max : 0;
            // At least 1 figure if there's any value, so a non-zero year is visible.
            const filled =
              typeof s.value === "number" && s.value > 0
                ? Math.max(1, Math.round(ratio * FIGURE_COUNT))
                : 0;
            return (
              <div key={s.year}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">
                    {s.year}
                  </span>
                  <span className="font-bold text-foreground">
                    {typeof s.value === "number"
                      ? s.value.toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div
                  className="mt-1.5 flex items-end gap-1"
                  role="img"
                  aria-label={`${s.year}: ${
                    typeof s.value === "number" ? s.value : "no data"
                  } learners`}
                >
                  {Array.from({ length: FIGURE_COUNT }).map((_, i) => (
                    <HumanFigure key={i} active={i < filled} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vertical bar chart */}
        {max > 0 && (
          <div className="mt-6">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Year-on-year comparison
            </div>
            <div className="mt-3 flex h-56 items-end justify-around gap-3 rounded-xl border border-border bg-muted/30 px-4 pt-4 pb-2">
              {series.map((s, i) => {
                const heightPct =
                  typeof s.value === "number" && max > 0
                    ? (s.value / max) * 100
                    : 0;
                const prev = i > 0 ? series[i - 1].value : null;
                const isLatest = s.year === latest?.year;
                return (
                  <div
                    key={s.year}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    {/* Labels area: fixed height so bars below always share the same scale */}
                    <div className="flex h-14 flex-col items-center justify-end gap-0.5">
                      {typeof s.value === "number" &&
                        typeof prev === "number" && (
                          <TrendChip from={prev} to={s.value} />
                        )}
                      <span className="text-[11px] font-semibold text-foreground">
                        {typeof s.value === "number"
                          ? s.value.toLocaleString()
                          : "—"}
                      </span>
                    </div>
                    {/* Bar area: fills remaining vertical space, bars scale within it */}
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        className={`w-full max-w-[48px] rounded-t-md transition-all ${
                          isLatest ? "bg-primary" : "bg-primary/50"
                        }`}
                        style={{
                          height: `${heightPct}%`,
                          minHeight: heightPct > 0 ? 4 : 0,
                        }}
                        aria-label={`${s.year}: ${
                          typeof s.value === "number" ? s.value : "no data"
                        } learners`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {s.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer: scale legend + average */}
        <div className="mt-5 space-y-2">
          {max > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-primary-soft/40 px-3 py-2 text-[11px] text-muted-foreground">
              <span>Each figure ≈</span>
              <span className="font-semibold text-foreground">
                {Math.round(max / FIGURE_COUNT).toLocaleString()} learners
              </span>
            </div>
          )}
          {avg != null && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
              <span className="text-muted-foreground">3-year average</span>
              <span className="font-semibold text-foreground">
                {avg.toLocaleString()} learners
              </span>
            </div>
          )}
        </div>

        {/* Parent-friendly outlook + next-year prediction */}
        {(() => {
          if (numeric.length < 2 || !latest) return null;

          // Linear regression over the available years to project next year.
          const xs = numeric.map((s) => Number(s.year));
          const ys = numeric.map((s) => s.value);
          const n = xs.length;
          const meanX = xs.reduce((a, b) => a + b, 0) / n;
          const meanY = ys.reduce((a, b) => a + b, 0) / n;
          let num = 0;
          let den = 0;
          for (let i = 0; i < n; i++) {
            num += (xs[i] - meanX) * (ys[i] - meanY);
            den += (xs[i] - meanX) ** 2;
          }
          const slope = den === 0 ? 0 : num / den;
          const intercept = meanY - slope * meanX;
          // Forecast two years past the latest data point. With data ending in
          // 2025 this surfaces a 2027 outlook, which is what parents planning
          // ahead actually want to see.
          const nextYear = Number(latest.year) + 2;
          const projectedRaw = slope * nextYear + intercept;
          const projected = Math.max(0, Math.round(projectedRaw));
          const projectedDelta = projected - latest.value;
          const projectedPct =
            latest.value > 0 ? (projectedDelta / latest.value) * 100 : 0;

          // Overall direction over the period covered.
          const totalDelta = latest.value - earliest!.value;
          const totalPct =
            earliest!.value > 0 ? (totalDelta / earliest!.value) * 100 : 0;

          let outlookHeadline = "";
          let outlookBody = "";
          if (totalPct >= 10) {
            outlookHeadline = "Growing school";
            outlookBody = `Enrolment grew by about ${Math.abs(totalPct).toFixed(
              0,
            )}% from ${earliest!.year} to ${latest.year}. A growing school usually means parents in the area trust it. It can also mean larger classes, so ask about class sizes when you visit.`;
          } else if (totalPct <= -10) {
            outlookHeadline = "Shrinking school";
            outlookBody = `Enrolment dropped by about ${Math.abs(totalPct).toFixed(
              0,
            )}% from ${earliest!.year} to ${latest.year}. A drop can mean families are moving away, or that parents are choosing other schools. Ask the principal what is driving the change.`;
          } else {
            outlookHeadline = "Stable school";
            outlookBody = `Enrolment has stayed close to the same from ${earliest!.year} to ${latest.year} (change of about ${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(
              0,
            )}%). A stable school often means steady demand and predictable class sizes.`;
          }

          // Data-driven causes. Each item is only added when the school's
          // own numbers actually support it. No generic filler.
          const possibleCauses: string[] = [];
          const direction: "up" | "down" | "flat" =
            totalPct >= 10 ? "up" : totalPct <= -10 ? "down" : "flat";

          // 1. Matric results trend (only meaningful for secondary/combined schools).
          const phaseUp = (school?.phase || "").toUpperCase();
          const isSecondary = phaseUp.includes("SECONDARY") || phaseUp.includes("COMBINED");
          if (isSecondary && matric?.y2024?.pct != null && matric?.y2025?.pct != null) {
            const diff = matric.y2025.pct - matric.y2024.pct;
            if (diff >= 5 && direction !== "down") {
              possibleCauses.push(
                `Matric pass rate improved from ${matric.y2024.pct.toFixed(1)}% in 2024 to ${matric.y2025.pct.toFixed(1)}% in 2025, which attracts new families.`,
              );
            } else if (diff <= -5 && direction !== "up") {
              possibleCauses.push(
                `Matric pass rate dropped from ${matric.y2024.pct.toFixed(1)}% in 2024 to ${matric.y2025.pct.toFixed(1)}% in 2025, which can push parents to other schools.`,
              );
            } else if (Math.abs(diff) < 5) {
              possibleCauses.push(
                `Matric pass rate stayed close to the same (${matric.y2024.pct.toFixed(1)}% in 2024, ${matric.y2025.pct.toFixed(1)}% in 2025), so academic results are not driving change.`,
              );
            }
          }

          // 2. Teacher headcount trend — proxy for staff stability.
          if (educators) {
            const eSeries = HISTORY_YEARS.map((y) => ({ year: y, value: educators[y] }))
              .filter((s): s is { year: DataYear; value: number } => typeof s.value === "number");
            if (eSeries.length >= 2) {
              const eFirst = eSeries[0].value;
              const eLast = eSeries[eSeries.length - 1].value;
              const eDiff = eLast - eFirst;
              const ePct = eFirst > 0 ? (eDiff / eFirst) * 100 : 0;
              if (ePct >= 10) {
                possibleCauses.push(
                  `The teaching staff grew from ${eFirst} to ${eLast} educators between ${eSeries[0].year} and ${eSeries[eSeries.length - 1].year}, which usually follows rising enrolment.`,
                );
              } else if (ePct <= -10) {
                possibleCauses.push(
                  `The teaching staff shrank from ${eFirst} to ${eLast} educators between ${eSeries[0].year} and ${eSeries[eSeries.length - 1].year}, which can mean staff turnover or unfilled posts.`,
                );
              } else {
                possibleCauses.push(
                  `Teacher headcount has stayed close to the same (${eFirst} → ${eLast} educators), suggesting steady staffing.`,
                );
              }

              // Learner-to-educator ratio at latest year.
              if (latest && eLast > 0) {
                const ratio = Math.round(latest.value / eLast);
                if (ratio >= 40) {
                  possibleCauses.push(
                    `The learner-to-educator ratio is high at about ${ratio}:1 in ${latest.year}, which can strain classroom capacity.`,
                  );
                } else if (ratio <= 25) {
                  possibleCauses.push(
                    `The learner-to-educator ratio is favourable at about ${ratio}:1 in ${latest.year}, which supports more learner attention.`,
                  );
                }
              }
            }
          }

          // 3. Fee status / quintile — affordability is a real demand driver.
          if (school?.noFee === "YES") {
            possibleCauses.push(
              `As a no-fee school${school.quintile ? ` (quintile ${school.quintile})` : ""}, demand from local families tends to stay strong.`,
            );
          } else if (school?.quintile) {
            possibleCauses.push(
              `As a fee-paying quintile ${school.quintile} school, enrolment can move with how affordable parents find the fees.`,
            );
          }

          // 4. Year-on-year enrolment swing — biggest single-year change.
          if (numeric.length >= 2) {
            let biggest: { from: DataYear; to: DataYear; pct: number; from_v: number; to_v: number } | null = null;
            for (let i = 1; i < numeric.length; i++) {
              const a = numeric[i - 1];
              const b = numeric[i];
              if (a.value <= 0) continue;
              const pct = ((b.value - a.value) / a.value) * 100;
              if (!biggest || Math.abs(pct) > Math.abs(biggest.pct)) {
                biggest = { from: a.year, to: b.year, pct, from_v: a.value, to_v: b.value };
              }
            }
            if (biggest && Math.abs(biggest.pct) >= 8) {
              possibleCauses.push(
                `The biggest single-year change was ${biggest.from} → ${biggest.to} (${biggest.from_v.toLocaleString()} → ${biggest.to_v.toLocaleString()} learners, ${biggest.pct >= 0 ? "+" : ""}${biggest.pct.toFixed(0)}%). A jump like this often follows a new principal, a major facilities change, or shifting catchment demand.`,
              );
            }
          }

          let predictionLine = "";
          if (Math.abs(projectedPct) < 2) {
            predictionLine = `Based on the last ${n} years, enrolment for ${nextYear} is likely to stay close to ${projected.toLocaleString()} learners.`;
          } else if (projectedPct > 0) {
            predictionLine = `Based on the trend, ${nextYear} enrolment is projected at about ${projected.toLocaleString()} learners (around ${projectedPct.toFixed(
              0,
            )}% higher than ${latest.year}).`;
          } else {
            predictionLine = `Based on the trend, ${nextYear} enrolment is projected at about ${projected.toLocaleString()} learners (around ${Math.abs(
              projectedPct,
            ).toFixed(0)}% lower than ${latest.year}).`;
          }

          return (
            <div className="mt-5 rounded-xl border border-border bg-primary-soft/30 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                What this means for parents
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {outlookHeadline}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {outlookBody}
              </p>
              {possibleCauses.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Possible causes (from this school's data)
                  </div>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {possibleCauses.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Drawn from this school's own enrolment, staffing, fee status, and matric numbers. Always confirm with the school.
                  </p>
                </div>
              )}
              <div className="mt-3 rounded-lg border border-dashed border-primary/40 bg-background/60 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {nextYear} forecast
                </div>
                <p className="mt-1 text-sm text-foreground">{predictionLine}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  This is a simple trend estimate from {n} years of data. Real numbers can change.
                </p>
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

/**
 * Numeric history card with bar-chart style infographic.
 * Highlights the latest value, overall change vs first year, and per-year bars.
 */
const NumericHistoryCard = ({
  icon: Icon,
  title,
  subtitle,
  unit,
  values,
  accent = "primary",
  narrative,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  unit: string;
  values: Record<DataYear, number | null>;
  accent?: "primary" | "accent";
  narrative?: React.ReactNode;
}) => {
  const series = HISTORY_YEARS.map((y) => ({ year: y, value: values[y] }));
  const numeric = series.filter((s): s is { year: DataYear; value: number } => typeof s.value === "number");
  const max = numeric.length ? Math.max(...numeric.map((s) => s.value)) : 0;
  const latest = [...series].reverse().find((s) => typeof s.value === "number");
  const earliest = series.find((s) => typeof s.value === "number");
  const overallDiff =
    latest && earliest && latest.year !== earliest.year
      ? latest.value - earliest.value
      : null;
  const overallPct =
    overallDiff != null && earliest && earliest.value !== 0
      ? (overallDiff / earliest.value) * 100
      : null;
  const avg = numeric.length
    ? Math.round(numeric.reduce((sum, s) => sum + s.value, 0) / numeric.length)
    : null;

  const softBg = accent === "accent" ? "bg-accent/10 text-accent" : "bg-primary-soft text-primary";
  const lineStroke = accent === "accent" ? "hsl(var(--accent))" : "hsl(var(--primary))";
  const lineFill = accent === "accent" ? "hsl(var(--accent) / 0.15)" : "hsl(var(--primary) / 0.15)";

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {subtitle}
            </div>
            <h2 className="mt-1 text-lg font-semibold">{title}</h2>
          </div>
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${softBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Headline stat */}
        <div className="mt-5 flex items-end gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Latest ({latest?.year ?? "—"})
            </div>
            <div className="text-4xl font-bold tracking-tight leading-none">
              {latest ? latest.value.toLocaleString() : "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{unit}</div>
          </div>
          {overallDiff != null && overallPct != null && (
            <div className="ml-auto flex flex-col items-end gap-1">
              <TrendChip from={earliest!.value} to={latest!.value} size="md" />
              <div className="text-[11px] text-muted-foreground">
                vs {earliest!.year}
              </div>
            </div>
          )}
        </div>

        {/* Line chart */}
        {(() => {
          // SVG dimensions in viewBox units. Scales responsively via width=100%.
          const W = 320;
          const H = 140;
          const padX = 24;
          const padTop = 24;
          const padBottom = 28;
          const innerW = W - padX * 2;
          const innerH = H - padTop - padBottom;
          const minVal = numeric.length ? Math.min(...numeric.map((s) => s.value)) : 0;
          // Pad the y-range slightly so the line doesn't sit flush at top/bottom.
          const range = max - minVal || max || 1;
          const yPad = range * 0.15;
          const yMin = Math.max(0, minVal - yPad);
          const yMax = max + yPad;
          const yRange = yMax - yMin || 1;

          const points = series.map((s, i) => {
            const x = padX + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
            const y =
              typeof s.value === "number"
                ? padTop + innerH - ((s.value - yMin) / yRange) * innerH
                : null;
            return { ...s, x, y };
          });
          const valid = points.filter((p): p is typeof p & { y: number } => p.y !== null);
          const linePath = valid
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ");
          const areaPath =
            valid.length > 1
              ? `${linePath} L ${valid[valid.length - 1].x} ${padTop + innerH} L ${valid[0].x} ${padTop + innerH} Z`
              : "";

          return (
            <div className="mt-6">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-44 w-full"
                role="img"
                aria-label={`${title} line chart`}
              >
                {/* Gridlines */}
                {[0, 0.5, 1].map((t) => {
                  const y = padTop + innerH * t;
                  return (
                    <line
                      key={t}
                      x1={padX}
                      x2={W - padX}
                      y1={y}
                      y2={y}
                      stroke="hsl(var(--border))"
                      strokeWidth={1}
                      strokeDasharray="2 4"
                    />
                  );
                })}
                {/* Area under line */}
                {areaPath && <path d={areaPath} fill={lineFill} />}
                {/* Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={lineStroke}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {/* Points + labels */}
                {points.map((p, i) => {
                  if (p.y === null) return null;
                  const prev = i > 0 ? series[i - 1].value : null;
                  const isLatest = p.year === latest?.year;
                  return (
                    <g key={p.year}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isLatest ? 5 : 3.5}
                        fill="hsl(var(--card))"
                        stroke={lineStroke}
                        strokeWidth={2.5}
                      />
                      {/* Value label above point */}
                      <text
                        x={p.x}
                        y={p.y - 10}
                        textAnchor="middle"
                        className="fill-foreground"
                        style={{ fontSize: 10, fontWeight: 600 }}
                      >
                        {typeof p.value === "number" ? p.value.toLocaleString() : "—"}
                      </text>
                      {/* Year label below axis */}
                      <text
                        x={p.x}
                        y={H - 10}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        style={{ fontSize: 10, fontWeight: 500 }}
                      >
                        {p.year}
                      </text>
                      {/* hint of trend in title */}
                      {typeof p.value === "number" && typeof prev === "number" && (
                        <title>{`${p.year}: ${p.value.toLocaleString()} (${
                          p.value - prev >= 0 ? "+" : ""
                        }${(p.value - prev).toLocaleString()})`}</title>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Per-year deltas below chart */}
              <div className="mt-2 flex items-center justify-around gap-2 text-[11px]">
                {series.map((s, i) => {
                  const prev = i > 0 ? series[i - 1].value : null;
                  return (
                    <div key={s.year} className="flex flex-1 justify-center">
                      {typeof s.value === "number" && typeof prev === "number" ? (
                        <TrendChip from={prev} to={s.value} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Footer stats */}
        {avg != null && (
          <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">3-year average</span>
            <span className="font-semibold text-foreground">
              {avg.toLocaleString()} {unit}
            </span>
          </div>
        )}
        {narrative && <div className="mt-5">{narrative}</div>}
      </CardContent>
    </Card>
  );
};

/**
 * Parent-friendly explanation block for the "Educators over time" card.
 * Cross-references educator headcount with learner enrolment and (where the
 * school writes matric) the matric pass-rate trend, so a parent can read
 * the staffing story in plain language.
 */
const EducatorsNarrative = ({
  educators,
  learners,
  matric,
  phase,
}: {
  educators: Record<DataYear, number | null>;
  learners: Record<DataYear, number | null>;
  matric: MatricResults | null;
  phase: string | null | undefined;
}) => {
  const eSeries = HISTORY_YEARS.map((y) => ({ year: y, value: educators[y] }))
    .filter((s): s is { year: DataYear; value: number } => typeof s.value === "number");
  if (eSeries.length < 1) return null;

  const eLast = eSeries[eSeries.length - 1];
  const eFirst = eSeries[0];
  const eDiff = eSeries.length >= 2 ? eLast.value - eFirst.value : 0;
  const ePct = eSeries.length >= 2 && eFirst.value > 0 ? (eDiff / eFirst.value) * 100 : 0;

  // Staffing headline.
  let staffHeadline = "Stable teaching staff";
  let staffBody = "";
  if (eSeries.length < 2) {
    staffHeadline = "Current teaching staff";
    staffBody = `${eLast.value} educators are recorded in ${eLast.year}.`;
  } else if (ePct >= 10) {
    staffHeadline = "Growing teaching staff";
    staffBody = `Educators went from ${eFirst.value} in ${eFirst.year} to ${eLast.value} in ${eLast.year}, a rise of about ${ePct.toFixed(0)}%.`;
  } else if (ePct <= -10) {
    staffHeadline = "Shrinking teaching staff";
    staffBody = `Educators dropped from ${eFirst.value} in ${eFirst.year} to ${eLast.value} in ${eLast.year}, a fall of about ${Math.abs(ePct).toFixed(0)}%.`;
  } else {
    staffHeadline = "Stable teaching staff";
    staffBody = `Educators stayed close to the same (${eFirst.value} in ${eFirst.year}, ${eLast.value} in ${eLast.year}).`;
  }

  // Cross-reference with learners: ratio + whether staffing tracks enrolment.
  const lSeries = HISTORY_YEARS.map((y) => ({ year: y, value: learners[y] }))
    .filter((s): s is { year: DataYear; value: number } => typeof s.value === "number");
  const lLast = lSeries[lSeries.length - 1];
  const lFirst = lSeries[0];
  const lPct =
    lSeries.length >= 2 && lFirst.value > 0
      ? ((lLast.value - lFirst.value) / lFirst.value) * 100
      : null;

  const ratioLatest =
    lLast && eLast.value > 0 ? Math.round(lLast.value / eLast.value) : null;
  const ratioFirst =
    lFirst && eFirst.value > 0 ? Math.round(lFirst.value / eFirst.value) : null;

  let ratioLine = "";
  if (ratioLatest != null) {
    if (ratioLatest >= 40) {
      ratioLine = `In ${eLast.year} there are about ${ratioLatest} learners per educator. That is high and can mean larger classes.`;
    } else if (ratioLatest <= 25) {
      ratioLine = `In ${eLast.year} there are about ${ratioLatest} learners per educator, which is favourable for learner attention.`;
    } else {
      ratioLine = `In ${eLast.year} there are about ${ratioLatest} learners per educator, which is typical for SA public schools.`;
    }
    if (ratioFirst != null && eSeries.length >= 2 && lSeries.length >= 2) {
      const ratioDiff = ratioLatest - ratioFirst;
      if (ratioDiff >= 5) {
        ratioLine += ` Class loads have grown (was about ${ratioFirst}:1 in ${lFirst.year}).`;
      } else if (ratioDiff <= -5) {
        ratioLine += ` Class loads have eased (was about ${ratioFirst}:1 in ${lFirst.year}).`;
      } else {
        ratioLine += ` Class loads are roughly the same as in ${lFirst.year}.`;
      }
    }
  }

  // Cross-reference: does staffing track enrolment?
  let alignmentLine = "";
  if (lPct != null && eSeries.length >= 2) {
    if (lPct >= 10 && ePct < 5) {
      alignmentLine = `Learner numbers grew faster than the teaching staff, so educators are likely under more pressure than before.`;
    } else if (lPct <= -10 && ePct > -5) {
      alignmentLine = `Learner numbers fell but the staff did not shrink as much, so classes may now be smaller.`;
    } else if (lPct >= 5 && ePct >= 5) {
      alignmentLine = `Staffing has grown alongside enrolment, which is a healthy sign that the school is keeping up with demand.`;
    } else if (lPct <= -5 && ePct <= -5) {
      alignmentLine = `Both learners and staff are dropping together, which often follows a shrinking catchment area.`;
    } else {
      alignmentLine = `Staffing levels match learner numbers reasonably well.`;
    }
  }

  // Optional matric link (only meaningful for secondary/combined schools).
  let matricLine = "";
  const phaseUp = (phase || "").toUpperCase();
  const isSecondary = phaseUp.includes("SECONDARY") || phaseUp.includes("COMBINED");
  if (isSecondary && matric?.y2024?.pct != null && matric?.y2025?.pct != null) {
    const mDiff = matric.y2025.pct - matric.y2024.pct;
    if (mDiff >= 5 && ePct >= 0) {
      matricLine = `Matric pass rate also improved (${matric.y2024.pct.toFixed(1)}% → ${matric.y2025.pct.toFixed(1)}%), suggesting the staff team is delivering results.`;
    } else if (mDiff <= -5 && ePct <= 0) {
      matricLine = `Matric pass rate dropped at the same time (${matric.y2024.pct.toFixed(1)}% → ${matric.y2025.pct.toFixed(1)}%). Reduced or unstable staffing can be one reason behind weaker results.`;
    } else if (Math.abs(mDiff) < 5) {
      matricLine = `Despite staff changes, matric results stayed close to the same (${matric.y2024.pct.toFixed(1)}% → ${matric.y2025.pct.toFixed(1)}%).`;
    } else {
      matricLine = `Matric pass rate moved from ${matric.y2024.pct.toFixed(1)}% to ${matric.y2025.pct.toFixed(1)}%, which is worth weighing alongside the staffing trend.`;
    }
  }

  const bullets = [ratioLine, alignmentLine, matricLine].filter(Boolean);

  return (
    <div className="rounded-xl border border-border bg-accent/10 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-accent">
        What this means for parents
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{staffHeadline}</div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{staffBody}</p>
      {bullets.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        Built from this school's own learner, educator{isSecondary ? ", and matric" : ""} numbers.
      </p>
    </div>
  );
};

/**
 * Leadership timeline card. Visualises principal across years and highlights changes.
 */
const LeadershipCard = ({
  values,
  learners,
  educators,
  matric,
  phase,
  currentSchoolId,
}: {
  values: Record<DataYear, string | null>;
  learners?: Record<DataYear, number | null>;
  educators?: Record<DataYear, number | null>;
  matric?: MatricResults | null;
  phase?: string | null;
  currentSchoolId?: string;
}) => {
  // Tokenise a name into meaningful parts: lowercase, strip punctuation,
  // and drop common titles / single-letter initials so we can fuzzy-match
  // records that refer to the same person captured differently over years.
  // e.g. "Emmanuel Mohale" and "Selaelo Emmanuel Mohale" share {emmanuel, mohale}
  // and "Madisha Ms" and "Mathewes Madisha" share {madisha}.
  const TITLES = new Set([
    "mr", "mrs", "ms", "miss", "dr", "prof", "mnr", "mev", "rev",
  ]);
  // Best-effort honorific from a raw principal string. We:
  //  1. Honour an explicit title already in the source ("Mr Smith", "Mrs J Dlamini").
  //  2. Otherwise look up the first non-initial first name against a small
  //     dictionary of common SA male/female names. If we cannot tell, return "".
  // Names not in the dictionary intentionally get NO honorific so we never guess wrong.
  const MALE_FIRST_NAMES = new Set([
    // English / Afrikaans
    "john","james","peter","paul","david","michael","andrew","mark","stephen","richard","robert","william","george","henry","thomas","charles","edward","kevin","brian","gary","barry","wayne","craig","shaun","ryan","jason","gavin","trevor","clive","grant","neil","nigel","derek","kobus","pieter","johan","jaco","francois","wynand","hennie","gerhard","christo","willem","stefan","stephan","hermann","rudolph","hendrik","koos","sarel",
    // African (Nguni / Sotho / Tsonga / Venda) – common male names
    "sipho","thabo","themba","mandla","bongani","sibusiso","sandile","mxolisi","sifiso","lungelo","lwazi","musa","nkosi","mzwandile","vusi","vusumuzi","zwelibanzi","mthunzi","mlungisi","mfundo","menzi","khanyiso","lindokuhle","sabelo","siyabonga","siyanda","siphesihle","luyanda","kagiso","tshepo","kabelo","karabo","lebogang","lehlohonolo","letlhogonolo","mpho","tumelo","tebogo","tlotliso","reabetswe","refilwe","oratile","oarabile","mogau","mogale","molefi","tshepiso","tshegofatso","keletso","keabetswe","onkemetse","khotso","emmanuel","nkosinathi","nkululeko","mxolisi","sibongiseni","mhlonipheni","amukelani","hlamulo","rhulani","tinyiko","mukondi","mulalo","mukondeleli","ndivhuwo","tshilidzi","khathutshelo","rendani","ronewa","aluwani","azwianewi","mashudu","selaelo","mohale","kgosi","letlama","ofentse","obakeng","keabetswe","kabello",
  ]);
  const FEMALE_FIRST_NAMES = new Set([
    // English / Afrikaans
    "mary","jane","susan","sarah","sara","linda","patricia","jennifer","elizabeth","margaret","barbara","helen","karen","nancy","betty","ruth","julie","gloria","cheryl","carol","janet","wendy","marie","yvonne","marlene","annette","cynthia","rosemary","heather","lynn","melanie","sharon","theresa","beverley","colleen","tracey","charmaine","tanya","jacqueline","michelle","nicole","leigh","candice","amanda","cindy","melinda","jessica","megan","kayleigh","tasneem","fatima","aisha","ayesha","zainab","raeesah","zubeida","naadia","aaliyah","retha","martie","marietjie","annelize","annemarie","susanna","susarah","magdalena","christina","cornelia","engela","engeline","henriette","jeanette","johanna","katrien","lize","liezel","mariska","minnette","ronel","theunsina","wilna","yolande",
    // African female names
    "nomvula","nomsa","nokuthula","nonhlanhla","nokulunga","nkosazana","nontsikelelo","ntombizodwa","ntombi","thandi","thandiwe","thando","thembi","thembeka","zanele","zandile","zinhle","zoleka","zola","zinzi","zelda","busisiwe","buhle","busi","bukiwe","bongiwe","gugu","gugulethu","khanyisile","kholeka","khethiwe","khulisile","lerato","lesedi","lebohang","lebogang","lindiwe","lerato","lillian","lulama","lungile","makhosi","mavis","matshidiso","mathapelo","mathabo","matumelo","matlhogonolo","mosa","mpho","mpumi","mpumelelo","ntando","nelisiwe","nondumiso","palesa","pinky","portia","precious","puleng","refilwe","rethabile","rorisang","sibongile","silindile","sindiswa","siphokazi","siphosethu","siyabonga","tebogo","tendai","thabisile","thabang","tshepiso","tholiwe","tumi","unathi","violet","winnie","xoliswa","yandiswa","yonela","azwifaneli","mbavhalelo","muofhe","ndivhuwo","ndaedzo","tshifhiwa","tshilidzi","vhonani","amukelani","khanyisa","rhulani","saraphina","khensani","tinyiko","makhosini","mhlanguli","sasha","sashni","sashia","yashika","kavitha","priya","reshma","shanti","ramona","vanessa","valencia","verna","vivian","wendy","winnifred","yolisa","zama","zameka","zandile",
  ]);
  const inferHonorific = (raw: string | null): string | null => {
    if (!raw) return null;
    const cleaned = raw.replace(/\./g, " ").replace(/\s+/g, " ").trim();
    const tokens = cleaned.split(/\s+/);
    // 1. Explicit title anywhere in the string
    for (const t of tokens) {
      const lc = t.toLowerCase();
      if (lc === "mr" || lc === "mnr") return "Mr";
      if (lc === "mrs" || lc === "mev") return "Mrs";
      if (lc === "ms" || lc === "miss") return "Ms";
      if (lc === "dr") return "Dr";
      if (lc === "prof") return "Prof";
    }
    // 2. First non-initial token vs name dictionary
    for (const t of tokens) {
      const lc = t.toLowerCase().replace(/[^a-z]/g, "");
      if (lc.length < 3) continue;
      if (MALE_FIRST_NAMES.has(lc)) return "Mr";
      if (FEMALE_FIRST_NAMES.has(lc)) return "Mrs";
      // Stop after the first usable token; do not scan further tokens
      // (those are likely surnames and would mislead).
      break;
    }
    return null;
  };
  // Strip leading title tokens from a raw name before re-applying our chosen honorific.
  const stripLeadingTitle = (raw: string): string => {
    return raw
      .replace(/^\s*(mr|mrs|ms|miss|dr|prof|mnr|mev|rev)\.?\s+/i, "")
      .trim();
  };
  // Format a name for display: "<Honorific> <Name>" when we are confident, else just the name.
  const formatPrincipalDisplay = (raw: string | null): string => {
    if (!raw) return "—";
    const honorific = inferHonorific(raw);
    const base = stripLeadingTitle(raw);
    return honorific ? `${honorific} ${base}` : base;
  };
  const tokenise = (n: string): Set<string> => {
    const tokens = n
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !TITLES.has(t));
    return new Set(tokens);
  };

  // Two names are considered the same person if they share at least one
  // non-trivial token (typically a surname or distinctive first name).
  const samePerson = (a: Set<string>, b: Set<string>) => {
    for (const t of a) if (b.has(t)) return true;
    return false;
  };

  // Build groups of related names. Each group gets a stable key (the first
  // raw name encountered) and a canonical display name = longest variant.
  type Group = { key: string; tokens: Set<string>; canonical: string };
  const groups: Group[] = [];
  const yearToGroupKey = new Map<DataYear, string>();
  for (const y of HISTORY_YEARS) {
    const raw = values[y];
    if (!raw) continue;
    const tokens = tokenise(raw);
    if (tokens.size === 0) continue;
    let group = groups.find((g) => samePerson(g.tokens, tokens));
    if (!group) {
      group = { key: raw, tokens: new Set(tokens), canonical: raw };
      groups.push(group);
    } else {
      // Merge tokens so future comparisons can chain (A~B, B~C ⇒ A~C).
      for (const t of tokens) group.tokens.add(t);
      if (raw.length > group.canonical.length) group.canonical = raw;
    }
    yearToGroupKey.set(y, group.key);
  }

  const entries = HISTORY_YEARS.map((y) => {
    const key = yearToGroupKey.get(y) ?? "";
    const group = key ? groups.find((g) => g.key === key) : undefined;
    const rawName = group?.canonical ?? null;
    return {
      year: y,
      key,
      name: rawName ? formatPrincipalDisplay(rawName) : null,
      rawName,
    };
  });
  const known = entries.filter((e) => e.name);
  const uniqueKeys = Array.from(new Set(known.map((e) => e.key)));
  const changes = uniqueKeys.length > 1 ? uniqueKeys.length - 1 : 0;
  const current = [...entries].reverse().find((e) => e.name);

  // Build a CV record per distinct principal up-front so we can render the
  // current principal's CV inside the highlight block, and the rest below.
  const phaseUp = (phase || "").toUpperCase();
  const isSecondary = phaseUp.includes("SECONDARY") || phaseUp.includes("COMBINED");

  type PrincipalCv = {
    key: string;
    name: string;
    tenureStart: DataYear;
    tenureEnd: DataYear;
    impactSentence: string;
    historySentence: string;
    previousPosts: ReturnType<typeof findPrincipalAtOtherSchools>;
  };

  const buildCv = (key: string): PrincipalCv | null => {
    const yearsForKey = entries.filter((e) => e.key === key).map((e) => e.year);
    if (yearsForKey.length === 0) return null;
    const entryForKey = entries.find((e) => e.key === key);
    const name = entryForKey?.name ?? key;
    const rawNameForLookup = entryForKey?.rawName ?? key;
    const tenureStart = yearsForKey[0];
    const tenureEnd = yearsForKey[yearsForKey.length - 1];

    const yearBefore = (() => {
      const idx = HISTORY_YEARS.indexOf(tenureStart);
      return idx > 0 ? HISTORY_YEARS[idx - 1] : tenureStart;
    })();

    const learnFrom = learners?.[yearBefore] ?? null;
    const learnTo = learners?.[tenureEnd] ?? null;
    const eduFrom = educators?.[yearBefore] ?? null;
    const eduTo = educators?.[tenureEnd] ?? null;

    const describeChange = (
      from: number | null,
      to: number | null,
      singular: string,
    ): string | null => {
      if (from == null || to == null || from <= 0) return null;
      const diff = to - from;
      const pct = (diff / from) * 100;
      if (Math.abs(pct) < 1) {
        return `${singular} numbers held steady at about ${to.toLocaleString()}`;
      }
      const verb = diff > 0 ? "grew" : "dropped";
      return `${singular} numbers ${verb} from ${from.toLocaleString()} to ${to.toLocaleString()} (${diff > 0 ? "+" : ""}${pct.toFixed(0)}%)`;
    };

    const learnerPhrase = describeChange(learnFrom, learnTo, "Learner");
    const educatorPhrase = describeChange(eduFrom, eduTo, "Educator");

    let matricPhrase: string | null = null;
    if (isSecondary && matric) {
      const yKey = `y${tenureEnd}` as "y2023" | "y2024" | "y2025";
      const yKeyBefore = `y${yearBefore}` as "y2023" | "y2024" | "y2025";
      const endStats = matric[yKey];
      const beforeStats = matric[yKeyBefore];
      if (endStats?.pct != null && beforeStats?.pct != null && yearBefore !== tenureEnd) {
        const diff = endStats.pct - beforeStats.pct;
        const dir = diff >= 0 ? "improved" : "slipped";
        matricPhrase = `the matric pass rate ${dir} from ${beforeStats.pct.toFixed(1)}% to ${endStats.pct.toFixed(1)}% (${diff >= 0 ? "+" : ""}${diff.toFixed(1)} points)`;
      } else if (endStats?.pct != null) {
        matricPhrase = `the matric pass rate stood at ${endStats.pct.toFixed(1)}% in ${tenureEnd}`;
      }
    }

    const previousPosts = currentSchoolId
      ? findPrincipalAtOtherSchools(rawNameForLookup, currentSchoolId)
      : [];

    const tenureClause =
      tenureStart === tenureEnd
        ? `In ${tenureStart}, while ${name} was on record as principal,`
        : `Between ${yearBefore === tenureStart ? tenureStart : `${yearBefore} and ${tenureEnd}`}, while ${name} was on record as principal,`;
    const impactParts: string[] = [];
    if (learnerPhrase) impactParts.push(learnerPhrase.toLowerCase());
    if (educatorPhrase) impactParts.push(educatorPhrase.toLowerCase());
    if (matricPhrase) impactParts.push(matricPhrase);
    const impactSentence =
      impactParts.length > 0
        ? `${tenureClause} ${impactParts.join("; ")}.`
        : `On record as principal in ${tenureStart === tenureEnd ? tenureStart : `${tenureStart}-${tenureEnd}`}. We do not have enough comparable data to describe the change during this period.`;

    let historySentence: string;
    if (previousPosts.length === 0) {
      historySentence = `Our directory shows no other postings for ${name} between 2023 and 2025, so this appears to be the only school where ${name} has been recorded as principal in our dataset.`;
    } else {
      const list = previousPosts.slice(0, 4).map((p) => p.schoolName).join(", ");
      const more = previousPosts.length > 4 ? `, plus ${previousPosts.length - 4} more` : "";
      historySentence = `The same name also appears as principal at ${previousPosts.length} other school${previousPosts.length === 1 ? "" : "s"} in our directory: ${list}${more}. This suggests prior leadership experience elsewhere.`;
    }

    return {
      key,
      name,
      tenureStart,
      tenureEnd,
      impactSentence,
      historySentence,
      previousPosts,
    };
  };

  const allCvs = uniqueKeys.map(buildCv).filter((c): c is PrincipalCv => !!c);
  const currentCv = current?.key ? allCvs.find((c) => c.key === current.key) ?? null : null;
  const pastCvs = allCvs.filter((c) => c.key !== currentCv?.key);

  const renderCvBody = (cv: PrincipalCv) => (
    <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
      <p>
        <span className="font-semibold text-foreground">Impact at this school. </span>
        {cv.impactSentence}
      </p>
      <p>
        <span className="font-semibold text-foreground">Career history. </span>
        {cv.historySentence}
      </p>
      {cv.previousPosts.length > 0 && (
        <ul className="mt-1.5 space-y-1 pl-1 text-sm">
          {cv.previousPosts.slice(0, 5).map((p) => (
            <li key={p.schoolId}>
              <Link
                to={schoolHref({ name: p.schoolName, id: p.schoolId })}
                className="text-primary hover:underline"
              >
                {p.schoolName}
              </Link>
              <span className="text-muted-foreground">
                {p.district ? ` · ${p.district}` : ""} · listed {p.year}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Leadership
            </div>
            <h2 className="mt-1 text-lg font-semibold">Principal history</h2>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <User className="h-5 w-5" />
          </div>
        </div>

        {/* Current principal highlight */}
        <div className="mt-5 rounded-xl border border-border bg-primary-soft/40 p-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Current principal ({current?.year ?? "—"})
          </div>
          <div className="mt-1 text-xl font-bold tracking-tight text-foreground">
            {current?.name ?? "—"}
          </div>
          {currentCv && (
            <div className="mt-4 border-t border-border/60 pt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Principal CV
              </div>
              <div className="mt-2">{renderCvBody(currentCv)}</div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Timeline
          </div>
          <ol className="mt-3 space-y-3">
            {entries.map((e, i) => {
              const prevKey = i > 0 ? entries[i - 1].key : "";
              const changed = !!(e.key && prevKey && e.key !== prevKey);
              const continued = !!(e.key && prevKey && e.key === prevKey);
              const isLast = i === entries.length - 1;
              return (
                <li key={e.year} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        e.name
                          ? changed
                            ? "bg-accent text-accent-foreground"
                            : continued
                            ? "bg-primary-soft text-primary"
                            : "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {e.year.slice(2)}
                    </div>
                    {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          continued ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {e.name ? (continued ? "Continued in role" : e.name) : "—"}
                      </span>
                      {changed && (
                        <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
                          New principal
                        </Badge>
                      )}
                      {!changed && !continued && e.name && i > 0 && (
                        <Badge variant="outline">First on record</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{e.year}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Stats */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Distinct leaders</div>
            <div className="text-lg font-bold">{uniqueKeys.length || "—"}</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Changes</div>
            <div className="text-lg font-bold">{changes}</div>
          </div>
        </div>

        {/* Per-principal CV: tenure, what changed during their time, other schools they appear at */}
        {(() => {
          if (pastCvs.length === 0) return null;

          return (
            <div className="mt-5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Previous principals
              </div>
              <div className="mt-2 space-y-3">
                {pastCvs.map((cv) => {
                  const tenureLabel =
                    cv.tenureStart === cv.tenureEnd
                      ? `On record in ${cv.tenureStart}`
                      : `On record ${cv.tenureStart} – ${cv.tenureEnd}`;
                  return (
                    <div
                      key={cv.key}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-foreground">
                          {cv.name}
                        </div>
                        <Badge variant="outline" className="text-[11px]">
                          {tenureLabel}
                        </Badge>
                      </div>

                      <div className="mt-3">{renderCvBody(cv)}</div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Built from this school's principal records and matched against our school directory.
              </p>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

/**
 * Matric Results card. Renders 3-year NSC pass rate history (2023–2025)
 * from the official Department of Basic Education School Performance
 * Report. Includes a bar chart, year-on-year trend chips, a pass-rate
 * tier badge, and breakdowns of wrote / passed / failed learners.
 */
const passTier = (pct: number) => {
  if (pct >= 95) return { label: "Top tier", cls: "bg-emerald-600 text-white" };
  if (pct >= 85) return { label: "Strong", cls: "bg-emerald-500 text-white" };
  if (pct >= 70) return { label: "On track", cls: "bg-amber-500 text-white" };
  if (pct >= 50) return { label: "Needs support", cls: "bg-orange-500 text-white" };
  return { label: "Underperforming", cls: "bg-rose-600 text-white" };
};

const MatricResultsCard = ({ results }: { results: MatricResults }) => {
  const series = [
    { year: "2023", ...results.y2023 },
    { year: "2024", ...results.y2024 },
    { year: "2025", ...results.y2025 },
  ];
  const latest = series[series.length - 1];
  const earliest = series[0];
  const maxPct = Math.max(...series.map((s) => s.pct), 100);
  const tier = passTier(latest.pct);

  const totalAchieved3yr = series.reduce((a, s) => a + s.achieved, 0);
  const totalWrote3yr = series.reduce((a, s) => a + s.wrote, 0);
  const avgPct = totalWrote3yr ? (totalAchieved3yr / totalWrote3yr) * 100 : 0;

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Award className="h-3.5 w-3.5" />
              Grade 12 NSC pass rate
            </div>
            <h2 className="mt-1 text-lg font-semibold">Matric results</h2>
            {results.centreNo && (
              <div className="mt-1 text-xs text-muted-foreground">
                Centre number:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {results.centreNo}
                </span>
              </div>
            )}
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Award className="h-5 w-5" />
          </div>
        </div>

        {/* Headline */}
        <div className="mt-5 flex items-end gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Latest ({latest.year})
            </div>
            <div className="text-4xl font-bold tracking-tight leading-none">
              {latest.pct.toFixed(1)}%
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {latest.achieved.toLocaleString()} of{" "}
              {latest.wrote.toLocaleString()} learners passed
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tier.cls}`}
            >
              {tier.label}
            </span>
            <div className="text-[11px] text-muted-foreground">
              vs {earliest.year}:{" "}
              <span
                className={
                  latest.pct - earliest.pct >= 0
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-rose-700"
                }
              >
                {latest.pct - earliest.pct >= 0 ? "+" : ""}
                {(latest.pct - earliest.pct).toFixed(1)} pp
              </span>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="mt-6">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Year-on-year pass rate
          </div>
          <div className="mt-3 flex h-56 items-end justify-around gap-3 rounded-xl border border-border bg-muted/30 px-4 pt-4 pb-2">
            {series.map((s, i) => {
              const heightPct = (s.pct / maxPct) * 100;
              const prev = i > 0 ? series[i - 1].pct : null;
              const isLatest = i === series.length - 1;
              const diff = prev != null ? s.pct - prev : null;
              return (
                <div
                  key={s.year}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <div className="flex h-14 flex-col items-center justify-end gap-0.5">
                    {diff != null && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          diff > 0
                            ? "text-emerald-700 bg-emerald-100"
                            : diff < 0
                            ? "text-rose-700 bg-rose-100"
                            : "text-muted-foreground bg-muted"
                        }`}
                      >
                        {diff > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : diff < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(1)}pp
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-foreground">
                      {s.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className={`w-full max-w-[48px] rounded-t-md transition-all ${
                        isLatest ? "bg-primary" : "bg-primary/50"
                      }`}
                      style={{
                        height: `${heightPct}%`,
                        minHeight: heightPct > 0 ? 4 : 0,
                      }}
                      aria-label={`${s.year}: ${s.pct.toFixed(1)}% pass rate`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {s.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-year breakdown */}
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Year-by-year breakdown
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Year</th>
                  <th className="px-3 py-2 text-right font-semibold">Wrote</th>
                  <th className="px-3 py-2 text-right font-semibold">Passed</th>
                  <th className="px-3 py-2 text-right font-semibold">Failed</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => {
                  const failed = Math.max(0, s.wrote - s.achieved);
                  return (
                    <tr key={s.year} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold">{s.year}</td>
                      <td className="px-3 py-2 text-right">
                        {s.wrote.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-700 font-medium">
                        {s.achieved.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-rose-700 font-medium">
                        {failed.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">3-year average</div>
            <div className="text-lg font-bold">{avgPct.toFixed(1)}%</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">3-year pass total</div>
            <div className="text-lg font-bold">
              {totalAchieved3yr.toLocaleString()}
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Source: Department of Basic Education, 2025 NSC (National Senior
          Certificate) School Performance Report. Figures reflect Grade 12
          learners who wrote the matric exams. "Failed" is calculated as Wrote
          minus Passed.
        </p>
      </CardContent>
    </Card>
  );
};

/**
 * Feeder Zone card. Uses the school's coordinates to find every unique
 * locality (suburb / township / town) of any other school within a 5km
 * radius, computed via the Haversine formula on the bundled dataset.
 */
const FEEDER_RADIUS_KM = 5;

const haversineKm = (
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

type FeederArea = {
  name: string;
  kind: "Suburb" | "Township" | "Town";
  distance: number; // km, distance of nearest school in this area
  schoolCount: number;
};

const FeederZoneCard = ({
  lat,
  lon,
  selfId,
  year,
}: {
  lat: number;
  lon: number;
  selfId: string;
  year: DataYear;
}) => {
  const areas = useMemo<FeederArea[]>(() => {
    const all = getSchools(year);
    // Map key = `${kind}|${normalised name}` so we don't double-count when
    // the same locality appears in different fields.
    const map = new Map<string, FeederArea>();
    for (const s of all) {
      if (s.id === selfId) continue;
      if (s.latitude == null || s.longitude == null) continue;
      const d = haversineKm(lat, lon, s.latitude, s.longitude);
      if (d > FEEDER_RADIUS_KM) continue;
      const candidates: { kind: FeederArea["kind"]; raw: string | null | undefined }[] = [
        { kind: "Suburb", raw: s.suburb },
        { kind: "Township", raw: s.township },
        { kind: "Town", raw: s.town },
      ];
      for (const { kind, raw } of candidates) {
        if (!raw) continue;
        const name = titleCase(raw);
        if (!name) continue;
        const key = `${kind}|${name.toLowerCase()}`;
        const existing = map.get(key);
        if (existing) {
          existing.schoolCount += 1;
          if (d < existing.distance) existing.distance = d;
        } else {
          map.set(key, { name, kind, distance: d, schoolCount: 1 });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.distance - b.distance);
  }, [lat, lon, selfId, year]);

  const kindStyles: Record<FeederArea["kind"], string> = {
    Suburb: "bg-primary-soft text-primary",
    Township: "bg-accent/15 text-accent",
    Town: "bg-muted text-foreground",
  };

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Compass className="h-3.5 w-3.5" />
              Catchment
            </div>
            <h2 className="mt-1 text-lg font-semibold">Feeder Zone</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Areas within {FEEDER_RADIUS_KM} km of the school
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Compass className="h-5 w-5" />
          </div>
        </div>

        {/* Headline */}
        <div className="mt-5 flex items-end gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Areas in zone
            </div>
            <div className="text-4xl font-bold tracking-tight leading-none">
              {areas.length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              within {FEEDER_RADIUS_KM} km radius
            </div>
          </div>
        </div>

        {areas.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No neighbouring areas found within {FEEDER_RADIUS_KM} km.
          </div>
        ) : (
          <>
            {(() => {
              // Dedupe area names case-insensitively before picking the top 5
              // so the same town doesn't appear twice in the summary sentence.
              const seen = new Set<string>();
              const uniqueAreas = areas.filter((a) => {
                const key = a.name.trim().toLowerCase();
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
              });
              const top = uniqueAreas.slice(0, 5);
              const remaining = uniqueAreas.length - top.length;
              const names = top.map((a) => a.name);
              const namesText =
                names.length <= 1
                  ? names.join("")
                  : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
              const tail =
                remaining > 0
                  ? ` Children also travel in from ${remaining} other nearby ${remaining === 1 ? "area" : "areas"} – see the full list below.`
                  : "";
              return (
                <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    This school mainly serves children who live in {namesText}, all within {FEEDER_RADIUS_KM} km of the gate.{tail}
                  </p>
                </div>
              );
            })()}
            <ol className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
            {areas.map((a) => (
              <li
                key={`${a.kind}-${a.name}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {a.name}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${kindStyles[a.kind]}`}
                    >
                      {a.kind}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {a.schoolCount} {a.schoolCount === 1 ? "school" : "schools"} nearby
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-foreground">
                    {a.distance < 1
                      ? `${Math.round(a.distance * 1000)} m`
                      : `${a.distance.toFixed(1)} km`}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    away
                  </div>
                </div>
              </li>
            ))}
            </ol>
          </>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Walk-In Centre card. For PUBLIC schools, matches the school's locality
 * (suburb / township / town / municipality) against the bundled
 * 2026 Decentralised Walk-In Centre dataset and shows the relevant
 * centre(s) parents can visit for Grade 1 / Grade 8 admissions.
 */
const WalkInCentreCard = ({
  school,
}: {
  school: {
    name?: string | null;
    phase?: string | null;
    suburb?: string | null;
    township?: string | null;
    town?: string | null;
    municipality?: string | null;
    district?: string | null;
  };
}) => {
  const matches = useMemo(() => findWalkInCentresForSchool(school), [school]);
  const uniqueMatches = useMemo(() => {
    const map = new Map<
      string,
      { centre: (typeof matches)[number]["centre"]; matchedAreas: string[] }
    >();
    for (const m of matches) {
      const key = `${m.centre.region}|${m.centre.subRegion}|${m.centre.address}`;
      const existing = map.get(key);
      if (existing) {
        if (!existing.matchedAreas.includes(m.matchedArea)) {
          existing.matchedAreas.push(m.matchedArea);
        }
      } else {
        map.set(key, { centre: m.centre, matchedAreas: [m.matchedArea] });
      }
    }
    return Array.from(map.values());
  }, [matches]);

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              2027 GDE Admissions
            </div>
            <h2 className="mt-1 text-lg font-semibold">{displayName(school)} 2027 Application</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Recent application windows and our predicted 2027 dates.
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5">
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Academic Year</TableHead>
                  <TableHead className="font-semibold text-foreground">Applications Opened</TableHead>
                  <TableHead className="font-semibold text-foreground">Applications Closed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {APPLICATION_HISTORY.map((row) => (
                  <TableRow key={row.year} className={row.predicted ? "bg-primary-soft/40" : undefined}>
                    <TableCell className="font-medium">
                      {row.year}
                      {row.predicted && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Predicted
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{row.opened}</TableCell>
                    <TableCell>{row.closed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Apply on the official GDE Online Admissions portal:{" "}
            <a
              href="https://www.gdeadmissions.gov.za"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              www.gdeadmissions.gov.za
            </a>
            .
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Prefer help from a real person? Visit one of the walk-in centres below — staff will assist you to apply in person.
          </p>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">Walk-In Centre</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            For Grade 1 &amp; Grade 8 application support
          </p>
          <div className="mt-4">
        {uniqueMatches.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No matching walk-in centre found for this area.{" "}
            <Link to="/admissions" className="font-medium text-primary hover:underline">
              Browse all centres
            </Link>
            .
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {uniqueMatches.slice(0, 3).map((m, i) => (
              <li
                key={`${m.centre.region}-${m.centre.subRegion}-${m.centre.address}-${i}`}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {m.centre.subRegion}
                  </span>
                  <Badge variant="outline" className="font-normal">
                    {m.centre.region}
                  </Badge>
                  {m.matchedAreas.map((area) => (
                    <Badge
                      key={area}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Matched: {area}
                    </Badge>
                  ))}
                </div>
                <a
                  href={walkInMapsHref(m.centre.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-start gap-1.5 text-sm text-muted-foreground hover:text-primary"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{m.centre.address}</span>
                </a>
                {m.centre.contacts.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {m.centre.contacts.slice(0, 3).map((p, j) => (
                      <li
                        key={j}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="truncate text-foreground">{p.name}</span>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 px-2 text-xs"
                        >
                          <a href={telHref(p.phone)}>
                            <Phone className="h-3 w-3" />
                            {p.phone}
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {uniqueMatches.length > 3 && (
              <li className="text-center text-xs text-muted-foreground">
                +{uniqueMatches.length - 3} more matching{" "}
                {uniqueMatches.length - 3 === 1 ? "centre" : "centres"} —{" "}
                <Link to="/admissions" className="font-medium text-primary hover:underline">
                  view all
                </Link>
              </li>
            )}
          </ul>
        )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Lists schools of the same Phase that share the school's township, suburb,
 * or town. Helps families compare nearby options at the same level.
 */
const SimilarSchoolsCard = ({
  school,
  year,
}: {
  school: ReturnType<typeof findSchool>;
  year: DataYear;
}) => {
  const similar = useMemo(() => {
    if (!school?.phase) return [] as { school: NonNullable<ReturnType<typeof findSchool>>; matchedField: "Township" | "Suburb" | "Town"; matchedValue: string }[];
    const norm = (v?: string | null) => (v ?? "").trim().toLowerCase();
    const phase = norm(school.phase);
    const fields: { key: "Township" | "Suburb" | "Town"; raw: string | null | undefined }[] = [
      { key: "Township", raw: school.township },
      { key: "Suburb", raw: school.suburb },
      { key: "Town", raw: school.town },
    ];
    const targets = fields
      .map((f) => ({ key: f.key, value: norm(f.raw) }))
      .filter((f) => f.value.length > 0);
    if (targets.length === 0) return [];

    const all = getSchools(year);
    const seen = new Set<string>();
    const out: { school: NonNullable<ReturnType<typeof findSchool>>; matchedField: "Township" | "Suburb" | "Town"; matchedValue: string }[] = [];
    for (const s of all) {
      if (s.id === school.id) continue;
      if (norm(s.phase) !== phase) continue;
      let match: { key: "Township" | "Suburb" | "Town"; value: string } | null = null;
      for (const t of targets) {
        if (
          (t.key === "Township" && norm(s.township) === t.value) ||
          (t.key === "Suburb" && norm(s.suburb) === t.value) ||
          (t.key === "Town" && norm(s.town) === t.value)
        ) {
          match = t;
          break;
        }
      }
      if (!match) continue;
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      out.push({ school: s, matchedField: match.key, matchedValue: titleCase(match.value) });
    }
    // Stable sort: same-field matches together, then alphabetical by name.
    const order: Record<string, number> = { Township: 0, Suburb: 1, Town: 2 };
    out.sort((a, b) => {
      const f = order[a.matchedField] - order[b.matchedField];
      if (f !== 0) return f;
      return a.school.name.localeCompare(b.school.name);
    });
    return out;
  }, [school, year]);

  if (!school?.phase) return null;

  const phaseLabel = titleCase(school.phase);
  // Phase descriptor without trailing "School(s)" so we can safely append
  // " school" / " schools" without producing "primary school schools".
  const phaseWord = phaseLabel.replace(/\s*schools?$/i, "").trim() || phaseLabel;
  const fieldStyles: Record<"Township" | "Suburb" | "Town", string> = {
    Township: "bg-accent/15 text-accent",
    Suburb: "bg-primary-soft text-primary",
    Town: "bg-muted text-foreground",
  };

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <SchoolIcon className="h-3.5 w-3.5" />
              Nearby same-phase
            </div>
            <h2 className="mt-1 text-lg font-semibold leading-snug">
              {(() => {
                // Phase label without trailing "School(s)" so we don't say
                // "Primary School schools".
                // Dedupe location values case-insensitively (suburb may equal town).
                const seen = new Set<string>();
                const parts: { label: string; value: string }[] = [];
                const push = (label: string, raw?: string | null) => {
                  if (!raw) return;
                  const value = titleCase(raw);
                  const key = value.toLowerCase();
                  if (!value || seen.has(key)) return;
                  seen.add(key);
                  parts.push({ label, value });
                };
                push("Suburb", school.suburb);
                push("Township", school.township);
                push("Town", school.town);
                if (parts.length === 0) return "Similar Schools";
                return (
                  <>
                    {phaseWord} schools in{" "}
                    {parts.map((p, i) => (
                      <span key={p.label}>
                        <Link
                          to={`/?q=${encodeURIComponent(p.value)}`}
                          className="text-primary hover:underline"
                        >
                          {p.value}
                        </Link>
                        {i < parts.length - 2 ? ", " : i === parts.length - 2 ? " or " : ""}
                      </span>
                    ))}
                  </>
                );
              })()}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Other {phaseWord.toLowerCase()} schools in the same area
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <SchoolIcon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 flex items-end gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Schools found
            </div>
            <div className="text-4xl font-bold tracking-tight leading-none">
              {similar.length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{phaseWord.toLowerCase()} school{similar.length === 1 ? "" : "s"}</div>
          </div>
        </div>

        {similar.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No other {phaseLabel.toLowerCase()} schools found in the same area.
          </div>
        ) : (
          <ol className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
            {similar.map((item) => (
              <li
                key={item.school.id}
                className="rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={schoolHref(item.school)}
                      className="block truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                    >
                      {displayName(item.school)}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${fieldStyles[item.matchedField]}`}
                      >
                        {item.matchedField}: {item.matchedValue}
                      </span>
                      {item.school.sector && (
                        <span className="text-[11px] text-muted-foreground">
                          {titleCase(item.school.sector)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

const SchoolDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isNamibiaSlug = !!slug && /-namibia$/i.test(slug);
  const namibiaSchool = useMemo(
    () => (isNamibiaSlug && slug ? findNamibiaSchoolBySlug(slug) : undefined),
    [isNamibiaSlug, slug],
  );
  // Slug format: "<kebab-name>-<EMIS id>". Old links of the form
  // "/schools/<id>" still work because idFromSlug returns the trailing digits.
  const id = !isNamibiaSlug && slug ? idFromSlug(slug) : undefined;
  // Multi-year lookup. The "primary" record is the most recent year that has data.
  const records = useMemo(() => {
    const map = {} as Record<DataYear, ReturnType<typeof findSchool>>;
    for (const y of HISTORY_YEARS) map[y] = id ? findSchool(y, id) : undefined;
    return map;
  }, [id]);
  const school = useMemo(() => {
    if (namibiaSchool) return namibiaSchool;
    for (let i = HISTORY_YEARS.length - 1; i >= 0; i--) {
      const r = records[HISTORY_YEARS[i]];
      if (r) return r;
    }
    return undefined;
  }, [records, namibiaSchool]);
  // If the user landed on a non-canonical URL (e.g. just the EMIS id, or a
  // wrong/old slug), redirect to the canonical "<name>-<id>" slug.
  useEffect(() => {
    if (!school || !slug) return;
    const canonicalPath = schoolHref(school);
    if (window.location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [school, slug, navigate]);
  const schoolYear = useMemo<DataYear | undefined>(() => {
    for (let i = HISTORY_YEARS.length - 1; i >= 0; i--) {
      if (records[HISTORY_YEARS[i]]) return HISTORY_YEARS[i];
    }
    return undefined;
  }, [records]);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    toast({ description: `${label} copied to clipboard` });
    setTimeout(() => setCopied(null), 1500);
  };

  if (!school) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="container flex-1 py-16 text-center">
          <h1 className="text-2xl font-semibold">School not found</h1>
          <p className="mt-2 text-muted-foreground">We couldn't find a school with that ID.</p>
          <Button asChild className="mt-6">
            <Link to="/">Back to directory</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const mapQuery = school.streetAddress
    ? cleanAddress(school.streetAddress)
    : school.latitude && school.longitude
    ? `${school.latitude},${school.longitude}`
    : null;

  const mapsUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;

  const mapsEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : null;

  const learnersByYear = HISTORY_YEARS.reduce(
    (acc, y) => ({ ...acc, [y]: records[y]?.learners ?? null }),
    {} as Record<DataYear, number | null>,
  );
  const educatorsByYear = HISTORY_YEARS.reduce(
    (acc, y) => ({ ...acc, [y]: records[y]?.educators ?? null }),
    {} as Record<DataYear, number | null>,
  );
  const principalByYear = HISTORY_YEARS.reduce(
    (acc, y) => ({
      ...acc,
      [y]: records[y]?.principal ? titleCase(records[y]!.principal) : null,
    }),
    {} as Record<DataYear, string | null>,
  );
  const matricResults = getMatricResults(school.emis);
  const province = getProvinceForSchool(school);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SchoolSeo school={school} matric={matricResults} />
      <section
        className="relative border-b border-border/60"
        style={{ background: "var(--hero-gradient)" }}
      >
        <SiteHeader overHero />
        <div className="container pb-16 pt-28 md:pb-24 md:pt-36">
          <div className="mx-auto max-w-3xl text-center text-primary-foreground">
            <Breadcrumb className="mb-4 flex justify-center">
              <BreadcrumbList className="text-primary-foreground/80">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/south-africa" className="hover:text-primary-foreground">South Africa</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-primary-foreground/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/south-africa/${province.slug}`} className="hover:text-primary-foreground">{province.name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-primary-foreground/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="break-all text-primary-foreground">{schoolSlug(school)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to directory
            </Link>

            <div className="mt-6 flex flex-wrap justify-center gap-1.5">
              {school.sector && (
                <Badge className="bg-white/15 text-primary-foreground hover:bg-white/25 border-transparent">
                  {titleCase(school.sector)}
                </Badge>
              )}
              {school.phase && (
                <Badge className="bg-white text-primary hover:bg-white/90 border-transparent">
                  {titleCase(school.phase)}
                </Badge>
              )}
              {school.type && (
                <Badge variant="outline" className="border-white/40 text-primary-foreground">
                  {titleCase(school.type)}
                </Badge>
              )}
              {school.quintile && (
                <Badge variant="outline" className="border-white/40 text-primary-foreground">
                  {school.quintile}
                </Badge>
              )}
              {school.noFee === "YES" && (
                <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 border-transparent">
                  No-fee school
                </Badge>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              {displayName(school)}
            </h1>
            {school.district && (
              <p className="mt-2 text-base text-primary-foreground/85 md:text-lg">
                {titleCase(school.district)} District
              </p>
            )}
          </div>
        </div>
      </section>

      <main className="container flex-1 py-8">
        <div className="mx-auto w-full max-w-3xl">
          <SchoolIntro school={school} matric={matricResults} />
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Contact information</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {school.telephone && (
                  <Detail
                    icon={Phone}
                    label="Telephone"
                    value={
                      <div className="flex items-center gap-2">
                        <a href={`tel:${formatPhone(school.telephone)}`} className="text-primary hover:underline">
                          {formatPhone(school.telephone)}
                        </a>
                        <button
                          onClick={() => copy("Phone", formatPhone(school.telephone!))}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Copy phone"
                        >
                          {copied === "Phone" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    }
                  />
                )}
                {school.principal && (
                  <Detail icon={User} label="Principal" value={titleCase(school.principal)} />
                )}
                {school.email && (
                  <Detail
                    icon={Mail}
                    label="Email"
                    value={
                      <a href={`mailto:${school.email}`} className="text-primary hover:underline">
                        {school.email}
                      </a>
                    }
                  />
                )}
                {school.streetAddress && (
                  <Detail
                    icon={MapPin}
                    label="Street address"
                    value={cleanAddress(school.streetAddress)}
                  />
                )}
                {school.postalAddress && (
                  <Detail
                    icon={Mail}
                    label="Postal address"
                    value={cleanAddress(school.postalAddress)}
                  />
                )}
              </div>

              {mapsUrl && (
                <div className="mt-6 overflow-hidden rounded-xl border border-border">
                  <iframe
                    title={`Map of ${displayName(school)}`}
                    src={mapsEmbedUrl!}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-72 w-full border-0"
                    allowFullScreen
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">School details</h2>
              <div className="mt-5 space-y-5">
                <Detail icon={Hash} label="EMIS number" value={school.emis} />
                {school.district && (
                  <Detail icon={Building2} label="District" value={titleCase(school.district)} />
                )}
                {school.circuit && (
                  <Detail icon={Building2} label="Circuit" value={school.circuit} />
                )}
                {school.urbanRural && (
                  <Detail icon={MapPin} label="Setting" value={titleCase(school.urbanRural)} />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <LearnerEnrolmentCard
              values={learnersByYear}
              educators={educatorsByYear}
              matric={matricResults}
              school={{ noFee: school.noFee, quintile: school.quintile, phase: school.phase }}
            />
            <NumericHistoryCard
              icon={GraduationCap}
              subtitle="Teaching staff"
              title="Educators over time"
              unit="educators"
              values={educatorsByYear}
              accent="accent"
              narrative={
                <EducatorsNarrative
                  educators={educatorsByYear}
                  learners={learnersByYear}
                  matric={matricResults}
                  phase={school.phase}
                />
              }
            />
            <LeadershipCard
              values={principalByYear}
              learners={learnersByYear}
              educators={educatorsByYear}
              matric={matricResults}
              phase={school.phase}
              currentSchoolId={school.id}
            />
            {matricResults && <MatricResultsCard results={matricResults} />}
            {school.latitude != null && school.longitude != null && schoolYear && (
              <FeederZoneCard
                lat={school.latitude}
                lon={school.longitude}
                selfId={school.id}
                year={schoolYear}
              />
            )}
            {school.sector?.toUpperCase() === "PUBLIC" && (
              <WalkInCentreCard school={school} />
            )}
            {school.sector?.toUpperCase() === "PUBLIC" && (
              <SchoolCalendarCard schoolName={displayName(school)} />
            )}
            {school.sector?.toUpperCase() === "PUBLIC" && (
              <SchoolFeesCard
                schoolName={displayName(school)}
                quintile={school.quintile}
                learners={school.learners}
                noFee={school.noFee}
              />
            )}
            {schoolYear && (
              <SimilarSchoolsCard school={school} year={schoolYear} />
            )}
            <ContactSchoolCard
              schoolName={displayName(school)}
              emisId={String(school.id)}
            />
          </div>
        </div>
        <SchoolFaq school={school} matric={matricResults} />
      </main>

      <SiteFooter />
    </div>
  );
};

export default SchoolDetail;