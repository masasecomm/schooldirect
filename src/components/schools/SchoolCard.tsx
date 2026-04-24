import { Link } from "react-router-dom";
import { MapPin, Users, UserSquare2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { School } from "@/lib/schools";
import { titleCase, displayName, schoolHref } from "@/lib/schools";

export const SchoolCard = ({ school }: { school: School }) => {
  return (
    <Card className="group flex h-full flex-col transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {school.sector && (
            <Badge variant="secondary" className="font-medium">
              {titleCase(school.sector)}
            </Badge>
          )}
          {school.phase && (
            <Badge className="bg-primary-soft text-primary hover:bg-primary-soft/80 font-medium">
              {titleCase(school.phase)}
            </Badge>
          )}
          {school.quintile && (
            <Badge variant="outline" className="font-medium">
              {school.quintile}
            </Badge>
          )}
        </div>

        <h3 className="text-base font-semibold leading-snug tracking-tight">
          {displayName(school)}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {(school.suburb || school.town) && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              <span className="line-clamp-1">
                {[titleCase(school.suburb), titleCase(school.town)].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {school.principal && (
            <div className="flex items-center gap-2">
              <UserSquare2 className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="line-clamp-1">{titleCase(school.principal)}</span>
            </div>
          )}
          {typeof school.learners === "number" && school.learners > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-primary/70" />
              <span>
                <span className="font-medium text-foreground">
                  {school.learners.toLocaleString()}
                </span>{" "}
                learners
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2">
          <Link
            to={schoolHref(school)}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};