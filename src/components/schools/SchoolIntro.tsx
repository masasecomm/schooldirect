import { Clock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  displayName,
  titleCase,
  type School,
  type MatricResults,
} from "@/lib/schools";

type Props = {
  school: School;
  matric: MatricResults | null;
};

/**
 * Plain-English intro paragraph above the contact block.
 * Built only from the school's own data so it stays factual and unique.
 * Voice: South African second-language English. Short sentences. No hedging.
 */
const LAST_UPDATED = new Date().toLocaleDateString("en-ZA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const SchoolIntro = ({ school, matric }: Props) => {
  const sentences = buildIntroSentences(school, matric);
  if (sentences.length === 0) return null;

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              About this school
            </div>
            <h2 className="mt-1 text-lg font-semibold">
              What makes {displayName(school)} stand out
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last updated: {LAST_UPDATED}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground">
          {sentences.join(" ")}
        </p>
      </CardContent>
    </Card>
  );
};

const placeOf = (s: School) =>
  titleCase(s.suburb || s.township || s.town || s.district || "Gauteng");

const phaseWord = (phase?: string | null): string => {
  if (!phase) return "school";
  const p = phase.toUpperCase();
  if (p.includes("PRIMARY")) return "primary school";
  if (p.includes("SECONDARY")) return "secondary school";
  if (p.includes("COMBINED")) return "combined school";
  if (p.includes("INTERMEDIATE")) return "intermediate school";
  return "school";
};

/**
 * Turn raw school + matric data into 3 to 5 short factual sentences.
 * Mixes good and bad signals so the paragraph is unique per school.
 */
export const buildIntroSentences = (
  school: School,
  matric: MatricResults | null,
): string[] => {
  const name = displayName(school);
  const place = placeOf(school);
  const sector = school.sector ? titleCase(school.sector).toLowerCase() : "public";
  const phase = phaseWord(school.phase);
  const out: string[] = [];

  // 1. Identity sentence.
  out.push(`${name} is a ${sector} ${phase} in ${place}, Gauteng.`);

  // 2. Size signal (good or bad relative to common SA norms).
  if (typeof school.learners === "number" && school.learners > 0) {
    const n = school.learners.toLocaleString();
    let sizeNote = "";
    if (school.learners >= 1500) {
      sizeNote = `It is a very large school with ${n} learners, so classes can be busy.`;
    } else if (school.learners >= 1000) {
      sizeNote = `It is a large school with ${n} learners.`;
    } else if (school.learners >= 500) {
      sizeNote = `It serves ${n} learners, which is a typical size for the area.`;
    } else if (school.learners >= 200) {
      sizeNote = `It is a small school with only ${n} learners, which often means more personal attention.`;
    } else {
      sizeNote = `It is a very small school with just ${n} learners.`;
    }
    if (
      typeof school.educators === "number" &&
      school.educators > 0 &&
      school.learners > 0
    ) {
      const ratio = Math.round(school.learners / school.educators);
      if (ratio >= 40) {
        sizeNote += ` The learner-to-educator ratio is high at about ${ratio} learners per teacher.`;
      } else if (ratio <= 25) {
        sizeNote += ` The learner-to-educator ratio is good at about ${ratio} learners per teacher.`;
      } else {
        sizeNote += ` There are about ${ratio} learners per teacher.`;
      }
    }
    out.push(sizeNote);
  }

  // 3. Fee status (parents care about this most).
  if (school.noFee === "YES") {
    out.push(
      `It is a no-fee school${
        school.quintile ? ` (quintile ${school.quintile})` : ""
      }, so parents do not pay school fees.`,
    );
  } else if (school.quintile) {
    out.push(
      `It is a fee-paying school in quintile ${school.quintile}, which means parents are expected to pay school fees.`,
    );
  }

  // 4. Matric performance signal — strongest unique fact when available.
  if (matric?.y2025?.pct != null) {
    const pct = matric.y2025.pct;
    const wrote = matric.y2025.wrote;
    const passed = matric.y2025.achieved;
    let perf = "";
    if (pct >= 95) {
      perf = `In 2025 the school achieved an excellent ${pct.toFixed(
        1,
      )}% matric pass rate, with ${passed} of ${wrote} learners passing.`;
    } else if (pct >= 80) {
      perf = `In 2025 the school achieved a strong ${pct.toFixed(
        1,
      )}% matric pass rate (${passed} out of ${wrote} learners).`;
    } else if (pct >= 60) {
      perf = `In 2025 the school passed ${pct.toFixed(
        1,
      )}% of its matric class (${passed} out of ${wrote} learners), which is below the provincial average.`;
    } else {
      perf = `In 2025 only ${pct.toFixed(
        1,
      )}% of matric learners passed (${passed} out of ${wrote}), which is a weak result that parents should ask the school about.`;
    }

    // Trend vs 2024 if we have it.
    if (matric.y2024?.pct != null) {
      const diff = pct - matric.y2024.pct;
      if (diff >= 5) {
        perf += ` Results improved by ${diff.toFixed(1)} points compared to 2024.`;
      } else if (diff <= -5) {
        perf += ` Results dropped by ${Math.abs(diff).toFixed(
          1,
        )} points compared to 2024.`;
      }
    }
    out.push(perf);
  }

  // 5. Specialisation or rural/urban context if it adds signal.
  if (school.specialisation && school.specialisation.toUpperCase() !== "ORDINARY") {
    out.push(
      `The school has a ${titleCase(
        school.specialisation,
      ).toLowerCase()} specialisation, which is not common in the area.`,
    );
  }

  return out;
};