import gp2023 from "@/data/gauteng/schools-2023.json";
import gp2024 from "@/data/gauteng/schools-2024.json";
import gp2025 from "@/data/gauteng/schools-2025.json";
import gpMatric from "@/data/gauteng/matric-results.json";
import wc2023 from "@/data/western-cape/schools-2023.json";
import wc2024 from "@/data/western-cape/schools-2024.json";
import wc2025 from "@/data/western-cape/schools-2025.json";
import wcMatric from "@/data/western-cape/matric-results.json";
import kzn2023 from "@/data/kwazulu-natal/schools-2023.json";
import kzn2024 from "@/data/kwazulu-natal/schools-2024.json";
import kzn2025 from "@/data/kwazulu-natal/schools-2025.json";
import kznMatric from "@/data/kwazulu-natal/matric-results.json";
import lp2023 from "@/data/limpopo/schools-2023.json";
import lp2024 from "@/data/limpopo/schools-2024.json";
import lp2025 from "@/data/limpopo/schools-2025.json";
import lpMatric from "@/data/limpopo/matric-results.json";
import mp2023 from "@/data/mpumalanga/schools-2023.json";
import mp2024 from "@/data/mpumalanga/schools-2024.json";
import mp2025 from "@/data/mpumalanga/schools-2025.json";
import mpMatric from "@/data/mpumalanga/matric-results.json";
import ec2023 from "@/data/eastern-cape/schools-2023.json";
import ec2024 from "@/data/eastern-cape/schools-2024.json";
import ec2025 from "@/data/eastern-cape/schools-2025.json";
import ecMatric from "@/data/eastern-cape/matric-results.json";
import fs2023 from "@/data/free-state/schools-2023.json";
import fs2024 from "@/data/free-state/schools-2024.json";
import fs2025 from "@/data/free-state/schools-2025.json";
import fsMatric from "@/data/free-state/matric-results.json";
import { PROVINCES, getProvince, type ProvinceSlug } from "@/lib/provinces";

export interface School {
  id: string;
  emis: string;
  name: string;
  status: string | null;
  sector: string | null;
  type: string | null;
  phase: string | null;
  specialisation: string | null;
  district: string | null;
  circuit: string | null;
  municipality: string | null;
  suburb: string | null;
  township: string | null;
  town: string | null;
  streetAddress: string | null;
  postalAddress: string | null;
  telephone: string | null;
  email?: string | null;
  principal: string | null;
  quintile: string | null;
  noFee: string | null;
  section21: string | null;
  urbanRural: string | null;
  learners: number | null;
  educators: number | null;
  longitude: number | null;
  latitude: number | null;
  /** Province this school belongs to. Set automatically from data folder. */
  provinceSlug: ProvinceSlug;
}

export type DataYear = "2023" | "2024" | "2025";

export const AVAILABLE_YEARS: DataYear[] = ["2025", "2024", "2023"];

const tag = (rows: unknown, slug: ProvinceSlug): School[] =>
  (rows as Omit<School, "provinceSlug">[]).map((s) => ({ ...s, provinceSlug: slug }));

const rawByProvince: Record<ProvinceSlug, Record<DataYear, School[]>> = {
  "gauteng": {
    "2023": tag(gp2023, "gauteng"),
    "2024": tag(gp2024, "gauteng"),
    "2025": tag(gp2025, "gauteng"),
  },
  "western-cape": {
    "2023": tag(wc2023, "western-cape"),
    "2024": tag(wc2024, "western-cape"),
    "2025": tag(wc2025, "western-cape"),
  },
  "kwazulu-natal": {
    "2023": tag(kzn2023, "kwazulu-natal"),
    "2024": tag(kzn2024, "kwazulu-natal"),
    "2025": tag(kzn2025, "kwazulu-natal"),
  },
  "limpopo": {
    "2023": tag(lp2023, "limpopo"),
    "2024": tag(lp2024, "limpopo"),
    "2025": tag(lp2025, "limpopo"),
  },
  "mpumalanga": {
    "2023": tag(mp2023, "mpumalanga"),
    "2024": tag(mp2024, "mpumalanga"),
    "2025": tag(mp2025, "mpumalanga"),
  },
  "eastern-cape": {
    "2023": tag(ec2023, "eastern-cape"),
    "2024": tag(ec2024, "eastern-cape"),
    "2025": tag(ec2025, "eastern-cape"),
  },
  "free-state": {
    "2023": tag(fs2023, "free-state"),
    "2024": tag(fs2024, "free-state"),
    "2025": tag(fs2025, "free-state"),
  },
};

const datasets: Record<DataYear, School[]> = {
  "2023": PROVINCES.flatMap((p) => rawByProvince[p.slug]["2023"]),
  "2024": PROVINCES.flatMap((p) => rawByProvince[p.slug]["2024"]),
  "2025": PROVINCES.flatMap((p) => rawByProvince[p.slug]["2025"]),
};

export const getSchools = (year: DataYear, provinceSlug?: ProvinceSlug): School[] =>
  provinceSlug ? rawByProvince[provinceSlug][year] : datasets[year];

export interface MatricYearStats {
  progressed: number;
  wrote: number;
  achieved: number;
  pct: number;
}

export interface MatricResults {
  centreNo: string;
  name: string;
  quintile: number;
  y2023: MatricYearStats;
  y2024: MatricYearStats;
  y2025: MatricYearStats;
}

const matricByEmis: Record<string, MatricResults> = {
  ...(gpMatric as Record<string, MatricResults>),
  ...(wcMatric as Record<string, MatricResults>),
  ...(kznMatric as Record<string, MatricResults>),
  ...(lpMatric as Record<string, MatricResults>),
  ...(mpMatric as Record<string, MatricResults>),
  ...(ecMatric as Record<string, MatricResults>),
  ...(fsMatric as Record<string, MatricResults>),
};

export const getMatricResults = (emis: string): MatricResults | null =>
  matricByEmis[emis] ?? null;

export const titleCase = (s?: string | null) => {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(Of|And|The|For|In|To|A)\b/g, (m) => m.toLowerCase());
};

/**
 * Cleans messy address strings:
 * - removes empty comma segments ("a, , b" -> "a, b")
 * - drops consecutive duplicate parts (case-insensitive)
 * - trims whitespace and collapses spaces
 * - applies title case
 */
export const cleanAddress = (s?: string | null): string => {
  if (!s) return "";
  const parts = s
    .split(",")
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const deduped: string[] = [];
  for (const part of parts) {
    const prev = deduped[deduped.length - 1];
    if (!prev || prev.toLowerCase() !== part.toLowerCase()) {
      deduped.push(part);
    }
  }
  return titleCase(deduped.join(", "));
};

const phaseSuffix = (phase?: string | null): string | null => {
  if (!phase) return null;
  const p = phase.toUpperCase();
  if (p.includes("PRIMARY")) return "Primary School";
  if (p.includes("SECONDARY")) return "Secondary School";
  if (p.includes("COMBINED")) return "Combined School";
  if (p.includes("INTERMEDIATE")) return "Intermediate School";
  return null;
};

/**
 * Display name: if the school's name is a single word (e.g. "Muzomuhle"),
 * append its phase (Primary/Secondary/etc.) so the user knows what type it is.
 */
export const displayName = (school: { name?: string | null; phase?: string | null } | null | undefined) => {
  const rawName = school?.name ?? "";
  const formatted = titleCase(rawName);
  const wordCount = rawName.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 1) return formatted;
  const suffix = phaseSuffix(school?.phase);
  return suffix ? `${formatted} ${suffix}` : formatted;
};

export const uniqueSorted = (values: (string | number | null | undefined)[]) =>
  Array.from(
    new Set(
      values
        .filter((v) => v !== null && v !== undefined && v !== "")
        .map((v) => String(v)),
    ),
  ).sort((a, b) => a.localeCompare(b));

export const getFacets = (year: DataYear, provinceSlug?: ProvinceSlug) => {
  const schools = getSchools(year, provinceSlug);
  return {
    districts: uniqueSorted(schools.map((s) => s.district)),
    sectors: uniqueSorted(schools.map((s) => s.sector)),
    phases: uniqueSorted(schools.map((s) => s.phase)),
    quintiles: uniqueSorted(schools.map((s) => s.quintile)),
    towns: uniqueSorted(schools.map((s) => s.town)),
  };
};

export const findSchool = (year: DataYear, id: string) =>
  getSchools(year).find((s) => s.id === id);

/**
 * Build a URL-safe slug from a school: "<kebab-name>-<EMIS id>".
 * Example: { name: "Eqinisweni Secondary School", id: "700261719" }
 *   -> "eqinisweni-secondary-school-700261719"
 * The trailing numeric ID guarantees uniqueness and lets us recover the
 * school even if two schools share the same name.
 */
export const schoolSlug = (school: { name?: string | null; id: string }): string => {
  const base = (school.name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${school.id}` : school.id;
};

/** Extract the trailing numeric EMIS id from a slug like "name-700261719". */
export const idFromSlug = (slug: string): string => {
  const m = slug.match(/(\d+)$/);
  return m ? m[1] : slug;
};

/** Convenience: build the canonical school detail URL. */
export const schoolHref = (school: { name?: string | null; id: string; provinceSlug?: ProvinceSlug }) => {
  const province = getProvince(school.provinceSlug ?? null);
  return `/south-africa/${province.slug}/${schoolSlug(school)}`;
};

/**
 * Normalise a South African phone number to a 10-digit local format starting with 0.
 * Strips spaces, dashes, brackets and a leading +27 / 27 country code, then ensures
 * the result is padded with a leading 0 to make 10 digits.
 * Returns the original string if it cannot be cleaned to 9 or 10 digits.
 */
export const formatPhone = (raw?: string | null): string => {
  if (!raw) return "";
  const original = String(raw).trim();
  let digits = original.replace(/\D/g, "");
  if (digits.startsWith("27") && digits.length >= 11) {
    digits = digits.slice(2);
  }
  digits = digits.replace(/^0+/, "");
  if (digits.length === 9) return `0${digits}`;
  if (digits.length === 10) return digits;
  return original;
};

/**
 * Compare the school's learner count in the given year against the previous
 * available year, matched by EMIS id. Returns null when there is no comparable
 * prior-year record or either count is missing.
 */
export interface LearnerTrend {
  direction: "up" | "down" | "flat";
  current: number;
  previous: number;
  delta: number;
  percent: number;
  previousYear: DataYear;
}

const previousYearOf = (year: DataYear): DataYear | null => {
  if (year === "2025") return "2024";
  if (year === "2024") return "2023";
  return null;
};

export const getLearnerTrend = (
  school: { id: string; learners: number | null },
  year: DataYear,
): LearnerTrend | null => {
  const prevYear = previousYearOf(year);
  if (!prevYear) return null;
  const current = school.learners;
  if (typeof current !== "number" || current <= 0) return null;
  const prev = datasets[prevYear].find((s) => s.id === school.id);
  const previous = prev?.learners;
  if (typeof previous !== "number" || previous <= 0) return null;
  const delta = current - previous;
  const percent = (delta / previous) * 100;
  let direction: LearnerTrend["direction"] = "flat";
  if (percent >= 1) direction = "up";
  else if (percent <= -1) direction = "down";
  return { direction, current, previous, delta, percent, previousYear: prevYear };
};

/**
 * Strip common SA titles + short tokens from a principal name and return the
 * set of meaningful tokens. Used to fuzzy-match the same person captured
 * with different spellings or initials across years and schools.
 */
const PRINCIPAL_TITLES = new Set([
  "mr", "mrs", "ms", "miss", "dr", "prof", "mnr", "mev", "rev",
]);

export const principalTokens = (name: string): Set<string> => {
  return new Set(
    name
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !PRINCIPAL_TITLES.has(t)),
  );
};

export interface OtherPrincipalAppearance {
  schoolId: string;
  schoolName: string;
  emis: string;
  district: string | null;
  year: DataYear;
  principalName: string;
}

/**
 * Find every other school (across all dataset years) where the same person
 * appears as principal. Match is on shared meaningful name tokens. Excludes
 * the current school by EMIS id. Returns a deduplicated list per school,
 * keeping the most recent year an appearance was recorded.
 */
/**
 * Normalise a principal name for EXACT matching across schools:
 * lowercase, strip titles (Mr/Mrs/Dr/...), drop punctuation and single-letter
 * initials, then sort the remaining tokens. Two records match only when
 * this normalised form is byte-identical.
 */
const normalisePrincipalName = (name: string): string => {
  const tokens = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !PRINCIPAL_TITLES.has(t));
  return tokens.sort().join(" ");
};

export const findPrincipalAtOtherSchools = (
  principalName: string,
  excludeSchoolId: string,
): OtherPrincipalAppearance[] => {
  const target = normalisePrincipalName(principalName);
  if (!target) return [];

  const byKey = new Map<string, OtherPrincipalAppearance>();
  for (const year of AVAILABLE_YEARS) {
    for (const s of datasets[year]) {
      if (s.id === excludeSchoolId) continue;
      if (!s.principal) continue;
      const candidate = normalisePrincipalName(s.principal);
      if (!candidate || candidate !== target) continue;

      const existing = byKey.get(s.id);
      if (!existing || AVAILABLE_YEARS.indexOf(year) < AVAILABLE_YEARS.indexOf(existing.year)) {
        byKey.set(s.id, {
          schoolId: s.id,
          schoolName: titleCase(s.name),
          emis: s.emis,
          district: s.district ? titleCase(s.district) : null,
          year,
          principalName: titleCase(s.principal),
        });
      }
    }
  }
  return Array.from(byKey.values()).sort((a, b) =>
    a.schoolName.localeCompare(b.schoolName),
  );
};