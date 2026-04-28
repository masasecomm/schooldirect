#!/usr/bin/env node
/**
 * Build-time sitemap generator.
 * Reads the three yearly school JSON files and emits public/sitemap.xml
 * containing one <url> per unique school (latest year wins) plus the static
 * top-level routes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SITE_URL = "https://schooldirect.org";

const slugify = (name, id) => {
  const base = String(name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${id}` : String(id);
};

const loadYear = (year) => {
  const path = resolve(root, `src/data/schools-${year}.json`);
  return JSON.parse(readFileSync(path, "utf-8"));
};

const years = ["2025", "2024", "2023"];
const merged = new Map(); // id -> school (latest year wins)
for (const y of years) {
  for (const s of loadYear(y)) {
    if (!merged.has(s.id)) merged.set(s.id, s);
  }
}

const today = new Date().toISOString().slice(0, 10);

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
  { loc: "/south-africa/gauteng", priority: "0.7", changefreq: "weekly" },
  { loc: "/about", priority: "0.4", changefreq: "yearly" },
  { loc: "/admissions", priority: "0.6", changefreq: "monthly" },
];

const urls = [
  ...staticUrls.map((u) => ({
    loc: `${SITE_URL}${u.loc}`,
    lastmod: today,
    changefreq: u.changefreq,
    priority: u.priority,
  })),
  ...Array.from(merged.values()).map((s) => ({
    loc: `${SITE_URL}/south-africa/gauteng/${slugify(s.name, s.id)}`,
    lastmod: today,
    changefreq: "monthly",
    priority: "0.8",
  })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    (u) =>
      `  <url><loc>${escape(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
  ),
  "</urlset>",
  "",
].join("\n");

const out = resolve(root, "public/sitemap.xml");
writeFileSync(out, xml, "utf-8");
console.log(`[sitemap] wrote ${urls.length} urls to ${out}`);