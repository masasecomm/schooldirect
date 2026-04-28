import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Home, Menu } from "lucide-react";
import logoImg from "@/assets/school-direct-logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

type SiteHeaderProps = {
  /** When true, the header floats over a dark hero (logo + nav use light colors). */
  overHero?: boolean;
};

export const SiteHeader = ({ overHero = false }: SiteHeaderProps) => {
  const [open, setOpen] = useState(false);
  const wrapperBase = "absolute left-0 right-0 top-0 z-40 w-full pt-6 md:pt-8";
  const wrapperSolid =
    "relative border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 pt-0";

  const logoText = overHero ? "text-primary-foreground" : "text-foreground";
  const logoSub = overHero ? "text-primary-foreground/80" : "text-muted-foreground";
  const logoBadge = "bg-white text-primary";

  const navWrap = overHero
    ? "rounded-full bg-background/95 px-2 py-1.5 shadow-[var(--shadow-elevated)] ring-1 ring-black/5 backdrop-blur"
    : "";

  const linkClass = (isActive: boolean) => {
    if (overHero) {
      return `rounded-full px-4 py-2 transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground/70 hover:text-foreground"
      }`;
    }
    return `rounded-md px-3 py-2 transition-colors ${
      isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;
  };

  return (
    <header className={overHero ? wrapperBase : wrapperSolid}>
      <div className="container flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 font-semibold">
          <span className={`grid h-16 w-16 place-items-center overflow-hidden rounded-2xl ${logoBadge}`}>
            <img
              src={logoImg}
              alt="School Direct logo"
              width={64}
              height={64}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className={`text-2xl font-bold tracking-tight ${logoText}`}>School Direct</span>
            <span className={`text-base font-medium ${logoSub}`}>Find a school near you</span>
          </span>
        </Link>
        <nav className={`hidden md:flex items-center gap-1 text-sm ${navWrap}`}>
          <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
            <span className="inline-flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              Home
            </span>
          </NavLink>
          <NavLink to="/admissions" className={({ isActive }) => linkClass(isActive)}>
            Admissions
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => linkClass(isActive)}>
            About
          </NavLink>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className={`md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-black/5 shadow-[var(--shadow-elevated)] backdrop-blur ${
                overHero ? "bg-background/95 text-foreground" : "bg-secondary text-foreground"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1 text-base">
              <SheetClose asChild>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 transition-colors ${
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </span>
                </NavLink>
              </SheetClose>
              <SheetClose asChild>
                <NavLink
                  to="/admissions"
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 transition-colors ${
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  Admissions
                </NavLink>
              </SheetClose>
              <SheetClose asChild>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 transition-colors ${
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  About
                </NavLink>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};