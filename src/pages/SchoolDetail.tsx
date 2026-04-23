import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import {
  findSchool,
  titleCase,
  displayName,
  cleanAddress,
  getSchools,
  AVAILABLE_YEARS,
  type DataYear,
} from "@/lib/schools";
import { toast } from "@/hooks/use-toast";

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
}: {
  values: Record<DataYear, number | null>;
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  unit: string;
  values: Record<DataYear, number | null>;
  accent?: "primary" | "accent";
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
      </CardContent>
    </Card>
  );
};

/**
 * Leadership timeline card. Visualises principal across years and highlights changes.
 */
const LeadershipCard = ({
  values,
}: {
  values: Record<DataYear, string | null>;
}) => {
  // Tokenise a name into meaningful parts: lowercase, strip punctuation,
  // and drop common titles / single-letter initials so we can fuzzy-match
  // records that refer to the same person captured differently over years.
  // e.g. "Emmanuel Mohale" and "Selaelo Emmanuel Mohale" share {emmanuel, mohale}
  // and "Madisha Ms" and "Mathewes Madisha" share {madisha}.
  const TITLES = new Set([
    "mr", "mrs", "ms", "miss", "dr", "prof", "mnr", "mev", "rev",
  ]);
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
    return {
      year: y,
      key,
      name: group?.canonical ?? null,
    };
  });
  const known = entries.filter((e) => e.name);
  const uniqueKeys = Array.from(new Set(known.map((e) => e.key)));
  const changes = uniqueKeys.length > 1 ? uniqueKeys.length - 1 : 0;
  const current = [...entries].reverse().find((e) => e.name);

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
          <ol className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
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
        )}
      </CardContent>
    </Card>
  );
};

const SchoolDetail = () => {
  const { id } = useParams<{ id: string }>();
  // Multi-year lookup. The "primary" record is the most recent year that has data.
  const records = useMemo(() => {
    const map = {} as Record<DataYear, ReturnType<typeof findSchool>>;
    for (const y of HISTORY_YEARS) map[y] = id ? findSchool(y, id) : undefined;
    return map;
  }, [id]);
  const school = useMemo(() => {
    for (let i = HISTORY_YEARS.length - 1; i >= 0; i--) {
      const r = records[HISTORY_YEARS[i]];
      if (r) return r;
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="container flex-1 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {school.sector && <Badge variant="secondary">{titleCase(school.sector)}</Badge>}
          {school.phase && (
            <Badge className="bg-primary-soft text-primary hover:bg-primary-soft/80">
              {titleCase(school.phase)}
            </Badge>
          )}
          {school.type && <Badge variant="outline">{titleCase(school.type)}</Badge>}
          {school.quintile && <Badge variant="outline">{school.quintile}</Badge>}
          {school.noFee === "YES" && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">No-fee school</Badge>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {displayName(school)}
        </h1>
        {school.district && (
          <p className="mt-1 text-muted-foreground">{titleCase(school.district)} District</p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Contact information</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {school.telephone && (
                  <Detail
                    icon={Phone}
                    label="Telephone"
                    value={
                      <div className="flex items-center gap-2">
                        <a href={`tel:${school.telephone}`} className="text-primary hover:underline">
                          {school.telephone}
                        </a>
                        <button
                          onClick={() => copy("Phone", school.telephone!)}
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

          <div className="lg:col-span-3 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <LearnerEnrolmentCard values={learnersByYear} />
            <NumericHistoryCard
              icon={GraduationCap}
              subtitle="Teaching staff"
              title="Educators over time"
              unit="educators"
              values={educatorsByYear}
              accent="accent"
            />
            <LeadershipCard values={principalByYear} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default SchoolDetail;