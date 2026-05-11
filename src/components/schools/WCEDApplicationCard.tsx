import { CalendarDays, ExternalLink, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Item = { date: string; label: string };

const GR_R_1_8: Item[] = [
  { date: "10 March 2026", label: "Grades R, 1 and 8 applications open" },
  { date: "14 April 2026", label: "Grades R, 1 and 8 applications close (final submit deadline)" },
  { date: "28 May - 15 June 2026", label: "Parents confirm acceptance of placement" },
  { date: "15 June 2026", label: "Auto-activation of first ranked successful school if not confirmed" },
];

const TRANSFERS: Item[] = [
  { date: "03 - 17 August 2026", label: "Transfer requests for Grades 2-7 and 9-12" },
  { date: "16 - 30 September 2026", label: "Parents confirm transfer placements" },
  { date: "After 30 September 2026", label: "Three additional days only to accept a transfer placement" },
];

export const WCEDApplicationCard = ({ schoolName }: { schoolName: string }) => {
  const year = new Date().getFullYear() + 1;
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)] md:col-span-2 xl:col-span-3">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              WCED online admissions
            </div>
            <h2 className="mt-1 text-lg font-semibold">
              {schoolName} Application {year}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Important dates from the Western Cape Education Department (WCED) online admissions
              system. Applications run on the WCED School Admissions Management Information (SAMI)
              system.
            </p>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Grades R, 1 and 8</h3>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Online</Badge>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {GR_R_1_8.map((i) => (
                <li key={i.date} className="flex justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
                  <span className="text-muted-foreground">{i.label}</span>
                  <span className="shrink-0 font-medium tabular-nums">{i.date}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-accent/40 bg-accent/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Transfers (Grades 2-7, 9-12)</h3>
              <Badge variant="secondary" className="font-normal">Hard copy</Badge>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {TRANSFERS.map((i) => (
                <li key={i.date} className="flex justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
                  <span className="text-muted-foreground">{i.label}</span>
                  <span className="shrink-0 font-medium tabular-nums">{i.date}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Transfers are only considered where the learner has relocated. Use the WCED Transfer
              Request Form at the school of choice or the nearest district office.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Required supporting documents</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Last school report card or results (if previously enrolled)</li>
            <li>Learner ID, birth certificate or passport (study permit for foreign learners)</li>
            <li>Immunisation card (Road to Health Chart) for primary schools</li>
            <li>Proof of residence (municipal account, lease or affidavit)</li>
          </ul>
          <p className="mt-3">
            Placement is subject to the school's admission policy and available spaces. Parents must
            print and keep a copy of the online application.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <a
            href="https://admissionswesterncape.datafree.co/admissions/admission.sm_admissions_tracking.terms_and_conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            WCED admissions terms and conditions <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-muted-foreground">Source: Western Cape Education Department.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WCEDApplicationCard;