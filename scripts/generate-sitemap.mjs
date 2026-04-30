#!/usr/bin/env node
/**
 * Build-time sitemap generator.
 * Reads the three yearly school JSON files and emits public/sitemap.xml
 * containing one <url> per unique school (latest year wins) plus the static
 * top-level routes.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SITE_URL = "https://schooldirect.org";

// Keep in sync with src/lib/provinces.ts. Plain JS so this runs at build time
// without a TS toolchain.
const PROVINCES = [
  { slug: "gauteng", dataDir: "gauteng" },
  { slug: "western-cape", dataDir: "western-cape" },
  { slug: "kwazulu-natal", dataDir: "kwazulu-natal" },
  { slug: "limpopo", dataDir: "limpopo" },
  { slug: "mpumalanga", dataDir: "mpumalanga" },
  { slug: "eastern-cape", dataDir: "eastern-cape" },
  { slug: "free-state", dataDir: "free-state" },
  { slug: "north-west", dataDir: "north-west" },
  { slug: "northern-cape", dataDir: "northern-cape" },
];

const slugify = (name, id) => {
  const base = String(name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${id}` : String(id);
};

const loadYear = (provinceDir, year) => {
  const ordPath = resolve(root, `src/data/${provinceDir}/schools-${year}.json`);
  const sneePath = resolve(root, `src/data/${provinceDir}/special-schools-${year}.json`);
  let schools = [];
  let mtime = new Date(0);
  if (existsSync(ordPath)) {
    schools = schools.concat(JSON.parse(readFileSync(ordPath, "utf-8")));
    const m = statSync(ordPath).mtime;
    if (m > mtime) mtime = m;
  }
  if (existsSync(sneePath)) {
    schools = schools.concat(JSON.parse(readFileSync(sneePath, "utf-8")));
    const m = statSync(sneePath).mtime;
    if (m > mtime) mtime = m;
  }
  return { schools, mtime };
};

const years = ["2025", "2024", "2023"];
// id -> { school, provinceSlug, lastmod } (latest year wins)
const merged = new Map();
let latestDataMtime = new Date(0);
for (const province of PROVINCES) {
  for (const y of years) {
    const { schools, mtime } = loadYear(province.dataDir, y);
    if (mtime > latestDataMtime) latestDataMtime = mtime;
    const lastmod = mtime.toISOString().slice(0, 10);
    for (const s of schools) {
      if (!merged.has(s.id)) {
        merged.set(s.id, { school: s, provinceSlug: province.slug, lastmod });
      }
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
const dataDate = latestDataMtime.toISOString().slice(0, 10);

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[c]));

const staticUrls = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/south-africa", priority: "0.5", changefreq: "monthly" },
  { loc: "/south-africa/special-needs", priority: "0.7", changefreq: "monthly" },
  ...PROVINCES.map((p) => ({
    loc: `/south-africa/${p.slug}`,
    priority: "0.7",
    changefreq: "weekly",
  })),
  ...PROVINCES.map((p) => ({
    loc: `/south-africa/${p.slug}/special-needs`,
    priority: "0.6",
    changefreq: "monthly",
  })),
  { loc: "/about", priority: "0.4", changefreq: "yearly" },
  { loc: "/admissions", priority: "0.6", changefreq: "monthly" },
];

const buildUrlset = (entries) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (u) =>
        `  <url><loc>${escape(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");

const staticEntries = staticUrls.map((u) => ({
  loc: `${SITE_URL}${u.loc}`,
  lastmod: today,
  changefreq: u.changefreq,
  priority: u.priority,
}));

const schoolEntries = Array.from(merged.values()).map(({ school, provinceSlug, lastmod }) => ({
  loc: `${SITE_URL}/south-africa/${provinceSlug}/${slugify(school.name, school.id)}`,
  lastmod,
  changefreq: "monthly",
  priority: "0.8",
}));

writeFileSync(resolve(root, "public/sitemap-static.xml"), buildUrlset(staticEntries), "utf-8");
writeFileSync(resolve(root, "public/sitemap-schools.xml"), buildUrlset(schoolEntries), "utf-8");

// Combined sitemap kept for backwards-compatibility with anything already
// pointing at /sitemap.xml.
writeFileSync(
  resolve(root, "public/sitemap.xml"),
  buildUrlset([...staticEntries, ...schoolEntries]),
  "utf-8",
);

const sitemapIndex = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <sitemap><loc>${SITE_URL}/sitemap-static.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `  <sitemap><loc>${SITE_URL}/sitemap-schools.xml</loc><lastmod>${dataDate}</lastmod></sitemap>`,
  "</sitemapindex>",
  "",
].join("\n");
writeFileSync(resolve(root, "public/sitemap-index.xml"), sitemapIndex, "utf-8");

console.log(
  `[sitemap] wrote ${staticEntries.length} static + ${schoolEntries.length} school urls (data lastmod ${dataDate})`,
);