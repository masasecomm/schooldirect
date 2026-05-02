import { Helmet } from "react-helmet-async";
import {
  buildDescription,
  buildKeywords,
  buildTitle,
  buildSchoolJsonLd,
  schoolPageUrl,
} from "@/lib/seo";
import type { School, MatricResults } from "@/lib/schools";
import { getProvinceForSchool } from "@/lib/provinces";
import { getCountryForSchool } from "@/lib/countries";

type Props = {
  school: School;
  matric: MatricResults | null;
};

export const SchoolSeo = ({ school, matric }: Props) => {
  const country = getCountryForSchool(school);
  const province = country.hasProvinces ? getProvinceForSchool(school) : null;
  const geoRegion = province ? province.geoRegion : country.geoRegion;
  const placeName =
    school.suburb || school.town || (province?.name ?? school.region ?? country.name);
  const lang = country.iso === "ZA" ? "en-ZA" : "en";
  const ogLocale = country.iso === "ZA" ? "en_ZA" : "en";
  const url = schoolPageUrl(school);
  const title = buildTitle(school);
  const description = buildDescription(school, matric);
  const keywords = buildKeywords(school, matric);
  const jsonLd = buildSchoolJsonLd(school, matric, url);
  const geoPos =
    school.latitude != null && school.longitude != null
      ? `${school.latitude};${school.longitude}`
      : null;
  const icbm =
    school.latitude != null && school.longitude != null
      ? `${school.latitude}, ${school.longitude}`
      : null;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index,follow,max-image-preview:large" />
      <link rel="canonical" href={url} />

      {/* Local SEO */}
      <meta name="geo.region" content={geoRegion} />
      <meta name="geo.placename" content={placeName} />
      {geoPos && <meta name="geo.position" content={geoPos} />}
      {icbm && <meta name="ICBM" content={icbm} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content="School Direct" />
      <meta property="og:image" content="https://schooldirect.org/favicon.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://schooldirect.org/favicon.png" />

      <meta name="theme-color" content="#1d4ed8" />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};