import data2023 from "@/data/schools-2023.json";
import data2024 from "@/data/schools-2024.json";
import data2025 from "@/data/schools-2025.json";

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
}

export type DataYear = "2023" | "2024" | "2025";

export const AVAILABLE_YEARS: DataYear[] = ["2025", "2024", "2023"];

const datasets: Record<DataYear, School[]> = {
  "2023": data2023 as School[],
  "2024": data2024 as School[],
  "2025": data2025 as School[],
};

export const getSchools = (year: DataYear): School[] => datasets[year];

export const titleCase = (s?: string | null) => {
  if (!s) return "";
  return s
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

export const getFacets = (year: DataYear) => {
  const schools = getSchools(year);
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
export const schoolHref = (school: { name?: string | null; id: string }) =>
  `/schools/${schoolSlug(school)}`;