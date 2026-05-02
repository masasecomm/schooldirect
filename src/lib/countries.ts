import type { ProvinceSlug } from "@/lib/provinces";

export type CountrySlug = "south-africa" | "namibia";

export interface CountryConfig {
  slug: CountrySlug;
  name: string;
  shortName: string;
  /** ISO-3166 alpha-2 */
  iso: string;
  /** Used for <meta name="geo.region"> when there is no province */
  geoRegion: string;
  hasProvinces: boolean;
  dept: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    slug: "south-africa",
    name: "South Africa",
    shortName: "SA",
    iso: "ZA",
    geoRegion: "ZA",
    hasProvinces: true,
    dept: "South African provincial education departments",
  },
  {
    slug: "namibia",
    name: "Namibia",
    shortName: "NA",
    iso: "NA",
    geoRegion: "NA",
    hasProvinces: false,
    dept: "Namibia Ministry of Education, Arts and Culture",
  },
];

export const DEFAULT_COUNTRY: CountryConfig = COUNTRIES[0];

export const getCountry = (slug?: string | null): CountryConfig => {
  if (!slug) return DEFAULT_COUNTRY;
  return COUNTRIES.find((c) => c.slug === slug) ?? DEFAULT_COUNTRY;
};

export const isCountrySlug = (slug?: string | null): slug is CountrySlug =>
  !!slug && COUNTRIES.some((c) => c.slug === slug);

export const getCountryForSchool = (school: {
  countrySlug?: CountrySlug | string | null;
  provinceSlug?: ProvinceSlug | string | null;
}): CountryConfig => {
  if (school.countrySlug) return getCountry(school.countrySlug);
  // Province implies South Africa.
  if (school.provinceSlug) return getCountry("south-africa");
  return DEFAULT_COUNTRY;
};