export type ProvinceSlug = "gauteng" | "western-cape";

export interface ProvinceConfig {
  slug: ProvinceSlug;
  name: string;
  shortName: string;
  geoRegion: string; // ISO 3166-2:ZA
  dataDir: string;
  dept: string;
}

export const PROVINCES: ProvinceConfig[] = [
  {
    slug: "gauteng",
    name: "Gauteng",
    shortName: "GP",
    geoRegion: "ZA-GP",
    dataDir: "gauteng",
    dept: "Gauteng Department of Education",
  },
  {
    slug: "western-cape",
    name: "Western Cape",
    shortName: "WC",
    geoRegion: "ZA-WC",
    dataDir: "western-cape",
    dept: "Western Cape Education Department",
  },
];

export const DEFAULT_PROVINCE: ProvinceConfig = PROVINCES[0];

export const getProvince = (slug?: string | null): ProvinceConfig => {
  if (!slug) return DEFAULT_PROVINCE;
  return PROVINCES.find((p) => p.slug === slug) ?? DEFAULT_PROVINCE;
};

export const getProvinceForSchool = (school: {
  provinceSlug?: ProvinceSlug | string | null;
}): ProvinceConfig => getProvince(school.provinceSlug ?? null);

export const isProvinceSlug = (slug?: string | null): slug is ProvinceSlug =>
  !!slug && PROVINCES.some((p) => p.slug === slug);