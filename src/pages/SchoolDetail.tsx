import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Hash,
  Users,
  GraduationCap,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { findSchool, titleCase, displayName, cleanAddress } from "@/lib/schools";
import { toast } from "@/hooks/use-toast";

const Detail = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground break-words">{value}</div>
    </div>
  </div>
);

const SchoolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const school = useMemo(() => (id ? findSchool(id) : undefined), [id]);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    toast({ description: `${label} copied to clipboard` });
    setTimeout(() => setCopied(null), 1500);
  };

  if (!school) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="container flex-1 py-16 text-center">
          <h1 className="text-2xl font-semibold">School not found</h1>
          <p className="mt-2 text-muted-foreground">We couldn't find a school with that ID.</p>
          <Button asChild className="mt-6">
            <Link to="/">Back to directory</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const mapQuery = school.streetAddress
    ? cleanAddress(school.streetAddress)
    : school.latitude && school.longitude
    ? `${school.latitude},${school.longitude}`
    : null;

  const mapsUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;

  const mapsEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="container flex-1 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {school.sector && <Badge variant="secondary">{titleCase(school.sector)}</Badge>}
          {school.phase && (
            <Badge className="bg-primary-soft text-primary hover:bg-primary-soft/80">
              {titleCase(school.phase)}
            </Badge>
          )}
          {school.type && <Badge variant="outline">{titleCase(school.type)}</Badge>}
          {school.quintile && <Badge variant="outline">{school.quintile}</Badge>}
          {school.noFee === "YES" && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">No-fee school</Badge>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {displayName(school)}
        </h1>
        {school.district && (
          <p className="mt-1 text-muted-foreground">{titleCase(school.district)} District</p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Contact information</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {school.telephone && (
                  <Detail
                    icon={Phone}
                    label="Telephone"
                    value={
                      <div className="flex items-center gap-2">
                        <a href={`tel:${school.telephone}`} className="text-primary hover:underline">
                          {school.telephone}
                        </a>
                        <button
                          onClick={() => copy("Phone", school.telephone!)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Copy phone"
                        >
                          {copied === "Phone" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    }
                  />
                )}
                {school.principal && (
                  <Detail icon={User} label="Principal" value={titleCase(school.principal)} />
                )}
                {school.streetAddress && (
                  <Detail
                    icon={MapPin}
                    label="Street address"
                    value={cleanAddress(school.streetAddress)}
                  />
                )}
                {school.postalAddress && (
                  <Detail
                    icon={Mail}
                    label="Postal address"
                    value={cleanAddress(school.postalAddress)}
                  />
                )}
              </div>

              {mapsUrl && (
                <div className="mt-6 overflow-hidden rounded-xl border border-border">
                  <iframe
                    title={`Map of ${displayName(school)}`}
                    src={mapsEmbedUrl!}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-72 w-full border-0"
                    allowFullScreen
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">School details</h2>
              <div className="mt-5 space-y-5">
                <Detail icon={Hash} label="EMIS number" value={school.emis} />
                {school.district && (
                  <Detail icon={Building2} label="District" value={titleCase(school.district)} />
                )}
                {school.circuit && (
                  <Detail icon={Building2} label="Circuit" value={school.circuit} />
                )}
                {school.urbanRural && (
                  <Detail icon={MapPin} label="Setting" value={titleCase(school.urbanRural)} />
                )}
                {school.learners != null && (
                  <Detail icon={Users} label="Learners (2023)" value={school.learners.toLocaleString()} />
                )}
                {school.educators != null && (
                  <Detail
                    icon={GraduationCap}
                    label="Educators (2023)"
                    value={school.educators.toLocaleString()}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default SchoolDetail;