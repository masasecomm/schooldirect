import rawData from "@/data/schools.json";

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

export const schools = rawData as School[];

export const titleCase = (s?: string | null) => {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(Of|And|The|For|In|To|A)\b/g, (m) => m.toLowerCase());
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
export const displayName = (school: { name: string; phase?: string | null }) => {
  const formatted = titleCase(school.name);
  const wordCount = school.name.trim().split(/\s+/).length;
  if (wordCount > 1) return formatted;
  const suffix = phaseSuffix(school.phase);
  return suffix ? `${formatted} ${suffix}` : formatted;
};

export const uniqueSorted = (values: (string | null)[]) =>
  Array.from(new Set(values.filter((v): v is string => !!v))).sort((a, b) =>
    a.localeCompare(b),
  );

export const getFacets = () => ({
  districts: uniqueSorted(schools.map((s) => s.district)),
  sectors: uniqueSorted(schools.map((s) => s.sector)),
  phases: uniqueSorted(schools.map((s) => s.phase)),
  quintiles: uniqueSorted(schools.map((s) => s.quintile)),
  towns: uniqueSorted(schools.map((s) => s.town)),
});

export const findSchool = (id: string) => schools.find((s) => s.id === id);