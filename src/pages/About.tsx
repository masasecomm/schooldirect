import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { Card, CardContent } from "@/components/ui/card";

const About = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <SiteHeader />
    <main className="container flex-1 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About this directory</h1>
        <p className="mt-3 text-muted-foreground">
          A free, public lookup tool for parents and students looking for schools across Gauteng,
          South Africa.
        </p>

        <Card className="mt-8 shadow-[var(--shadow-card)]">
          <CardContent className="space-y-4 p-6 text-sm leading-relaxed">
            <div>
              <h2 className="text-base font-semibold">Data source</h2>
              <p className="mt-1 text-muted-foreground">
                Information is sourced from the Gauteng Department of Education's 2023 institution
                master list. Includes public, independent, primary, secondary and combined schools.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Disclaimer</h2>
              <p className="mt-1 text-muted-foreground">
                Details such as phone numbers, principals and addresses may have changed since
                publication. Please verify directly with the school before making decisions.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Who it's for</h2>
              <p className="mt-1 text-muted-foreground">
                Parents researching options for their children, students considering further
                education, and anyone needing quick access to school contact information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
    <SiteFooter />
  </div>
);

export default About;