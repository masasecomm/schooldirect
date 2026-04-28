import { useMemo, useState } from "react";
import { CalendarDays, GraduationCap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Public school calendar data for SA, 2026 and 2027.
 * Source: Government Gazette No. 52177 / 52178, 25 February 2025
 * (Department of Basic Education, Published School Calendars).
 *
 * Used for *public* schools only. Independent / private schools may differ.
 */

type Term = {
  term: 1 | 2 | 3 | 4;
  open: string; // ISO YYYY-MM-DD - first school day for learners
  close: string; // ISO YYYY-MM-DD - last school day for learners
  weeks: number;
  schoolDays: number;
};

type Holiday = { date: string; name: string };

type YearCalendar = {
  year: 2026 | 2027;
  totalSchoolDays: number;
  totalWeeks: number;
  terms: Term[];
  holidays: Holiday[];
};

const CALENDARS: YearCalendar[] = [
  {
    year: 2026,
    totalSchoolDays: 200,
    totalWeeks: 43,
    terms: [
      { term: 1, open: "2026-01-14", close: "2026-03-27", weeks: 11, schoolDays: 53 },
      { term: 2, open: "2026-04-08", close: "2026-06-26", weeks: 12, schoolDays: 54 },
      { term: 3, open: "2026-07-21", close: "2026-09-23", weeks: 10, schoolDays: 46 },
      { term: 4, open: "2026-10-06", close: "2026-12-09", weeks: 10, schoolDays: 47 },
    ],
    holidays: [
      { date: "2026-01-01", name: "New Year's Day" },
      { date: "2026-03-21", name: "Human Rights Day" },
      { date: "2026-04-03", name: "Good Friday" },
      { date: "2026-04-06", name: "Family Day" },
      { date: "2026-04-27", name: "Freedom Day" },
      { date: "2026-05-01", name: "Workers' Day" },
      { date: "2026-06-15", name: "Special School Holiday" },
      { date: "2026-06-16", name: "Youth Day" },
      { date: "2026-08-09", name: "National Women's Day" },
      { date: "2026-08-10", name: "Public Holiday" },
      { date: "2026-09-24", name: "Heritage Day" },
      { date: "2026-12-16", name: "Day of Reconciliation" },
      { date: "2026-12-25", name: "Christmas Day" },
      { date: "2026-12-26", name: "Day of Goodwill" },
    ],
  },
  {
    year: 2027,
    totalSchoolDays: 197,
    totalWeeks: 42,
    terms: [
      { term: 1, open: "2027-01-13", close: "2027-03-19", weeks: 10, schoolDays: 48 },
      { term: 2, open: "2027-04-06", close: "2027-06-25", weeks: 12, schoolDays: 56 },
      { term: 3, open: "2027-07-20", close: "2027-09-22", weeks: 10, schoolDays: 46 },
      { term: 4, open: "2027-10-05", close: "2027-12-08", weeks: 10, schoolDays: 47 },
    ],
    holidays: [
      { date: "2027-01-01", name: "New Year's Day" },
      { date: "2027-03-21", name: "Human Rights Day" },
      { date: "2027-03-22", name: "Public Holiday" },
      { date: "2027-03-26", name: "Good Friday" },
      { date: "2027-03-29", name: "Family Day" },
      { date: "2027-04-26", name: "Special School Holiday" },
      { date: "2027-04-27", name: "Freedom Day" },
      { date: "2027-05-01", name: "Workers' Day" },
      { date: "2027-06-16", name: "Youth Day" },
      { date: "2027-08-09", name: "National Women's Day" },
      { date: "2027-09-24", name: "Heritage Day" },
      { date: "2027-12-16", name: "Day of Reconciliation" },
      { date: "2027-12-25", name: "Christmas Day" },
      { date: "2027-12-26", name: "Day of Goodwill" },
      { date: "2027-12-27", name: "Public Holiday" },
    ],
  },
];

const fmtLong = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtShort = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
};

const daysBetween = (fromIso: string, toIso: string) => {
  const a = new Date(`${fromIso}T00:00:00`).getTime();
  const b = new Date(`${toIso}T00:00:00`).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Decide which year tab to default to and what the live status line should say
 * for that school: "in term", "on holiday until X", or "term starts in N days".
 */
const computeStatus = (today: string) => {
  const allTerms = CALENDARS.flatMap((c) => c.terms.map((t) => ({ ...t, year: c.year })));
  // currently in term?
  const active = allTerms.find((t) => today >= t.open && today <= t.close);
  if (active) {
    return {
      defaultYear: active.year,
      tone: "in-term" as const,
      title: `In Term ${active.term}`,
      detail: `Closes ${fmtLong(active.close)} (${daysBetween(today, active.close)} days)`,
    };
  }
  // next upcoming term
  const next = allTerms.find((t) => t.open > today);
  if (next) {
    const days = daysBetween(today, next.open);
    return {
      defaultYear: next.year,
      tone: "holiday" as const,
      title: days <= 0 ? `Term ${next.term} opens today` : `On school holiday`,
      detail:
        days <= 0
          ? `Schools open today, ${fmtLong(next.open)}`
          : `Term ${next.term} opens ${fmtLong(next.open)} (${days} days to go)`,
    };
  }
  return {
    defaultYear: 2027 as const,
    tone: "holiday" as const,
    title: "End of school year",
    detail: "Calendar will be updated when DBE publishes the next year.",
  };
};

export const SchoolCalendarCard = ({ schoolName }: { schoolName: string }) => {
  const status = useMemo(() => computeStatus(todayIso()), []);
  const [year, setYear] = useState<2026 | 2027>(status.defaultYear);
  const cal = CALENDARS.find((c) => c.year === year)!;
  const today = todayIso();

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)] md:col-span-2 xl:col-span-3">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              School calendar
            </div>
            <h2 className="mt-1 text-lg font-semibold">
              {schoolName} term dates
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Public school calendar from the Department of Basic Education. When
              the school opens, closes, and which days are public holidays.
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        {/* Live status banner */}
        <div
          className={`mt-5 rounded-xl border p-4 ${
            status.tone === "in-term"
              ? "border-primary/30 bg-primary-soft/60"
              : "border-accent/30 bg-accent/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-primary">
              {status.tone === "in-term" ? (
                <GraduationCap className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {status.title}
              </p>
              <p className="text-xs text-muted-foreground">{status.detail}</p>
            </div>
          </div>
        </div>

        {/* Year switch */}
        <div className="mt-5 inline-flex rounded-lg border border-border bg-muted/40 p-1">
          {CALENDARS.map((c) => (
            <button
              key={c.year}
              type="button"
              onClick={() => setYear(c.year)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                year === c.year
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.year}
            </button>
          ))}
        </div>

        {/* Term cards */}
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cal.terms.map((t) => {
            const isActive = today >= t.open && today <= t.close;
            const isPast = today > t.close;
            const isUpcoming = today < t.open;
            return (
              <li
                key={t.term}
                className={`rounded-xl border p-4 ${
                  isActive
                    ? "border-primary bg-primary-soft/50"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Term {t.term}
                  </span>
                  {isActive && (
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Now
                    </Badge>
                  )}
                  {isPast && (
                    <Badge variant="outline" className="font-normal">
                      Done
                    </Badge>
                  )}
                  {isUpcoming && (
                    <Badge variant="secondary" className="font-normal">
                      Upcoming
                    </Badge>
                  )}
                </div>
                <dl className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Opens</dt>
                    <dd className="font-medium text-foreground">
                      {fmtShort(t.open)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Closes</dt>
                    <dd className="font-medium text-foreground">
                      {fmtShort(t.close)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">School days</dt>
                    <dd className="font-medium text-foreground">
                      {t.schoolDays} ({t.weeks} weeks)
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>

        {/* Holidays */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Public &amp; school holidays {cal.year}
          </h3>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {cal.holidays.map((h) => {
              const isToday = h.date === today;
              const isPast = h.date < today;
              return (
                <li
                  key={h.date}
                  className={`flex items-center justify-between gap-3 border-b border-border/60 py-1.5 text-sm last:border-0 ${
                    isPast ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  <span className="font-medium">{h.name}</span>
                  <span className="flex items-center gap-2 text-xs">
                    {isToday && (
                      <Badge className="bg-primary text-primary-foreground">
                        Today
                      </Badge>
                    )}
                    <span className="tabular-nums">{fmtShort(h.date)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
          Source: Department of Basic Education, Government Gazette No. 52177 and
          52178, 25 February 2025. Applies to public (state) schools across South
          Africa. Independent and private schools set their own dates.
        </p>
      </CardContent>
    </Card>
  );
};

export default SchoolCalendarCard;