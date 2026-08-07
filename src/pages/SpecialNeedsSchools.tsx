import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, MapPin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { PROVINCES, getProvince, isProvinceSlug } from "@/lib/provinces";
import { getSpecialSchools } from "@/lib/schools";
import { useYear } from "@/lib/year-context";

const PAGE_SIZE = 24;

const SpecialNeedsSchools = () => {
  const { year } = useYear();
  const { province: provinceParam } = useParams<{ province?: string }>();
  const province = isProvinceSlug(provinceParam)
    ? getProvince(provinceParam)
    : null;

  const [visible, setVisible] = useState(PAGE_SIZE);

  const schools = useMemo(
    () => getSpecialSchools(year, province?.slug),
    [year, province?.slug],
  );

  const perProvince = useMemo(
    () =>
      PROVINCES.map((p) => ({
        province: p,
        total: getSpecialSchools(year, p.slug).length,
      })).filter((row) => row.total > 0),
    [year],
  );

  const filtered = useMemo(
    () => [...schools].sort((a, b) => (b.learners ?? -1) - (a.learners ?? -1)),
    [schools],
  );

  const totalCountry = useMemo(
    () => getSpecialSchools(year).length,
    [year],
  );

  const heading = province
    ? `${province.name} special needs schools`
    : "Special needs schools in South Africa";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>
          {province
            ? `${province.name} Special Needs Schools | School Direct`
            : `Special Needs Schools in South Africa | School Direct`}
        </title>
        <meta
          name="description"
          content={
            province
              ? `Browse ${schools.length.toLocaleString()} special needs education centres in ${province.name}. Search by suburb, district and specialisation.`
              : `Browse ${totalCountry.toLocaleString()} special needs education centres across all 9 provinces of South Africa.`
          }
        />
        <link
          rel="canonical"
          href={`https://schooldirect.org/south-africa${province ? `/${province.slug}` : ""}/special-needs`}
        />
      </Helmet>

      <section
        className="relative border-b border-border/60"
        style={{ background: "var(--hero-gradient)" }}
      >
        <SiteHeader overHero />
        <div className="container pb-12 pt-28 md:pb-16 md:pt-32">
          <div className="mx-auto max-w-3xl text-center text-primary-foreground">
            <Badge className="mb-3 bg-background/20 text-primary-foreground hover:bg-background/30">
              <Heart className="mr-1 h-3.5 w-3.5" /> Inclusive education
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {heading}
            </h1>
            <p className="mt-3 text-base opacity-90 md:text-lg">
              {schools.length.toLocaleString()} special needs education centre
              {schools.length === 1 ? "" : "s"}
              {province ? ` in ${province.name}` : ""} for learners with
              specific learning, sensory, physical or developmental needs.
            </p>
          </div>
        </div>
      </section>

      <main className="container flex-1 py-10">
        {!province && (
          <section aria-labelledby="by-province" className="mb-10">
            <h2
              id="by-province"
              className="mb-4 text-xl font-bold tracking-tight md:text-2xl"
            >
              Browse by province
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {perProvince.map(({ province: p, total }) => (
                <Link
                  key={p.slug}
                  to={`/south-africa/${p.slug}/special-needs`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {p.shortName}
                    </div>
                    <div className="mt-0.5 text-base font-semibold group-hover:text-primary">
                      {p.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {total.toLocaleString()} centre{total === 1 ? "" : "s"}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="results">
          <div className="mb-4 flex items-end justify-between gap-2">
            <h2
              id="results"
              className="text-xl font-bold tracking-tight md:text-2xl"
            >
              {filtered.length.toLocaleString()} school
              {filtered.length === 1 ? "" : "s"}
            </h2>
            {province && (
              <Button asChild variant="outline" size="sm">
                <Link to="/south-africa/special-needs">
                  View all provinces
                </Link>
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No special needs schools found in this province.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.slice(0, visible).map((s) => (
                  <SchoolCard key={`${s.id}-${s.provinceSlug}`} school={s} />
                ))}
              </div>
              {visible < filtered.length && (
                <div className="mt-8 text-center">
                  <Button onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default SpecialNeedsSchools;