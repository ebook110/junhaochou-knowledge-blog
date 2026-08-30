import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const failures = [];

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? files(path) : [path];
    }),
  );
  return nested.flat();
}

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function fail(file, message) {
  failures.push(`${relative(root, file)}: ${message}`);
}

function meta(content, property) {
  const escaped = property.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+(?:name|property)=["']${escaped}["'][^>]*content=["']([^"']+)["']`,
    "iu",
  );
  return content.match(pattern)?.[1];
}

const allFiles = await files(root);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
let pagefindBodies = 0;

for (const file of htmlFiles) {
  const content = await readFile(file, "utf8");
  const route = relative(root, file).replaceAll("\\", "/");
  const isAdmin = route === "admin/index.html";

  if (content.includes("data-pagefind-body")) pagefindBodies += 1;
  if (!isAdmin) {
    if (!/<title>[^<]+<\/title>/iu.test(content)) fail(file, "missing a non-empty title");
    if (!meta(content, "description")) fail(file, "missing description metadata");
    if (!/<link\s+rel=["']canonical["'][^>]+href=["']https:\/\/junhaochou\.com/iu.test(content)) {
      fail(file, "missing canonical URL");
    }
  }

  for (const image of content.matchAll(/<img\b[^>]*>/giu)) {
    if (!/\salt=["'][^"']*["']/iu.test(image[0])) fail(file, "image is missing an alt attribute");
  }

  if (/^(articles|research|projects)\/[^/]+\/index\.html$/u.test(route)) {
    if (!content.includes("data-pagefind-body")) fail(file, "canonical detail lacks Pagefind body");
    if (content.includes('data-pagefind-ignore="all"')) fail(file, "canonical detail is ignored");
    if (meta(content, "og:type") !== "article") fail(file, "detail Open Graph type is not article");
  }
}

if (pagefindBodies !== 14) {
  failures.push(`Expected 14 canonical Pagefind bodies, found ${pagefindBodies}.`);
}

const homepagePath = join(root, "index.html");
const homepage = await readFile(homepagePath, "utf8");
if (!homepage.includes("FINISH: unreviewed and undocumented is unfinished")) {
  fail(homepagePath, "Impeccable direction contract was removed by the build");
}
if (/unpkg\.com|fonts\.googleapis\.com/iu.test(homepage)) {
  fail(homepagePath, "homepage contains a forbidden floating CDN or external font");
}

const homepageScripts = new Set(
  [...homepage.matchAll(/<script\b[^>]*\ssrc=["']([^"']+\.js)["']/giu)]
    .map((match) => match[1])
    .filter((source) => source.startsWith("/_astro/")),
);
let homepageGzipBytes = 0;
for (const source of homepageScripts) {
  const scriptPath = join(root, source.slice(1));
  if (!(await exists(scriptPath))) {
    fail(homepagePath, `missing entry script ${source}`);
    continue;
  }
  homepageGzipBytes += gzipSync(await readFile(scriptPath)).byteLength;
}
if (homepageGzipBytes > 100 * 1024) {
  fail(homepagePath, `initial JavaScript is ${(homepageGzipBytes / 1024).toFixed(1)} KiB gzip`);
}

const adminPath = join(root, "admin", "index.html");
const admin = await readFile(adminPath, "utf8");
if (meta(admin, "robots") !== "noindex, nofollow, noarchive") {
  fail(adminPath, "admin robots policy is missing");
}
if (/unpkg\.com|cdn\.jsdelivr\.net/iu.test(admin)) {
  fail(adminPath, "admin still references a floating CDN");
}
if (!admin.includes("/_astro/")) fail(adminPath, "admin does not use a local bundled script");

const requiredArtifacts = [
  "rss.xml",
  "robots.txt",
  "pagefind/pagefind.js",
  "admin/config.yml",
  "admin/preview.css",
];
for (const artifact of requiredArtifacts) {
  if (!(await exists(join(root, artifact)))) failures.push(`Missing dist artifact: ${artifact}`);
}
if (
  !(await exists(join(root, "sitemap-index.xml"))) &&
  !(await exists(join(root, "sitemap-0.xml")))
) {
  failures.push("Missing generated sitemap.");
}

const sitemapFiles = allFiles.filter((file) => /sitemap(?:-\d+)?\.xml$/u.test(file));
for (const sitemapFile of sitemapFiles) {
  const sitemapContent = await readFile(sitemapFile, "utf8");
  if (/https:\/\/junhaochou\.com\/admin\//u.test(sitemapContent)) {
    fail(sitemapFile, "admin route must not be discoverable through the sitemap");
  }
}

if (failures.length > 0) {
  console.error(
    `Distribution validation failed:\n${failures.map((item) => `- ${item}`).join("\n")}`,
  );
  process.exit(1);
}

console.log(
  `Distribution validation passed: ${htmlFiles.length} HTML files, ${pagefindBodies} canonical Pagefind bodies, ${(homepageGzipBytes / 1024).toFixed(1)} KiB initial JS gzip.`,
);
