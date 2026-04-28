import { useMemo, useState } from "react";
import { MapPin, Phone, Search } from "lucide-react";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  REGIONS,
  groupBySubRegion,
  mapsHref,
  telHref,
  walkInCentres,
  type Region,
} from "@/lib/walk-in-centres";
import { cn } from "@/lib/utils";

const APPLICATION_HISTORY: { year: string; opened: string; closed: string }[] = [
  { year: "2026", opened: "24 July 2025", closed: "29 August 2025" },
  { year: "2025", opened: "11 July 2024", closed: "12 August 2024" },
  { year: "2024", opened: "15 June 2023", closed: "21 July 2023" },
  { year: "2023", opened: "22 July 2022", closed: "19 August 2022" },
  { year: "2022", opened: "10 August 2021", closed: "8 October 2021" },
];

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
          <p className="text-sm font-medium uppercase tracking-wider text-primary">2027 GDE Admissions &amp; Application</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Decentralised Walk-In Centres
          </h1>
          <p className="mt-3 text-muted-foreground">
            Grade 1 &amp; Grade 8 admissions support across Gauteng. Find the centre nearest to your suburb.
          </p>
        </header>

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

        <section className="mx-auto mt-16 max-w-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              GDE Online Admissions Timeline
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Historical application opening and closing dates per academic year.
            </p>
          </div>
          <Card className="mt-6 overflow-hidden">
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
                  <TableRow key={row.year}>
                    <TableCell className="font-medium">{row.year}</TableCell>
                    <TableCell>{row.opened}</TableCell>
                    <TableCell>{row.closed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Admissions;