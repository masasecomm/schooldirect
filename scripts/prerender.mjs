#!/usr/bin/env node
/**
 * Post-build prerender: serve the freshly built dist/ on a local port,
 * launch headless Chromium, walk every URL listed in dist/sitemap.xml,
 * and overwrite dist/<route>/index.html with the fully-rendered HTML.
 *
 * After this runs, every school page ships as static HTML — crawlers,
 * social previews, and AI bots see the title, meta tags, JSON-LD, and
 * visible content without needing to execute JavaScript.
 */
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import handler from "serve-handler";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");

if (!existsSync(distDir)) {
  console.error("[prerender] dist/ does not exist — run vite build first.");
  process.exit(1);
}

const SITE_URL = "https://schooldirect.org";
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY ?? 6);
const PORT = Number(process.env.PRERENDER_PORT ?? 4321);
const NAV_TIMEOUT = Number(process.env.PRERENDER_TIMEOUT ?? 120) * 1000;
// Allow this many failed routes before we mark the whole build as failed.
// A handful of stragglers shouldn't block deployment of the other ~3,000 pages.
const FAILURE_THRESHOLD = Number(process.env.PRERENDER_FAILURE_THRESHOLD ?? 25);

// 1. Read routes from the just-generated sitemap.
const sitemapXml = readFileSync(resolve(distDir, "sitemap.xml"), "utf-8");
const routes = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g))
  .map((m) => m[1].replace(SITE_URL, ""))
  .map((p) => (p === "" ? "/" : p))
  // SPA fallback file lives at the root; never overwrite it with a deep route.
  .filter((p, i, arr) => arr.indexOf(p) === i);

console.log(`[prerender] ${routes.length} routes to render with concurrency ${CONCURRENCY}`);

// 2. Spin up a static file server over dist/ with SPA fallback to /index.html.
const server = createServer((req, res) =>
  handler(req, res, {
    public: distDir,
    rewrites: [{ source: "**", destination: "/index.html" }],
    headers: [
      {
        source: "**/*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ],
  }),
);

await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const origin = `http://127.0.0.1:${PORT}`;
console.log(`[prerender] static server up at ${origin}`);

// 3. Launch a single browser; reuse pages across a worker pool.
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const renderOne = async (route) => {
  const page = await browser.newPage();
  // Block heavy network we do not need for HTML capture.
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const t = req.resourceType();
    if (t === "image" || t === "media" || t === "font") return req.abort();
    return req.continue();
  });
  try {
    // First try networkidle0 for a fully-settled page; if it times out, fall
    // back to domcontentloaded so we still capture rendered HTML for slow routes.
    try {
      await page.goto(`${origin}${route}`, { waitUntil: "networkidle0", timeout: NAV_TIMEOUT });
    } catch (err) {
      if (!String(err.message).includes("timeout")) throw err;
      await page.goto(`${origin}${route}`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
      // Give React a moment to hydrate and helmet to flush.
      await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
    }
    // Give react-helmet-async a tick to flush head tags.
    await page.evaluate(() => new Promise((r) => setTimeout(r, 50)));
    const html = await page.content();

    const outPath =
      route === "/"
        ? resolve(distDir, "index.html")
        : resolve(distDir, route.replace(/^\//, ""), "index.html");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, "utf-8");
  } finally {
    await page.close();
  }
};

// Simple worker pool.
const queue = routes.slice();
let done = 0;
let failed = 0;
const startedAt = Date.now();

const worker = async () => {
  while (queue.length > 0) {
    const route = queue.shift();
    try {
      await renderOne(route);
      done += 1;
      if (done % 50 === 0 || done === routes.length) {
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
        console.log(`[prerender] ${done}/${routes.length} done (${elapsed}s, ${failed} failed)`);
      }
    } catch (err) {
      failed += 1;
      console.warn(`[prerender] FAILED ${route}: ${err.message}`);
    }
  }
};

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

await browser.close();
server.close();

const totalSec = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(`[prerender] complete: ${done} ok, ${failed} failed, ${totalSec}s`);
if (failed > FAILURE_THRESHOLD) {
  console.error(`[prerender] ${failed} failures exceeds threshold of ${FAILURE_THRESHOLD}`);
  process.exit(1);
}