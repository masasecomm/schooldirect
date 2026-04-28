import { titleCase, displayName, schoolHref, getSchools, type School, type MatricResults } from "@/lib/schools";

export const SITE_URL = "https://schooldirect.org";
export const SITE_NAME = "School Direct";

export const absoluteUrl = (path: string): string => {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const placeOf = (s: School): string =>
  titleCase(s.suburb || s.township || s.town || s.district || "Gauteng") || "Gauteng";

const trim160 = (s: string, max = 160): string => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length)}…`;
};

export const buildTitle = (school: School): string => {
  const place = placeOf(school);
  return `${displayName(school)} — ${place}, Gauteng | Fees, Contact, Matric Results`;
};

export const buildDescription = (school: School, matric?: MatricResults | null): string => {
  const name = displayName(school);
  const place = placeOf(school);
  const phase = school.phase ? titleCase(school.phase).toLowerCase() : "school";
  const sector = school.sector ? titleCase(school.sector).toLowerCase() : "public";
  const learners =
    typeof school.learners === "number" && school.learners > 0
      ? `${school.learners.toLocaleString()} learners`
      : null;
  const fee = school.noFee === "YES" ? "no-fee" : school.quintile ? `quintile ${school.quintile}` : null;
  const pass = matric?.y2025?.pct
    ? `${matric.y2025.pct.toFixed(1)}% matric pass rate (2025)`
    : null;

  const parts = [
    `${name} is a ${sector} ${phase} in ${place}, Gauteng.`,
    learners,
    fee ? `${fee} school` : null,
    pass,
    "Contact details, address, and matric results.",
  ].filter(Boolean);

  return trim160(parts.join(" "));
};

export const buildKeywords = (school: School, matric?: MatricResults | null): string => {
  const name = displayName(school);
  const place = placeOf(school);
  const out = new Set<string>();
  out.add(name);
  out.add(`${name} ${place}`);
  out.add(`${name} contact details`);
  out.add(`${name} matric results`);
  out.add(`${name} fees`);
  out.add(`schools in ${place}`);
  if (school.district) out.add(`${titleCase(school.district)} schools`);
  if (school.phase) out.add(`${titleCase(school.phase)} school in ${place}`);
  out.add(`EMIS ${school.emis}`);
  if (matric?.centreNo) out.add(`Centre number ${matric.centreNo}`);
  out.add("Gauteng schools directory");
  return Array.from(out).join(", ");
};

export const buildSchoolJsonLd = (
  school: School,
  matric: MatricResults | null,
  pageUrl: string,
) => {
  const name = displayName(school);
  const place = placeOf(school);
  const identifiers: Array<Record<string, unknown>> = [
    { "@type": "PropertyValue", propertyID: "EMIS", value: school.emis },
  ];
  if (matric?.centreNo) {
    identifiers.push({ "@type": "PropertyValue", propertyID: "CentreNumber", value: matric.centreNo });
  }

  const address: Record<string, unknown> = {
    "@type": "PostalAddress",
    addressRegion: "Gauteng",
    addressCountry: "ZA",
  };
  if (school.streetAddress) address.streetAddress = titleCase(school.streetAddress);
  if (school.suburb) address.addressLocality = titleCase(school.suburb);
  else if (school.town) address.addressLocality = titleCase(school.town);

  const schoolNode: Record<string, unknown> = {
    "@type": ["School", "EducationalOrganization"],
    "@id": `${pageUrl}#school`,
    name,
    url: pageUrl,
    address,
    identifier: identifiers,
    areaServed: place,
    sameAs: [pageUrl],
  };
  if (school.telephone) schoolNode.telephone = school.telephone;
  if (school.email) schoolNode.email = school.email;
  if (typeof school.learners === "number" && school.learners > 0) {
    schoolNode.numberOfStudents = school.learners;
  }
  if (school.latitude != null && school.longitude != null) {
    schoolNode.geo = {
      "@type": "GeoCoordinates",
      latitude: school.latitude,
      longitude: school.longitude,
    };
  }

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "South Africa", item: `${SITE_URL}/south-africa` },
      { "@type": "ListItem", position: 3, name: "Gauteng", item: `${SITE_URL}/south-africa/gauteng` },
      ...(school.district
        ? [
            {
              "@type": "ListItem",
              position: 4,
              name: `${titleCase(school.district)} District`,
              item: `${SITE_URL}/south-africa/gauteng`,
            },
            { "@type": "ListItem", position: 5, name, item: pageUrl },
          ]
        : [{ "@type": "ListItem", position: 4, name, item: pageUrl }]),
    ],
  };

  const webPage = {
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: buildTitle(school),
    description: buildDescription(school, matric),
    inLanguage: "en-ZA",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    about: { "@id": `${pageUrl}#school` },
    breadcrumb: breadcrumbs,
  };

  // FAQ generated from real data — shared with the visible on-page accordion.
  const faqs = buildSchoolFaqs(school, matric);

  const faqPage = {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [schoolNode, webPage, breadcrumbs, faqPage],
  };
};

export const schoolPageUrl = (school: School): string => absoluteUrl(schoolHref(school));

/**
 * Build the canonical FAQ list for a school.
 * Used both for the visible accordion on the page and for FAQPage JSON-LD,
 * so users and Google see exactly the same Q&A.
 */
export const buildSchoolFaqs = (
  school: School,
  matric: MatricResults | null,
): Array<{ q: string; a: string }> => {
  const name = displayName(school);
  const faqs: Array<{ q: string; a: string }> = [];

  if (school.principal) {
    faqs.push({
      q: `Who is the principal of ${name}?`,
      a: `${titleCase(school.principal)} is the principal of ${name}.`,
    });
  }
  if (typeof school.learners === "number" && school.learners > 0) {
    faqs.push({
      q: `How many learners does ${name} have?`,
      a: `${name} has ${school.learners.toLocaleString()} learners enrolled.`,
    });
  }
  if (typeof school.educators === "number" && school.educators > 0) {
    const ratio =
      typeof school.learners === "number" && school.learners > 0
        ? ` That works out to roughly ${Math.round(school.learners / school.educators)} learners per teacher.`
        : "";
    faqs.push({
      q: `How many teachers work at ${name}?`,
      a: `${name} has ${school.educators.toLocaleString()} educators on staff.${ratio}`,
    });
  }
  if (school.phase && (school.suburb || school.town)) {
    const phaseLabel = titleCase(school.phase);
    const area = titleCase(school.suburb || school.town || "");
    const areaKey = (school.suburb || school.town || "").toUpperCase();
    const phaseKey = school.phase.toUpperCase();
    const all = getSchools("2025");
    const nearby = all.filter((s) => {
      if (s.id === school.id) return false;
      if ((s.phase || "").toUpperCase() !== phaseKey) return false;
      const sArea = (s.suburb || s.town || "").toUpperCase();
      return sArea === areaKey;
    });
    if (nearby.length > 0) {
      faqs.push({
        q: `How many ${phaseLabel.toLowerCase()} schools are near ${name}?`,
        a: `There are ${nearby.length} other ${phaseLabel.toLowerCase()} school${nearby.length === 1 ? "" : "s"} in ${area} listed in the latest Gauteng dataset.`,
      });
    }
  }

  if (school.streetAddress || school.suburb || school.town) {
    const where = [school.streetAddress, school.suburb, school.town]
      .filter(Boolean)
      .map((p) => titleCase(p as string))
      .join(", ");
    faqs.push({
      q: `Where is ${name}?`,
      a: `${name} is located at ${where}, Gauteng, South Africa.`,
    });
  }
  if (school.telephone || school.email) {
    const bits: string[] = [];
    if (school.telephone) bits.push(`phone ${school.telephone}`);
    if (school.email) bits.push(`email ${school.email}`);
    faqs.push({
      q: `How do I contact ${name}?`,
      a: `You can contact ${name} on ${bits.join(" or ")}.`,
    });
  }
  if (matric?.y2025?.pct != null) {
    faqs.push({
      q: `What is ${name}'s 2025 matric pass rate?`,
      a: `${name} achieved a ${matric.y2025.pct.toFixed(1)}% matric pass rate in 2025, with ${matric.y2025.achieved} of ${matric.y2025.wrote} learners passing.`,
    });
  }
  faqs.push({
    q: `Is ${name} a no-fee school?`,
    a:
      school.noFee === "YES"
        ? `Yes — ${name} is a no-fee public school${school.quintile ? ` (quintile ${school.quintile})` : ""}.`
        : `${name} is a fee-paying school${school.quintile ? ` (quintile ${school.quintile})` : ""}.`,
  });
  faqs.push({
    q: `What is the EMIS number for ${name}?`,
    a: `The EMIS number for ${name} is ${school.emis}.`,
  });
  return faqs;
};