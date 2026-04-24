export const SiteFooter = () => (
  <footer className="border-t border-border/60 bg-background mt-16">
    <div className="container flex flex-col items-center justify-between gap-2 py-8 text-sm text-muted-foreground sm:flex-row">
      <p>© {new Date().getFullYear()} School Direct · Find a school near you</p>
      <p>Data source: Gauteng Department of Education, 2023</p>
    </div>
  </footer>
);