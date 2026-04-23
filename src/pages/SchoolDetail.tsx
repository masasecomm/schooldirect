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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { findSchool, titleCase, displayName, cleanAddress, AVAILABLE_YEARS, type DataYear } from "@/lib/schools";
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

  const barColor = accent === "accent" ? "bg-accent" : "bg-primary";
  const softBg = accent === "accent" ? "bg-accent/10 text-accent" : "bg-primary-soft text-primary";

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

        {/* Bar chart */}
        <div className="mt-6 space-y-3">
          {series.map((s, i) => {
            const prev = i > 0 ? series[i - 1].value : null;
            const widthPct =
              typeof s.value === "number" && max > 0 ? (s.value / max) * 100 : 0;
            return (
              <div key={s.year} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">{s.year}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {typeof s.value === "number" ? s.value.toLocaleString() : "—"}
                    </span>
                    {typeof s.value === "number" && typeof prev === "number" && (
                      <TrendChip from={prev} to={s.value} />
                    )}
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

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
  const entries = HISTORY_YEARS.map((y) => ({ year: y, name: values[y] }));
  const known = entries.filter((e) => e.name);
  const uniqueNames = Array.from(new Set(known.map((e) => e.name as string)));
  const changes = uniqueNames.length > 1 ? uniqueNames.length - 1 : 0;
  const tenure = known.length;
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
              const prev = i > 0 ? entries[i - 1].name : null;
              const changed = !!(e.name && prev && e.name !== prev);
              const isLast = i === entries.length - 1;
              return (
                <li key={e.year} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        e.name
                          ? changed
                            ? "bg-accent text-accent-foreground"
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
                      <span className="text-sm font-semibold text-foreground">
                        {e.name ?? "—"}
                      </span>
                      {changed && (
                        <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
                          New principal
                        </Badge>
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
            <div className="text-lg font-bold">{uniqueNames.length || "—"}</div>
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
            <HistoryCard
              icon={Users}
              subtitle="Learner enrolment"
              title="Learners over time"
              values={learnersByYear}
            />
            <HistoryCard
              icon={GraduationCap}
              subtitle="Teaching staff"
              title="Educators over time"
              values={educatorsByYear}
            />
            <HistoryCard
              icon={User}
              subtitle="Leadership"
              title="Principal history"
              values={principalByYear}
              showTrend={false}
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default SchoolDetail;