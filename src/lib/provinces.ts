export type ProvinceSlug =
  | "gauteng"
  | "western-cape"
  | "kwazulu-natal"
  | "limpopo"
  | "mpumalanga"
  | "eastern-cape"
  | "free-state"
  | "north-west"
  | "northern-cape";

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
  {
    slug: "kwazulu-natal",
    name: "KwaZulu-Natal",
    shortName: "KZN",
    geoRegion: "ZA-NL",
    dataDir: "kwazulu-natal",
    dept: "KwaZulu-Natal Department of Education",
  },
  {
    slug: "limpopo",
    name: "Limpopo",
    shortName: "LP",
    geoRegion: "ZA-LP",
    dataDir: "limpopo",
    dept: "Limpopo Department of Education",
  },
  {
    slug: "mpumalanga",
    name: "Mpumalanga",
    shortName: "MP",
    geoRegion: "ZA-MP",
    dataDir: "mpumalanga",
    dept: "Mpumalanga Department of Education",
  },
  {
    slug: "eastern-cape",
    name: "Eastern Cape",
    shortName: "EC",
    geoRegion: "ZA-EC",
    dataDir: "eastern-cape",
    dept: "Eastern Cape Department of Education",
  },
  {
    slug: "free-state",
    name: "Free State",
    shortName: "FS",
    geoRegion: "ZA-FS",
    dataDir: "free-state",
    dept: "Free State Department of Education",
  },
  {
    slug: "north-west",
    name: "North West",
    shortName: "NW",
    geoRegion: "ZA-NW",
    dataDir: "north-west",
    dept: "North West Department of Education",
  },
  {
    slug: "northern-cape",
    name: "Northern Cape",
    shortName: "NC",
    geoRegion: "ZA-NC",
    dataDir: "northern-cape",
    dept: "Northern Cape Department of Education",
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