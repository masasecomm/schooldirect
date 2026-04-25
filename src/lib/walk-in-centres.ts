import data from "@/data/walk-in-centres.json";

export type WalkInContact = {
  name: string;
  phone: string;
};

export type WalkInCentre = {
  region: string;
  subRegion: string;
  centre: string;
  address: string;
  areasServed: string[];
  contacts: WalkInContact[];
};

export const walkInCentres: WalkInCentre[] = data as WalkInCentre[];

export const REGIONS = ["Ekurhuleni", "Johannesburg", "Tshwane", "Sedibeng"] as const;
export type Region = (typeof REGIONS)[number];

export const groupBySubRegion = (centres: WalkInCentre[]) => {
  const map = new Map<string, WalkInCentre[]>();
  for (const c of centres) {
    const key = `${c.region} — ${c.subRegion}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return Array.from(map.entries());
};

export const telHref = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;

export const mapsHref = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Tiny Levenshtein distance — used to forgive small spelling differences
 * between the official dataset (e.g. "Ennerdale") and the messy school
 * records (e.g. "ENNERADALE").
 */
const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1).fill(0).map((_, i) => i);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
};

/**
 * Returns true if the school candidate string and the centre's served area
 * should be considered a match. Handles:
 *  - exact normalised equality
 *  - substring containment in either direction
 *  - small typos (edit distance ≤ 2 on words of length ≥ 5)
 *  - token overlap for multi-word areas (e.g. "Kempton Park" vs "Kempton")
 */
const areaMatches = (candidate: string, area: string): boolean => {
  if (!candidate || !area) return false;
  if (candidate === area) return true;
  if (candidate.includes(area) || area.includes(candidate)) return true;

  const candTokens = candidate.split(" ").filter((t) => t.length >= 4);
  const areaTokens = area.split(" ").filter((t) => t.length >= 4);
  for (const ct of candTokens) {
    for (const at of areaTokens) {
      if (ct === at) return true;
      const maxLen = Math.max(ct.length, at.length);
      if (maxLen >= 5 && editDistance(ct, at) <= 2) return true;
    }
  }
  return false;
};

/**
 * Match a school's location against the walk-in centres' `areasServed` lists.
 * Returns all centres whose served area names overlap with any of the
 * school's locality fields (suburb, township, town, municipality).
 * Each match also reports which area string triggered it.
 */
export type WalkInMatch = {
  centre: WalkInCentre;
  matchedArea: string;
  matchedOn: string; // the school field value that matched
};

const GENERIC_TOKENS = new Set([
  "city",
  "metropolitan",
  "municipality",
  "local",
  "district",
  "north",
  "south",
  "east",
  "west",
  "central",
  "inner",
  "park",
  "town",
  "view",
  "ext",
  "extension",
  "johannesburg",
  "tshwane",
  "ekurhuleni",
  "sedibeng",
  "pretoria",
  "gauteng",
]);

const stripGeneric = (s: string) =>
  s
    .split(" ")
    .filter((t) => !GENERIC_TOKENS.has(t))
    .join(" ")
    .trim();

export const findWalkInCentresForSchool = (school: {
  suburb?: string | null;
  township?: string | null;
  town?: string | null;
  municipality?: string | null;
  district?: string | null;
}): WalkInMatch[] => {
  // Municipality is intentionally excluded — it's metro-wide (e.g. "City of
  // Johannesburg Metropolitan Municipality") and produces false positives.
  const candidates = [school.suburb, school.township, school.town]
    .filter((v): v is string => !!v && v.trim().length > 0)
    .map((v) => {
      const n = norm(v);
      return { raw: v, n, stripped: stripGeneric(n) };
    })
    .filter((v) => v.n.length > 0);

  const matches: WalkInMatch[] = [];
  const seen = new Set<string>();
  for (const c of walkInCentres) {
    for (const area of c.areasServed) {
      const an = norm(area);
      if (!an) continue;
      const aStripped = stripGeneric(an);
      // If after stripping common words there's nothing left, the area is
      // too generic on its own (e.g. "Inner city") to safely fuzzy-match.
      if (!aStripped) continue;
      const hit = candidates.find((cand) => {
        if (!cand.stripped) return false;
        return areaMatches(cand.stripped, aStripped);
      });
      if (hit) {
        const key = `${c.region}|${c.subRegion}|${c.address}|${c.contacts.map((p) => p.phone).join(",")}|${area}`;
        if (seen.has(key)) continue;
        seen.add(key);
        matches.push({ centre: c, matchedArea: area, matchedOn: hit.raw });
      }
    }
  }

  // Fallback: when no specific suburb/township/town match was found, fall
  // back to the school's district. Every Gauteng district maps 1:1 to a
  // walk-in centre subRegion (e.g. "EKURHULENI SOUTH" -> "Ekurhuleni South"),
  // so this guarantees parents always see at least their district office.
  if (matches.length === 0 && school.district) {
    const districtNorm = norm(school.district);
    for (const c of walkInCentres) {
      if (norm(c.subRegion) !== districtNorm) continue;
      const key = `${c.region}|${c.subRegion}|${c.address}|${c.contacts.map((p) => p.phone).join(",")}|district`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        centre: c,
        matchedArea: c.subRegion,
        matchedOn: school.district,
      });
    }
  }

  return matches;
};