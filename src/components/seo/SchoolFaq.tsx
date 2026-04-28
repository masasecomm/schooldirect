import { HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buildSchoolFaqs } from "@/lib/seo";
import { displayName, type School, type MatricResults } from "@/lib/schools";

type Props = {
  school: School;
  matric: MatricResults | null;
};

/**
 * Visible FAQ accordion mirroring the FAQPage JSON-LD on the same page.
 * Keeping both in sync (via buildSchoolFaqs) is what Google rewards: the
 * structured data must match content users can actually see.
 */
export const SchoolFaq = ({ school, matric }: Props) => {
  const faqs = buildSchoolFaqs(school, matric);
  if (faqs.length === 0) return null;
  const name = displayName(school);

  return (
    <Card className="mt-8 overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Frequently asked questions
            </div>
            <h2 className="mt-1 text-lg font-semibold">About {name}</h2>
          </div>
        </div>

        <Accordion type="single" collapsible className="mt-5 w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};