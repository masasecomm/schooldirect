export const SiteFooter = () => (
  <footer className="border-t border-border/60 bg-background mt-16">
    <div className="container flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground sm:flex-row">
      <p>© {new Date().getFullYear()} School Direct · Find a school near you</p>
    </div>
  </footer>
);
