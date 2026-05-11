import { Helmet } from "react-helmet-async";
import { ExternalLink, FileText, LogIn, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WCED_URL =
  "https://admissionswesterncape.datafree.co/admissions/admission.sm_admissions_tracking.terms_and_conditions";

const WCEDApplication = () => {
  const year = new Date().getFullYear();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>WCED Online Application {year} - Western Cape School Applications</title>
        <meta
          name="description"
          content="WCED online application 2026 guide. Western Cape Education Department parent login, online registration, late school registration form and key dates for Grades R, 1, 8 and transfers."
        />
        <link rel="canonical" href="https://schooldirect.co.za/wced-online-application" />
      </Helmet>
      <SiteHeader />
      <main className="container flex-1 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            WCED Online Application {year}
          </h1>
          <p className="mt-3 text-muted-foreground">
            The Western Cape Education Department online application is the official channel for
            Western Cape school applications. Parents use the WCED parent login on the Western Cape
            gov za Education online registration system to apply, track placement, and manage
            documents.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a href={WCED_URL} target="_blank" rel="noopener noreferrer">
                <LogIn className="h-4 w-4" />
                WCED online application login
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={WCED_URL} target="_blank" rel="noopener noreferrer">
                Open WCED admissions portal <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          <Card className="mt-8 shadow-[var(--shadow-card)]">
            <CardContent className="space-y-6 p-6 text-sm leading-relaxed">
              <section>
                <h2 className="text-base font-semibold">What the WCED online application is</h2>
                <p className="mt-1 text-muted-foreground">
                  The WCED online application is the Western Cape Education Department system for
                  enrolling learners at ordinary public schools. It runs on the WCED School
                  Admissions Management Information (SAMI) system and is the only official Western
                  Cape gov za Education online registration channel for new admissions to Grades R,
                  1 and 8.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold">WCED parent login</h2>
                <p className="mt-1 text-muted-foreground">
                  Parents and guardians create one WCED parent login per family. The login lets you
                  save and return to the application, upload certified supporting documents, and
                  rank your school choices. Final placement at any school in Western Cape school
                  applications is subject to the school's admission policy and available spaces.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold">Key dates 2026</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>10 March 2026 - Grades R, 1 and 8 applications open</li>
                  <li>14 April 2026 - Final submit deadline (auto-complete at midnight)</li>
                  <li>28 May to 15 June 2026 - Confirm acceptance of placement</li>
                  <li>03 to 17 August 2026 - Transfer requests for Grades 2-7 and 9-12</li>
                  <li>16 to 30 September 2026 - Confirm transfer placements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base font-semibold">
                  Western Cape late school registration form
                </h2>
                <p className="mt-1 text-muted-foreground">
                  If you miss the 14 April 2026 deadline, the system auto-completes your
                  application. Late applicants must contact the nearest district office for the
                  Western Cape late school registration form. The WCED can assist with placement
                  where all applications were unsuccessful.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold">Required supporting documents</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Last school report card or results</li>
                  <li>ID, birth certificate or passport (study permit for foreign learners)</li>
                  <li>Immunisation card (Road to Health Chart) for primary schools</li>
                  <li>Proof of residence: municipal account, lease or affidavit</li>
                </ul>
              </section>

              <section className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground">
                  False or incorrect information may disqualify the application. The WCED does not
                  accept liability for incorrect information captured on SAMI. Always print and keep
                  a copy of your submitted online application.
                </p>
              </section>

              <section className="flex items-start gap-3 text-xs text-muted-foreground">
                <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Source: Western Cape Education Department admissions terms and conditions. Read
                  the full policy on the official WCED admissions portal before applying.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default WCEDApplication;