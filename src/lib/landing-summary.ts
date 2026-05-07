import summary from "@/data/_generated/landing-summary.json";

export interface FeaturedSchoolLite {
  id: string;
  href: string;
  name: string;
  phase: string | null;
  sector: string | null;
  suburb: string | null;
  town: string | null;
  learners: number | null;
  principal: string | null;
}

export interface ProvinceSummary {
  slug: string;
  name: string;
  dept: string;
  total: number;
  featured: FeaturedSchoolLite[];
}

export interface LandingSummary {
  generatedAt: string;
  totalSchools: number;
  totalSpecial: number;
  provinces: ProvinceSummary[];
  namibia: { total: number; featured: FeaturedSchoolLite[] };
  singapore: { total: number; featured: FeaturedSchoolLite[] };
  activeDepts: string[];
}

export const LANDING_SUMMARY = summary as LandingSummary;