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

/**
 * Build a single parent-facing opinion paragraph judging the principal's
 * impact since 2023, using matric pass rate trend and enrolment trend.
 * Returns null when there is no usable signal.
 */
export const buildPrincipalImpactParagraph = (
  school: School,
  matric: MatricResults | null,
  currentYear: DataYear,
): string | null => {
  const principal = school.principal
    ? titleCase(school.principal)
    : "the current principal";

  const m2023 = matric?.y2023?.pct ?? null;
  const mLatest = matric?.y2025?.pct ?? matric?.y2024?.pct ?? null;
  const mLatestYear = matric?.y2025?.pct != null ? "2025" : "2024";
  const matricDelta =
    m2023 != null && mLatest != null ? mLatest - m2023 : null;

  const learners2023 = getLearnersInYear(school.id, "2023");
  const learnersNow =
    getLearnersInYear(school.id, currentYear) ?? school.learners ?? null;
  const enrolDeltaPct =
    learners2023 && learnersNow
      ? ((learnersNow - learners2023) / learners2023) * 100
      : null;

  // Need at least one signal to write an opinion.
  if (matricDelta == null && enrolDeltaPct == null) return null;

  // Pick a verdict.
  const matricUp = matricDelta != null && matricDelta >= 5;
  const matricDown = matricDelta != null && matricDelta <= -5;
  const enrolUp = enrolDeltaPct != null && enrolDeltaPct >= 5;
  const enrolDown = enrolDeltaPct != null && enrolDeltaPct <= -5;

  let verdict: string;
  if (matricUp && enrolUp) {
    verdict = "a clear positive impact you can take comfort in";
  } else if (matricUp && enrolDown) {
    verdict =
      "stronger results, but fewer families are choosing the school, which is worth asking about";
  } else if (matricDown && enrolUp) {
    verdict =
      "the school is growing, but matric results have slipped, so ask how grades will be supported";
  } else if (matricDown && enrolDown) {
    verdict = "a worrying trend you should raise with the school before enrolling";
  } else if (matricUp || enrolUp) {
    verdict = "early signs of progress that look encouraging";
  } else if (matricDown || enrolDown) {
    verdict = "soft spots that deserve a direct question at the school office";
  } else {
    verdict = "a steady hand since 2023, with no big swings either way";
  }

  const parts: string[] = [];
  parts.push(`Since 2023, leadership under ${principal} shows ${verdict}.`);

  if (matricDelta != null && m2023 != null && mLatest != null) {
    const sign = matricDelta >= 0 ? "+" : "";
    parts.push(
      `Matric pass rate moved from ${m2023.toFixed(1)}% in 2023 to ${mLatest.toFixed(
        1,
      )}% in ${mLatestYear} (${sign}${matricDelta.toFixed(1)} points).`,
    );
  } else if (mLatest != null) {
    parts.push(
      `Their most recent matric pass rate is ${mLatest.toFixed(
        1,
      )}% (${mLatestYear}).`,
    );
  }

  if (enrolDeltaPct != null && learners2023 && learnersNow) {
    const sign = enrolDeltaPct >= 0 ? "+" : "";
    const mood =
      enrolDeltaPct >= 5
        ? "parents are voting with their feet to join"
        : enrolDeltaPct <= -5
          ? "families are quietly drifting away"
          : "the parent community is staying loyal";
    parts.push(
      `Enrolment moved from ${learners2023.toLocaleString()} to ${learnersNow.toLocaleString()} learners (${sign}${enrolDeltaPct.toFixed(
        1,
      )}%), which tells you ${mood}.`,
    );
  }

  parts.push("Use this when you weigh up the school for your child.");
  return parts.join(" ");
};