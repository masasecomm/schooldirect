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