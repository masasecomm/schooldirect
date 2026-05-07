import { LANDING_SUMMARY } from "@/lib/landing-summary";

// Pre-computed at build time so the footer doesn't pull the full school dataset.
const activeDepts =
  LANDING_SUMMARY.activeDepts.join(" · ") ||
  "South African provincial education departments";

export const SiteFooter = () => (
  <footer className="border-t border-border/60 bg-background mt-16">
    <div className="container flex flex-col items-center justify-between gap-2 py-8 text-sm text-muted-foreground sm:flex-row">
      <p>© {new Date().getFullYear()} School Direct · Find a school near you</p>
      <p>Data sources: {activeDepts || "South African provincial education departments"}</p>
    </div>
  </footer>
);