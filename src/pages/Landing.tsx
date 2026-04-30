import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, MapPin, Search, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { PROVINCES } from "@/lib/provinces";
import {
  getSchools,
  schoolHref,
  displayName,
  titleCase,
  type School,
} from "@/lib/schools";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FEATURED_PER_PROVINCE = 3;

/** Pick the N largest currently-open schools per province (by 2025 learner count). */
const pickFeatured = (province: { slug: string }, n: number): School[] => {
  const all = getSchools("2025", province.slug as never);
  return [...all]
    .filter((s) => typeof s.learners === "number" && s.learners > 0)
    .sort((a, b) => (b.learners ?? 0) - (a.learners ?? 0))
    .slice(0, n);
};

const FeaturedSchoolCard = ({ school }: { school: School }) => (
  <Link
    to={schoolHref(school)}
    className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
  >
    <div className="flex flex-wrap gap-1.5">
      {school.phase && (
        <Badge className="bg-primary-soft text-primary hover:bg-primary-soft/80 font-medium">
          {titleCase(school.phase)}
        </Badge>
      )}
      {school.sector && (
        <Badge variant="secondary" className="font-medium">
          {titleCase(school.sector)}
        </Badge>
      )}
    </div>
    <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight group-hover:text-primary">
      {displayName(school)}
    </h3>
    <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
      {(school.suburb || school.town) && (
        <div className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          <span className="line-clamp-1">
            {[titleCase(school.suburb), titleCase(school.town)].filter(Boolean).join(", ")}
          </span>
        </div>
      )}
      {typeof school.learners === "number" && school.learners > 0 && (
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 shrink-0 text-primary/70" />
          <span>
            <span className="font-medium text-foreground">
              {school.learners.toLocaleString()}
            </span>{" "}
            learners
          </span>
        </div>
      )}
      {school.principal && (
        <div className="flex items-start gap-1.5">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          <span className="line-clamp-1">
            Principal:{" "}
            <span className="font-medium text-foreground">
              {titleCase(school.principal)}
            </span>
          </span>
        </div>
      )}
    </div>
    <div className="mt-auto pt-3 text-sm font-medium text-primary">
      View school
      <ArrowRight className="ml-1 inline h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </div>
  </Link>
);

const Landing = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const provinceData = useMemo(
    () =>
      PROVINCES.map((p) => ({
        province: p,
        total: getSchools("2025", p.slug).length,
        featured: pickFeatured(p, FEATURED_PER_PROVINCE),
      })).filter((row) => row.total > 0),
    [],
  );

  const totalSchools = provinceData.reduce((sum, r) => sum + r.total, 0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    // Search lives on the all-schools directory page.
    navigate(`/south-africa${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>School Direct — Find a school in South Africa</title>
        <meta
          name="description"
          content={`Browse ${totalSchools.toLocaleString()} public and independent schools across ${provinceData.length} South African province${provinceData.length === 1 ? "" : "s"}. Search by province, suburb, fees and matric results.`}
        />
        <link rel="canonical" href="https://schooldirect.org/" />
      </Helmet>

      <section
        className="relative border-b border-border/60"
        style={{ background: "var(--hero-gradient)" }}
      >
        <SiteHeader overHero />
        <div className="container pb-16 pt-28 md:pb-24 md:pt-36">
          <div className="mx-auto max-w-3xl text-center text-primary-foreground">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Every school in South Africa, in one place
            </h1>
            <p className="mt-3 text-base opacity-90 md:text-lg">
              {totalSchools.toLocaleString()} schools across {provinceData.length}{" "}
              province{provinceData.length === 1 ? "" : "s"}. Pick a province below or
              search the full directory.
            </p>

            <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-2xl">
              <div className="flex items-center gap-2 rounded-full bg-background/95 p-2 shadow-[var(--shadow-elevated)] ring-1 ring-black/5 backdrop-blur">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search schools, suburbs, districts…"
                    className="h-14 rounded-full border-0 bg-transparent pl-14 pr-4 text-base text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    aria-label="Search schools"
                  />
                </div>
                <Button type="submit" className="h-12 rounded-full px-6">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <main className="container flex-1 py-14">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Browse by province
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Featured schools are the largest in each province by 2025 enrolment.
            Tap a province to see every school we track there.
          </p>
        </div>

        <div className="space-y-12">
          {provinceData.map(({ province, total, featured }) => (
            <section key={province.slug} aria-labelledby={`province-${province.slug}`}>
              <Card className="overflow-hidden shadow-[var(--shadow-card)]">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {province.dept}
                      </div>
                      <h3
                        id={`province-${province.slug}`}
                        className="mt-1 text-2xl font-bold tracking-tight md:text-3xl"
                      >
                        {province.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {total.toLocaleString()} schools tracked
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <Link to={`/south-africa/${province.slug}`}>
                        View all {province.name} schools
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {featured.length > 0 ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {featured.map((school) => (
                        <FeaturedSchoolCard key={school.id} school={school} />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-muted-foreground">
                      No schools available yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Landing;