#!/usr/bin/env node
/**
 * Build-time landing-page summary generator.
 *
 * The full school dataset is ~55MB of JSON. Importing it into the landing
 * page (or anything in the SiteFooter) means visitors download all of it
 * before the homepage renders.
 *
 * This script reads the raw province/country JSON once at build time and
 * writes a tiny `src/data/_generated/landing-summary.json` containing only
 * what the home page + footer need: per-province totals, the top 3 featured
 * schools per province, and active-department names.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const PROVINCES = [
  { slug: "gauteng", name: "Gauteng", dept: "Gauteng Department of Education", dataDir: "gauteng" },
  { slug: "western-cape", name: "Western Cape", dept: "Western Cape Education Department", dataDir: "western-cape" },
  { slug: "kwazulu-natal", name: "KwaZulu-Natal", dept: "KwaZulu-Natal Department of Education", dataDir: "kwazulu-natal" },
  { slug: "limpopo", name: "Limpopo", dept: "Limpopo Department of Education", dataDir: "limpopo" },
  { slug: "mpumalanga", name: "Mpumalanga", dept: "Mpumalanga Department of Education", dataDir: "mpumalanga" },
  { slug: "eastern-cape", name: "Eastern Cape", dept: "Eastern Cape Department of Education", dataDir: "eastern-cape" },
  { slug: "free-state", name: "Free State", dept: "Free State Department of Education", dataDir: "free-state" },
  { slug: "north-west", name: "North West", dept: "North West Department of Education", dataDir: "north-west" },
  { slug: "northern-cape", name: "Northern Cape", dept: "Northern Cape Department of Education", dataDir: "northern-cape" },
];

const slugify = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleCase = (s) => {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(Of|And|The|For|In|To|A)\b/g, (m) => m.toLowerCase());
};

const readJson = (p) => {
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, "utf-8")); } catch { return []; }
};

const schoolHref = (s, provinceSlug) => {
  const base = slugify(s.name) || s.id;
  return `/south-africa/${provinceSlug}/${base}-${s.id}`;
};

const namibiaHref = (s) => {
  const base = slugify(s.name) || s.id;
  return `/namibia/${base}-namibia`;
};

const FEATURED = 3;

const provinceData = [];
let totalSchools = 0;
let totalSpecial = 0;

for (const p of PROVINCES) {
  const ord = readJson(resolve(root, "src/data", p.dataDir, "schools-2025.json"));
  const sne = readJson(resolve(root, "src/data", p.dataDir, "special-schools-2025.json"));

  // Merge by id, ordinary wins
  const byId = new Map();
  for (const s of ord) byId.set(s.id, s);
  for (const s of sne) if (!byId.has(s.id)) byId.set(s.id, s);
  const all = Array.from(byId.values());

  totalSchools += all.length;
  totalSpecial += sne.length;

  // Top featured by learner count (open schools only)
  const featured = all
    .filter((s) => typeof s.learners === "number" && s.learners > 0)
    .sort((a, b) => (b.learners ?? 0) - (a.learners ?? 0))
    .slice(0, FEATURED)
    .map((s) => ({
      id: s.id,
      href: schoolHref(s, p.slug),
      name: titleCase(s.name),
      phase: s.phase ? titleCase(s.phase) : null,
      sector: s.sector ? titleCase(s.sector) : null,
      suburb: s.suburb ? titleCase(s.suburb) : null,
      town: s.town ? titleCase(s.town) : null,
      learners: s.learners ?? null,
      principal: s.principal ? titleCase(s.principal) : null,
    }));

  if (all.length > 0) {
    provinceData.push({
      slug: p.slug,
      name: p.name,
      dept: p.dept,
      total: all.length,
      featured,
    });
  }
}

// Namibia
const namibia = readJson(resolve(root, "src/data/namibia/schools.json"));
const namibiaFeatured = [...namibia]
  .sort((a, b) => String(a.name).localeCompare(String(b.name)))
  .slice(0, FEATURED)
  .map((s) => ({
    id: s.id,
    href: namibiaHref(s),
    name: titleCase(s.name),
    phase: s.type ? titleCase(s.type) : null,
    sector: s.sector ? titleCase(s.sector) : null,
    suburb: s.suburb ? titleCase(s.suburb) : null,
    town: s.town ? titleCase(s.town) : null,
    learners: typeof s.learners === "number" ? s.learners : null,
    principal: s.principal ? titleCase(s.principal) : null,
  }));

const summary = {
  generatedAt: new Date().toISOString(),
  totalSchools,
  totalSpecial,
  provinces: provinceData,
  namibia: { total: namibia.length, featured: namibiaFeatured },
  activeDepts: [
    ...provinceData.map((p) => p.dept),
    ...(namibia.length > 0 ? ["Namibia Ministry of Education"] : []),
  ],
};

const outDir = resolve(root, "src/data/_generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "landing-summary.json"), JSON.stringify(summary));

console.log(
  `[landing-summary] ${provinceData.length} provinces, ${totalSchools} SA schools, ${namibia.length} Namibia schools, ${totalSpecial} special`,
);