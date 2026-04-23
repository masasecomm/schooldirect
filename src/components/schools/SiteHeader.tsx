import { Link, NavLink } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">Gauteng Schools</span>
            <span className="text-[11px] font-medium text-muted-foreground">Directory · 2023–2025</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-2 transition-colors ${
                isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            Directory
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 transition-colors ${
                isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
};