import { useMemo, useState } from "react";
import { MapPin, Phone, Search } from "lucide-react";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  REGIONS,
  groupBySubRegion,
  mapsHref,
  telHref,
  walkInCentres,
  type Region,
} from "@/lib/walk-in-centres";
import { cn } from "@/lib/utils";

const Admissions = () => {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return walkInCentres.filter((c) => {
      if (region !== "All" && c.region !== region) return false;
      if (!q) return true;
      return (
        c.centre.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.subRegion.toLowerCase().includes(q) ||
        c.areasServed.some((a) => a.toLowerCase().includes(q)) ||
        c.contacts.some((p) => p.name.toLowerCase().includes(q))
      );
    });
  }, [query, region]);

  const grouped = useMemo(() => groupBySubRegion(filtered), [filtered]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container flex-1 py-10">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Gauteng school applications 2027
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            GDE Admissions registration
          </h1>
          <p className="mt-3 text-muted-foreground">
            Online registration for Grade 1 2027 Gauteng school and Grade 8 2027 Gauteng learners. Apply through the
            Gauteng Department of Education on Www GDEAdmissions gov za registration online 2026 schools login, then
            visit a walk-in centre if you need help.
          </p>
        </header>

        <section className="mx-auto mt-10 max-w-3xl space-y-4 text-sm leading-relaxed text-foreground">
          <h2 className="text-xl font-semibold tracking-tight">How the GDE Admissions process works</h2>
          <p>
            The Gauteng Department of Education runs one central online system for parents. Use it for Grade 1
            application for 2027 Gauteng and Grade 8 application 2027 Gauteng. The process has four simple steps.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>Register as a parent.</strong> Go to{" "}
              <a
                href="https://www.gdeadmissions.gov.za"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                www.gdeadmissions.gov.za
              </a>{" "}
              and complete the GDE Admissions parent registration online. You need your South African ID or passport
              and a working cellphone number.
            </li>
            <li>
              <strong>Capture each child.</strong> Add your child's details, home address, and current school (for
              Online registration for Grade 8 2026 Gauteng school applicants moving from Grade 7).
            </li>
            <li>
              <strong>Choose up to five schools.</strong> The system uses your home and work address to suggest
              feeder schools by distance.
            </li>
            <li>
              <strong>Submit and upload documents.</strong> Upload the child's birth certificate or ID, proof of
              residence, immunisation card, and the latest school report. Then wait for placement SMS updates.
            </li>
          </ol>
          <p className="text-muted-foreground">
            Reviewed for the 2026 admissions cycle. Dates for the 2027 cycle are confirmed by the GDE each year in mid-July.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-3xl space-y-3 text-sm leading-relaxed text-foreground">
          <h2 className="text-xl font-semibold tracking-tight">What are Decentralised Walk-In Centres?</h2>
          <p>
            Decentralised Walk-In Centres are GDE-run help desks placed across Gauteng districts. Staff help parents
            who cannot apply online, who do not have data, or who need help to upload documents. You can walk in
            during the application window and get assisted on the same system used at home.
          </p>
          <p>
            Find the centre closest to your suburb below. Each card lists the address, the areas it serves, and the
            officials you can phone first.
          </p>
        </section>

        <div className="mx-auto mt-8 max-w-3xl space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by centre, area, suburb, or contact name…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(["All", ...REGIONS] as const).map((r) => {
              const active = region === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Showing {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl space-y-10">
          {grouped.length === 0 && (
            <p className="text-center text-muted-foreground">No centres match your search.</p>
          )}
          {grouped.map(([heading, centres]) => (
            <section key={heading}>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">{heading}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {centres.map((c, idx) => (
                  <Card key={`${heading}-${idx}`} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base leading-snug">{c.centre}</CardTitle>
                      <a
                        href={mapsHref(c.address)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-start gap-1.5 text-sm text-muted-foreground hover:text-primary"
                      >
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{c.address}</span>
                      </a>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-4">
                      {c.areasServed.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Areas served
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {c.areasServed.map((a) => (
                              <Badge key={a} variant="secondary" className="font-normal">
                                {a}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {c.contacts.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Contacts
                          </p>
                          <ul className="space-y-1.5">
                            {c.contacts.map((p, i) => (
                              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                                <span className="text-foreground">{p.name}</span>
                                <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs">
                                  <a href={telHref(p.phone)}>
                                    <Phone className="h-3 w-3" />
                                    {p.phone}
                                  </a>
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

      </main>
      <SiteFooter />
    </div>
  );
};

export default Admissions;