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
import nw2023 from "@/data/north-west/schools-2023.json";
import nw2024 from "@/data/north-west/schools-2024.json";
import nw2025 from "@/data/north-west/schools-2025.json";
import nwMatric from "@/data/north-west/matric-results.json";
import nc2023 from "@/data/northern-cape/schools-2023.json";
import nc2024 from "@/data/northern-cape/schools-2024.json";
import nc2025 from "@/data/northern-cape/schools-2025.json";
import ncMatric from "@/data/northern-cape/matric-results.json";
// Special needs education centres (per province, per year). These are merged
// into the main school datasets and additionally exposed via getSpecialSchools.
import gpSne2023 from "@/data/gauteng/special-schools-2023.json";
import gpSne2024 from "@/data/gauteng/special-schools-2024.json";
import gpSne2025 from "@/data/gauteng/special-schools-2025.json";
import wcSne2023 from "@/data/western-cape/special-schools-2023.json";
import wcSne2024 from "@/data/western-cape/special-schools-2024.json";
import wcSne2025 from "@/data/western-cape/special-schools-2025.json";
import kznSne2023 from "@/data/kwazulu-natal/special-schools-2023.json";
import kznSne2024 from "@/data/kwazulu-natal/special-schools-2024.json";
import kznSne2025 from "@/data/kwazulu-natal/special-schools-2025.json";
import lpSne2023 from "@/data/limpopo/special-schools-2023.json";
import lpSne2024 from "@/data/limpopo/special-schools-2024.json";
import lpSne2025 from "@/data/limpopo/special-schools-2025.json";
import mpSne2023 from "@/data/mpumalanga/special-schools-2023.json";
import mpSne2024 from "@/data/mpumalanga/special-schools-2024.json";
import mpSne2025 from "@/data/mpumalanga/special-schools-2025.json";
import ecSne2023 from "@/data/eastern-cape/special-schools-2023.json";
import ecSne2024 from "@/data/eastern-cape/special-schools-2024.json";
import ecSne2025 from "@/data/eastern-cape/special-schools-2025.json";
import fsSne2023 from "@/data/free-state/special-schools-2023.json";
import fsSne2024 from "@/data/free-state/special-schools-2024.json";
import fsSne2025 from "@/data/free-state/special-schools-2025.json";
import nwSne2023 from "@/data/north-west/special-schools-2023.json";
import nwSne2024 from "@/data/north-west/special-schools-2024.json";
import nwSne2025 from "@/data/north-west/special-schools-2025.json";
import ncSne2023 from "@/data/northern-cape/special-schools-2023.json";
import ncSne2024 from "@/data/northern-cape/special-schools-2024.json";
import ncSne2025 from "@/data/northern-cape/special-schools-2025.json";
import { PROVINCES, getProvince, type ProvinceSlug } from "@/lib/provinces";
import { type CountrySlug, getCountry } from "@/lib/countries";
import naSchools from "@/data/namibia/schools.json";

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
  /** Country this school belongs to. Defaults to "south-africa". */
  countrySlug: CountrySlug;
  /** Province (only set for countries with provinces, e.g. South Africa). */
  provinceSlug?: ProvinceSlug;
  /** Region (used by countries without formal provinces, e.g. Namibia). */
  region?: string | null;
  /** Grade range (used by Namibia data). */
  gradeFrom?: string | null;
  gradeTo?: string | null;
  /** True when the record comes from the Special Needs Education Centres dataset. */
  isSpecialNeeds?: boolean;
}

export type DataYear = "2023" | "2024" | "2025";

export const AVAILABLE_YEARS: DataYear[] = ["2025", "2024", "2023"];

const tag = (
  rows: unknown,
  slug: ProvinceSlug,
  opts?: { specialNeeds?: boolean },
): School[] =>
  (rows as Omit<School, "provinceSlug" | "countrySlug">[]).map((s) => ({
    ...s,
    countrySlug: "south-africa" as CountrySlug,
    provinceSlug: slug,
    ...(opts?.specialNeeds ? { isSpecialNeeds: true } : {}),
  }));

/** Special-needs centres only, by province + year. */
const specialByProvince: Record<ProvinceSlug, Record<DataYear, School[]>> = {
  "gauteng": {
    "2023": tag(gpSne2023, "gauteng", { specialNeeds: true }),
    "2024": tag(gpSne2024, "gauteng", { specialNeeds: true }),
    "2025": tag(gpSne2025, "gauteng", { specialNeeds: true }),
  },
  "western-cape": {
    "2023": tag(wcSne2023, "western-cape", { specialNeeds: true }),
    "2024": tag(wcSne2024, "western-cape", { specialNeeds: true }),
    "2025": tag(wcSne2025, "western-cape", { specialNeeds: true }),
  },
  "kwazulu-natal": {
    "2023": tag(kznSne2023, "kwazulu-natal", { specialNeeds: true }),
    "2024": tag(kznSne2024, "kwazulu-natal", { specialNeeds: true }),
    "2025": tag(kznSne2025, "kwazulu-natal", { specialNeeds: true }),
  },
  "limpopo": {
    "2023": tag(lpSne2023, "limpopo", { specialNeeds: true }),
    "2024": tag(lpSne2024, "limpopo", { specialNeeds: true }),
    "2025": tag(lpSne2025, "limpopo", { specialNeeds: true }),
  },
  "mpumalanga": {
    "2023": tag(mpSne2023, "mpumalanga", { specialNeeds: true }),
    "2024": tag(mpSne2024, "mpumalanga", { specialNeeds: true }),
    "2025": tag(mpSne2025, "mpumalanga", { specialNeeds: true }),
  },
  "eastern-cape": {
    "2023": tag(ecSne2023, "eastern-cape", { specialNeeds: true }),
    "2024": tag(ecSne2024, "eastern-cape", { specialNeeds: true }),
    "2025": tag(ecSne2025, "eastern-cape", { specialNeeds: true }),
  },
  "free-state": {
    "2023": tag(fsSne2023, "free-state", { specialNeeds: true }),
    "2024": tag(fsSne2024, "free-state", { specialNeeds: true }),
    "2025": tag(fsSne2025, "free-state", { specialNeeds: true }),
  },
  "north-west": {
    "2023": tag(nwSne2023, "north-west", { specialNeeds: true }),
    "2024": tag(nwSne2024, "north-west", { specialNeeds: true }),
    "2025": tag(nwSne2025, "north-west", { specialNeeds: true }),
  },
  "northern-cape": {
    "2023": tag(ncSne2023, "northern-cape", { specialNeeds: true }),
    "2024": tag(ncSne2024, "northern-cape", { specialNeeds: true }),
    "2025": tag(ncSne2025, "northern-cape", { specialNeeds: true }),
  },
};

/**
 * Merge ordinary + special-needs schools per province/year, deduplicating by
 * EMIS id (an ordinary record wins if both exist for the same EMIS, but the
 * isSpecialNeeds flag is preserved so consumers can still classify it).
 */
const mergeWithSpecial = (
  ordinary: School[],
  special: School[],
): School[] => {
  const byId = new Map<string, School>();
  for (const s of ordinary) byId.set(s.id, s);
  for (const s of special) {
    const existing = byId.get(s.id);
    if (existing) {
      byId.set(s.id, { ...existing, isSpecialNeeds: true });
    } else {
      byId.set(s.id, s);
    }
  }
  return Array.from(byId.values());
};

const rawByProvince: Record<ProvinceSlug, Record<DataYear, School[]>> = {
  "gauteng": {
    "2023": mergeWithSpecial(tag(gp2023, "gauteng"), specialByProvince["gauteng"]["2023"]),
    "2024": mergeWithSpecial(tag(gp2024, "gauteng"), specialByProvince["gauteng"]["2024"]),
    "2025": mergeWithSpecial(tag(gp2025, "gauteng"), specialByProvince["gauteng"]["2025"]),
  },
  "western-cape": {
    "2023": mergeWithSpecial(tag(wc2023, "western-cape"), specialByProvince["western-cape"]["2023"]),
    "2024": mergeWithSpecial(tag(wc2024, "western-cape"), specialByProvince["western-cape"]["2024"]),
    "2025": mergeWithSpecial(tag(wc2025, "western-cape"), specialByProvince["western-cape"]["2025"]),
  },
  "kwazulu-natal": {
    "2023": mergeWithSpecial(tag(kzn2023, "kwazulu-natal"), specialByProvince["kwazulu-natal"]["2023"]),
    "2024": mergeWithSpecial(tag(kzn2024, "kwazulu-natal"), specialByProvince["kwazulu-natal"]["2024"]),
    "2025": mergeWithSpecial(tag(kzn2025, "kwazulu-natal"), specialByProvince["kwazulu-natal"]["2025"]),
  },
  "limpopo": {
    "2023": mergeWithSpecial(tag(lp2023, "limpopo"), specialByProvince["limpopo"]["2023"]),
    "2024": mergeWithSpecial(tag(lp2024, "limpopo"), specialByProvince["limpopo"]["2024"]),
    "2025": mergeWithSpecial(tag(lp2025, "limpopo"), specialByProvince["limpopo"]["2025"]),
  },
  "mpumalanga": {
    "2023": mergeWithSpecial(tag(mp2023, "mpumalanga"), specialByProvince["mpumalanga"]["2023"]),
    "2024": mergeWithSpecial(tag(mp2024, "mpumalanga"), specialByProvince["mpumalanga"]["2024"]),
    "2025": mergeWithSpecial(tag(mp2025, "mpumalanga"), specialByProvince["mpumalanga"]["2025"]),
  },
  "eastern-cape": {
    "2023": mergeWithSpecial(tag(ec2023, "eastern-cape"), specialByProvince["eastern-cape"]["2023"]),
    "2024": mergeWithSpecial(tag(ec2024, "eastern-cape"), specialByProvince["eastern-cape"]["2024"]),
    "2025": mergeWithSpecial(tag(ec2025, "eastern-cape"), specialByProvince["eastern-cape"]["2025"]),
  },
  "free-state": {
    "2023": mergeWithSpecial(tag(fs2023, "free-state"), specialByProvince["free-state"]["2023"]),
    "2024": mergeWithSpecial(tag(fs2024, "free-state"), specialByProvince["free-state"]["2024"]),
    "2025": mergeWithSpecial(tag(fs2025, "free-state"), specialByProvince["free-state"]["2025"]),
  },
  "north-west": {
    "2023": mergeWithSpecial(tag(nw2023, "north-west"), specialByProvince["north-west"]["2023"]),
    "2024": mergeWithSpecial(tag(nw2024, "north-west"), specialByProvince["north-west"]["2024"]),
    "2025": mergeWithSpecial(tag(nw2025, "north-west"), specialByProvince["north-west"]["2025"]),
  },
  "northern-cape": {
    "2023": mergeWithSpecial(tag(nc2023, "northern-cape"), specialByProvince["northern-cape"]["2023"]),
    "2024": mergeWithSpecial(tag(nc2024, "northern-cape"), specialByProvince["northern-cape"]["2024"]),
    "2025": mergeWithSpecial(tag(nc2025, "northern-cape"), specialByProvince["northern-cape"]["2025"]),
  },
};

const datasets: Record<DataYear, School[]> = {
  "2023": PROVINCES.flatMap((p) => rawByProvince[p.slug]["2023"]),
  "2024": PROVINCES.flatMap((p) => rawByProvince[p.slug]["2024"]),
  "2025": PROVINCES.flatMap((p) => rawByProvince[p.slug]["2025"]),
};

/**
 * Namibia dataset — single snapshot (no year split). Tagged as country
 * "namibia" with no provinceSlug so country-aware helpers can branch on it.
 */
const namibiaSchools: School[] = (
  naSchools as Omit<School, "countrySlug">[]
).map((s) => ({
  ...s,
  countrySlug: "namibia" as CountrySlug,
}));

/** Schools for a given country across all years (deduped by id). */
export const getSchoolsByCountry = (countrySlug: CountrySlug): School[] => {
  if (countrySlug === "namibia") return namibiaSchools;
  // South Africa: latest year wins
  const map = new Map<string, School>();
  for (const y of AVAILABLE_YEARS) {
    for (const s of datasets[y]) if (!map.has(s.id)) map.set(s.id, s);
  }
  return Array.from(map.values());
};

export const getSchools = (year: DataYear, provinceSlug?: ProvinceSlug): School[] =>
  provinceSlug ? rawByProvince[provinceSlug][year] : datasets[year];

/** All schools (every country) for a given year. Namibia is year-agnostic. */
export const getAllSchools = (year: DataYear): School[] => [
  ...datasets[year],
  ...namibiaSchools,
];

/**
 * Special-needs education centres only. When provinceSlug is omitted, returns
 * centres from every province for the given year.
 */
export const getSpecialSchools = (
  year: DataYear,
  provinceSlug?: ProvinceSlug,
): School[] =>
  provinceSlug
    ? specialByProvince[provinceSlug][year]
    : PROVINCES.flatMap((p) => specialByProvince[p.slug][year]);

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
  ...(nwMatric as Record<string, MatricResults>),
  ...(ncMatric as Record<string, MatricResults>),
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
  getSchools(year).find((s) => s.id === id) ??
  namibiaSchools.find((s) => s.id === id);

/** Find a Namibia school by its slug (slug ends with "-namibia"). */
export const findNamibiaSchoolBySlug = (slug: string): School | undefined => {
  const stripped = slug.replace(/-namibia$/i, "");
  return namibiaSchools.find((s) => schoolSlugBase(s) === stripped);
};

/** Slugify a free-form string the same way schoolSlugBase does. */
const slugifyPart = (s?: string | null): string =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Legacy Namibia URL suffix that used to be appended to every school page,
 * e.g. `/a-a-denk-memorial-school-kalkrand-fees-registration-forms-contact-details-website-facebook-principal-code-results-telephone`.
 * Used to 301 those URLs onto the canonical `/namibia/<name>-namibia` slug.
 */
export const LEGACY_NAMIBIA_SUFFIX =
  "-fees-registration-forms-contact-details-website-facebook-principal-code-results-telephone";

/**
 * Try to resolve a legacy Namibia URL slug like
 * "a-a-denk-memorial-school-kalkrand-fees-registration-forms-..." to a Namibia school.
 * The legacy slug = slugify(name) + "-" + slugify(town) + LEGACY_NAMIBIA_SUFFIX.
 * Falls back to matching by name-prefix when the town can't be matched exactly.
 */
export const findNamibiaSchoolByLegacySlug = (slug: string): School | undefined => {
  if (!slug) return undefined;
  const lower = slug.toLowerCase().replace(/\/+$/, "");
  if (!lower.endsWith(LEGACY_NAMIBIA_SUFFIX)) return undefined;
  const head = lower.slice(0, -LEGACY_NAMIBIA_SUFFIX.length);
  // Exact match: <name>-<town>
  const exact = namibiaSchools.find((s) => {
    const namePart = slugifyPart(s.name);
    const townPart = slugifyPart(s.town);
    if (!namePart) return false;
    const expected = townPart ? `${namePart}-${townPart}` : namePart;
    return expected === head;
  });
  if (exact) return exact;
  // Fallback: match by name prefix (in case town slug differs).
  return namibiaSchools.find((s) => {
    const namePart = slugifyPart(s.name);
    return !!namePart && head.startsWith(`${namePart}-`);
  });
};

/**
 * Tokens that historically appeared in the long-tail SA school URLs after the
 * school name (and sometimes town). Order doesn't matter — the URL contains
 * an arbitrary subset/permutation of these. Used to strip the suffix off
 * legacy SA slugs so we can match the bare name back to a current school.
 */
const LEGACY_SA_SUFFIX_TOKENS = new Set<string>([
  "fees",
  "fee",
  "registration",
  "registrations",
  "register",
  "forms",
  "form",
  "contact",
  "contacts",
  "details",
  "detail",
  "website",
  "websites",
  "facebook",
  "principal",
  "principals",
  "code",
  "codes",
  "results",
  "result",
  "telephone",
  "telephones",
  "phone",
  "phones",
  "address",
  "addresses",
  "email",
  "emails",
  "info",
  "information",
  "application",
  "applications",
  "apply",
  "online",
  "and",
  "or",
]);

/** Lazily-built index: name-slug -> SA school (latest year wins). */
let saSchoolsByNameSlug: Map<string, School> | null = null;
/** Lazily-built index: name-slug + "-" + town-slug -> SA school. */
let saSchoolsByNameTownSlug: Map<string, School> | null = null;

const buildSaSlugIndexes = () => {
  if (saSchoolsByNameSlug && saSchoolsByNameTownSlug) return;
  const byName = new Map<string, School>();
  const byNameTown = new Map<string, School>();
  // Walk newest year first so the latest record wins on collisions.
  for (const y of AVAILABLE_YEARS) {
    for (const s of datasets[y]) {
      const namePart = slugifyPart(s.name);
      if (!namePart) continue;
      if (!byName.has(namePart)) byName.set(namePart, s);
      const townPart = slugifyPart(s.town);
      if (townPart) {
        const key = `${namePart}-${townPart}`;
        if (!byNameTown.has(key)) byNameTown.set(key, s);
      }
    }
  }
  saSchoolsByNameSlug = byName;
  saSchoolsByNameTownSlug = byNameTown;
};

/**
 * Try to resolve a legacy South-African URL slug like
 * "nhliziyonhle-primary-school-fees-registration-contact" (any subset of the
 * marketing tokens, in any order) to a current SA school.
 *
 * Algorithm:
 *   1. Strip a trailing run of LEGACY_SA_SUFFIX_TOKENS tokens.
 *   2. Try `<name>-<town>` against the SA name+town index.
 *   3. Try `<name>` against the SA name-only index.
 *   4. Otherwise, walk the head from the right, peeling tokens off until
 *      a match is found (handles cases where town/extra tokens are present).
 */
export const findSouthAfricanSchoolByLegacySlug = (
  slug: string,
): School | undefined => {
  if (!slug) return undefined;
  const cleaned = slug.toLowerCase().replace(/^\/+|\/+$/g, "");
  if (!cleaned || cleaned.includes("/")) return undefined; // single-segment only
  const parts = cleaned.split("-").filter(Boolean);
  if (parts.length < 2) return undefined;

  // Must contain at least one marketing token to qualify as a legacy URL,
  // otherwise we'd hijack arbitrary unmatched paths.
  const hasMarketingToken = parts.some((p) => LEGACY_SA_SUFFIX_TOKENS.has(p));
  if (!hasMarketingToken) return undefined;

  // 1) Strip trailing marketing tokens.
  let end = parts.length;
  while (end > 0 && LEGACY_SA_SUFFIX_TOKENS.has(parts[end - 1])) end--;
  const head = parts.slice(0, end);
  if (head.length === 0) return undefined;

  buildSaSlugIndexes();

  const fullSlug = head.join("-");

  // 2) name + town
  const nameTownHit = saSchoolsByNameTownSlug!.get(fullSlug);
  if (nameTownHit) return nameTownHit;

  // 3) name only
  const nameHit = saSchoolsByNameSlug!.get(fullSlug);
  if (nameHit) return nameHit;

  // 4) Peel tokens off the right end until something matches.
  for (let i = head.length - 1; i >= 1; i--) {
    const candidate = head.slice(0, i).join("-");
    const hit = saSchoolsByNameSlug!.get(candidate);
    if (hit) return hit;
  }

  return undefined;
};

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

/** Slug from name only (no trailing id). Used for Namibia "<name>-namibia" URLs. */
const schoolSlugBase = (school: { name?: string | null; id: string }): string => {
  const base = (school.name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || school.id;
};

/**
 * Extract the trailing numeric id from a slug like "name-700261719".
 * For Namibia slugs ending with "-namibia" (no numeric id), returns null.
 */
export const idFromSlug = (slug: string): string => {
  // Strip a trailing country suffix first.
  const cleaned = slug.replace(/-(namibia|south-africa)$/i, "");
  const m = cleaned.match(/(\d+)$/);
  return m ? m[1] : cleaned;
};

/** Convenience: build the canonical school detail URL. Country-aware. */
export const schoolHref = (school: {
  name?: string | null;
  id: string;
  provinceSlug?: ProvinceSlug;
  countrySlug?: CountrySlug;
}) => {
  if (school.countrySlug === "namibia") {
    return `/namibia/${schoolSlugBase(school)}-namibia`;
  }
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