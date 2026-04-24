import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { FilterPanel, type Filters } from "@/components/schools/FilterPanel";
import { getSchools, getFacets, titleCase } from "@/lib/schools";
import { useYear } from "@/lib/year-context";

const PAGE_SIZE = 24;

const emptyFilters: Filters = { district: "", sector: "", phase: "", quintile: "", town: "" };

const Index = () => {
  const { year } = useYear();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<"learners" | "name" | "district">("learners");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const schools = useMemo(() => getSchools(year), [year]);
  const facets = useMemo(() => getFacets(year), [year]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = schools.filter((s) => {
      if (filters.district && s.district !== filters.district) return false;
      if (filters.sector && s.sector !== filters.sector) return false;
      if (filters.phase && s.phase !== filters.phase) return false;
      if (filters.quintile && s.quintile !== filters.quintile) return false;
      if (filters.town && s.town !== filters.town) return false;
      if (q) {
        const hay = `${s.name} ${s.suburb ?? ""} ${s.town ?? ""} ${s.district ?? ""} ${s.emis}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "learners")
      result = [...result].sort((a, b) => (b.learners ?? -1) - (a.learners ?? -1));
    else if (sort === "name")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else
      result = [...result].sort(
        (a, b) =>
          (a.district ?? "").localeCompare(b.district ?? "") || a.name.localeCompare(b.name),
      );
    return result;
  }, [query, filters, sort, schools]);

  useEffect(() => setVisible(PAGE_SIZE), [query, filters, sort, year]);

  const activeChips: { key: keyof Filters; value: string }[] = (Object.keys(filters) as (keyof Filters)[])
    .filter((k) => filters[k])
    .map((k) => ({ key: k, value: filters[k] }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
              We track {schools.length.toLocaleString()} schools by EMIS number, district, fees,
              quintile and contact details. Search the data the schools do not publish themselves.
            </p>

            <div className="mx-auto mt-10 max-w-2xl">
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
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilters(emptyFilters);
                  }}
                  className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
                  aria-label="Reset filters"
                  title="Reset filters"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container flex-1 py-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <FilterPanel
                filters={filters}
                facets={facets}
                onChange={setFilters}
                onClear={() => setFilters(emptyFilters)}
              />
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length.toLocaleString()}</span>{" "}
                {filtered.length === 1 ? "school" : "schools"} found
              </p>

              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] sm:w-[360px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterPanel
                        filters={filters}
                        facets={facets}
                        onChange={setFilters}
                        onClear={() => setFilters(emptyFilters)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                  <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learners">Sort: Learners (high–low)</SelectItem>
                    <SelectItem value="name">Sort: Name (A–Z)</SelectItem>
                    <SelectItem value="district">Sort: District</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {activeChips.map(({ key, value }) => (
                  <Badge key={key} variant="secondary" className="gap-1 pr-1">
                    <span className="text-xs">{titleCase(value)}</span>
                    <button
                      onClick={() => setFilters({ ...filters, [key]: "" })}
                      className="rounded-sm p-0.5 hover:bg-muted-foreground/10"
                      aria-label={`Remove ${key} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <button
                  onClick={() => setFilters(emptyFilters)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-base font-medium">No schools match your search</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try clearing some filters or using a different search term.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setQuery("");
                    setFilters(emptyFilters);
                  }}
                >
                  Reset
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.slice(0, visible).map((s) => (
                    <SchoolCard key={s.id} school={s} />
                  ))}
                </div>
                {visible < filtered.length && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    >
                      Load more ({(filtered.length - visible).toLocaleString()} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;