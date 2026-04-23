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

export const findWalkInCentresForSchool = (school: {
  suburb?: string | null;
  township?: string | null;
  town?: string | null;
  municipality?: string | null;
}): WalkInMatch[] => {
  const candidates = [school.suburb, school.township, school.town, school.municipality]
    .filter((v): v is string => !!v && v.trim().length > 0)
    .map((v) => ({ raw: v, n: norm(v) }))
    .filter((v) => v.n.length > 0);
  if (candidates.length === 0) return [];

  const matches: WalkInMatch[] = [];
  const seen = new Set<string>();
  for (const c of walkInCentres) {
    for (const area of c.areasServed) {
      const an = norm(area);
      if (!an) continue;
      const hit = candidates.find(
        (cand) =>
          cand.n === an ||
          cand.n.includes(an) ||
          an.includes(cand.n),
      );
      if (hit) {
        const key = `${c.region}|${c.subRegion}|${c.address}|${c.contacts.map((p) => p.phone).join(",")}|${area}`;
        if (seen.has(key)) continue;
        seen.add(key);
        matches.push({ centre: c, matchedArea: area, matchedOn: hit.raw });
      }
    }
  }
  return matches;
};