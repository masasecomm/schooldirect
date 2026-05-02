import { PROVINCES } from "@/lib/provinces";
import { getSchools, getSchoolsByCountry } from "@/lib/schools";
import { COUNTRIES } from "@/lib/countries";

// Only credit provinces/countries we actually have data for.
const activeSaDepts = PROVINCES.filter((p) => getSchools("2025", p.slug).length > 0)
  .map((p) => p.dept);
const activeOtherDepts = COUNTRIES.filter(
  (c) => c.slug !== "south-africa" && getSchoolsByCountry(c.slug).length > 0,
).map((c) => c.dept);
const activeDepts = [...activeSaDepts, ...activeOtherDepts].join(" · ");

export const SiteFooter = () => (
  <footer className="border-t border-border/60 bg-background mt-16">
    <div className="container flex flex-col items-center justify-between gap-2 py-8 text-sm text-muted-foreground sm:flex-row">
      <p>© {new Date().getFullYear()} School Direct · Find a school near you</p>
      <p>Data sources: {activeDepts || "South African provincial education departments"}</p>
    </div>
  </footer>
);