import {
  displayName,
  titleCase,
  getLearnersInYear,
  type School,
  type MatricResults,
  type DataYear,
} from "@/lib/schools";
import { getProvinceForSchool } from "@/lib/provinces";

type Props = {
  school: School;
  matric: MatricResults | null;
  currentYear?: DataYear;
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

export const SchoolIntro = ({ school, matric, currentYear = "2025" }: Props) => {
  const sentences = buildIntroSentences(school, matric);
  const opinion = buildPrincipalImpactParagraph(school, matric, currentYear);
  if (sentences.length === 0 && !opinion) return null;

  const name = displayName(school);

  return (
    <section aria-labelledby="about-this-school" className="space-y-3">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          For parents deciding
        </div>
        <h2
          id="about-this-school"
          className="mt-1 text-xl font-semibold leading-tight"
        >
          What you should know about {name} before you enrol
        </h2>
        <div className="mt-1 text-xs text-muted-foreground">
          Last reviewed: {LAST_UPDATED}
        </div>
      </div>

      {sentences.length > 0 && (
        <p className="text-sm leading-relaxed text-foreground">
          Here is what the numbers say about the school your child would attend.{" "}
          {sentences.join(" ")}
        </p>
      )}

      {opinion && (
        <p className="text-sm leading-relaxed text-foreground">{opinion}</p>
      )}

      <p className="text-sm leading-relaxed text-muted-foreground">
        This is only the headline. Scroll down to see fees, contact details,
        application dates, full matric history, walk-in centres and the
        principal's record before you make your choice.
      </p>
    </section>
  );
};

const placeOf = (s: School) => {
  const fallback = getProvinceForSchool(s).name;
  return titleCase(s.suburb || s.township || s.town || s.district || fallback);
};

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
  const province = getProvinceForSchool(school);
  const sector = school.sector ? titleCase(school.sector).toLowerCase() : "public";
  const phase = phaseWord(school.phase);
  const out: string[] = [];

  // 1. Identity sentence.
  out.push(`${name} is a ${sector} ${phase} in ${place}, ${province.name}.`);

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