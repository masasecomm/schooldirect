import { SiteHeader } from "@/components/schools/SiteHeader";
import { SiteFooter } from "@/components/schools/SiteFooter";
import { Card, CardContent } from "@/components/ui/card";

const About = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <SiteHeader />
    <main className="container flex-1 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">About School Direct</h1>
        <p className="mt-3 text-muted-foreground">
          School Direct is a data-driven organization that provides extensive insights, ratings, and
          analytics about the best schools in South Africa focused on accessibility, affordability,
          and customized academic goals. We are a group of tutors, teachers and IT creatives helping
          you find schools near you.
        </p>

        <Card className="mt-8 shadow-[var(--shadow-card)]">
          <CardContent className="space-y-4 p-6 text-sm leading-relaxed">
            <div>
              <h2 className="text-base font-semibold">Our mission</h2>
              <p className="mt-1 text-muted-foreground">
                Coupled with in-depth review data from students, parents and the Department of
                Education, we help students and families find schools that are the best fit. We aim
                to present ourselves as a thought leader in school information as our solutions help
                level school information access amongst parents and guardians.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Help us improve</h2>
              <p className="mt-1 text-muted-foreground">
                Should you come across some details listed wrongly, please help us with corrections.
                We are not at all trying to pose as an official school website or misrepresent
                facts, but trying to assist those facing difficulties when trying to contact
                schools.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Data source</h2>
              <p className="mt-1 text-muted-foreground">
                Information is sourced from the Department of Education, ISASSA and more.
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