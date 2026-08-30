import { readdir, readFile, stat } from "node:fs/promises";
import { basename, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { categories, categorySlugs, domains, domainSlugs } from "../src/data/site.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const failures = [];

function fail(file, message) {
  failures.push(`${relative(root, file)}: ${message}`);
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(path);
      return /\.mdx?$/u.test(entry.name) ? [path] : [];
    }),
  );
  return nested.flat();
}

function splitInlineList(value) {
  const items = [];
  let current = "";
  let quote = "";
  for (const character of value.slice(1, -1)) {
    if ((character === '"' || character === "'") && (!quote || quote === character)) {
      quote = quote ? "" : character;
      current += character;
    } else if (character === "," && !quote) {
      items.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) items.push(current.trim());
  return items.map(parseScalar);
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) return splitInlineList(trimmed);
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^\d+$/u.test(trimmed)) return Number(trimmed);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(file, source) {
  const normalized = source.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    fail(file, "missing opening frontmatter delimiter");
    return {};
  }
  const end = normalized.indexOf("\n---\n", 4);
  if (end < 0) {
    fail(file, "missing closing frontmatter delimiter");
    return {};
  }

  const data = {};
  const lines = normalized.slice(4, end).split("\n");
  let currentKey;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const topLevel = line.match(/^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/u);
    if (topLevel) {
      currentKey = topLevel[1];
      const value = topLevel[2]?.trim() ?? "";
      data[currentKey] = value ? parseScalar(value) : undefined;
      continue;
    }

    if (currentKey && line.trimStart().startsWith("[")) {
      let flowList = line.trim();
      while (!flowList.endsWith("]") && index + 1 < lines.length) {
        index += 1;
        flowList += lines[index].trim();
      }
      data[currentKey] = parseScalar(flowList);
      continue;
    }

    const listItem = line.match(/^\s{2}-\s+(.+)$/u);
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(parseScalar(listItem[1]));
      continue;
    }

    const nestedField = line.match(/^\s{2}([A-Za-z][A-Za-z0-9]*):\s*(.*)$/u);
    if (nestedField && currentKey) {
      if (!data[currentKey] || Array.isArray(data[currentKey])) data[currentKey] = {};
      data[currentKey][nestedField[1]] = parseScalar(nestedField[2]);
    }
  }
  return data;
}

async function loadCollection(name) {
  const directory = join(root, "src", "content", name);
  const files = await markdownFiles(directory);
  return Promise.all(
    files.map(async (file) => ({
      collection: name,
      file,
      data: parseFrontmatter(file, await readFile(file, "utf8")),
    })),
  );
}

function stringList(entry, field) {
  const value = entry.data[field];
  if (value === undefined || value === "") return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(entry.file, `${field} must be a list of slugs`);
    return [];
  }
  return value;
}

function validateSlugs(entries) {
  const seen = new Map();
  for (const entry of entries) {
    const slug = entry.data.slug;
    if (typeof slug !== "string" || !slugPattern.test(slug)) {
      fail(entry.file, "slug must use stable lowercase ASCII words separated by hyphens");
      continue;
    }
    const expected = basename(entry.file, extname(entry.file));
    if (expected !== slug) fail(entry.file, `filename must match slug ${slug}`);
    if (seen.has(slug))
      fail(entry.file, `duplicate slug also used by ${relative(root, seen.get(slug))}`);
    seen.set(slug, entry.file);
  }
  return new Set(seen.keys());
}

function validateRelations(entries, field, targets) {
  for (const entry of entries) {
    const values = stringList(entry, field);
    if (new Set(values).size !== values.length) fail(entry.file, `${field} contains duplicates`);
    for (const slug of values) {
      if (!targets.has(slug)) fail(entry.file, `${field} references missing slug ${slug}`);
      if (field === "related" && slug === entry.data.slug) {
        fail(entry.file, "related must not reference the current article");
      }
    }
  }
}

function validateOrders(entries, field, groupField) {
  const seen = new Map();
  const groupedOrders = new Map();
  for (const entry of entries) {
    const order = entry.data[field];
    const group = groupField ? entry.data[groupField] : entry.collection;
    if (groupField && !group && order !== undefined)
      fail(entry.file, `${field} requires ${groupField}`);
    if (groupField && group && (!Number.isInteger(order) || order < 1)) {
      fail(entry.file, `${groupField} requires a positive ${field}`);
      continue;
    }
    if (!groupField && (!Number.isInteger(order) || order < 1)) {
      fail(entry.file, `${field} must be a positive integer`);
      continue;
    }
    if (!group) continue;
    const key = `${group}:${order}`;
    if (seen.has(key)) fail(entry.file, `${field} duplicates ${key}`);
    seen.set(key, entry.file);
    if (!groupedOrders.has(group)) groupedOrders.set(group, []);
    groupedOrders.get(group).push({ order, file: entry.file });
  }
  for (const [group, values] of groupedOrders) {
    values
      .sort((left, right) => left.order - right.order)
      .forEach((value, index) => {
        const expected = index + 1;
        if (value.order !== expected) {
          fail(value.file, `${field} for ${group} must be contiguous from 1; expected ${expected}`);
        }
      });
  }
}

async function validateArticleCovers(articles) {
  for (const article of articles) {
    const source = article.data.cover?.src;
    if (typeof source !== "string" || !/^\/images\/covers\/[a-z0-9-]+\.webp$/u.test(source)) {
      fail(article.file, "cover.src must be a WebP under /images/covers/");
      continue;
    }
    const file = join(root, "public", source.slice(1));
    try {
      if (!(await stat(file)).isFile()) fail(article.file, `cover file is missing: ${source}`);
    } catch {
      fail(article.file, `cover file is missing: ${source}`);
    }
  }
}

function validateTaxonomy(articles, research, projects) {
  const categorySet = new Set(categorySlugs);
  const domainSet = new Set(domainSlugs);
  for (const article of articles) {
    if (!categorySet.has(article.data.category)) {
      fail(article.file, `unknown category ${article.data.category}`);
    }
  }
  for (const entry of [...research, ...projects]) {
    if (!domainSet.has(entry.data.domain)) fail(entry.file, `unknown domain ${entry.data.domain}`);
  }

  const mappedCategories = domains.flatMap((domain) => domain.categorySlugs);
  for (const category of categories) {
    const count = mappedCategories.filter((slug) => slug === category.slug).length;
    if (count !== 1)
      fail(join(root, "src", "data", "site.ts"), `${category.slug} must map to exactly one domain`);
  }
}

async function validateCmsContract() {
  const file = join(root, "public", "admin", "config.yml");
  const cms = await readFile(file, "utf8");
  const expectedFields = {
    articles: ["title", "description", "slug", "category", "tags", "cover", "body"],
    research: [
      "title",
      "summary",
      "slug",
      "domain",
      "status",
      "questions",
      "methods",
      "tools",
      "tags",
      "relatedProjects",
      "relatedArticles",
      "links",
      "disclosure",
      "featured",
      "order",
      "draft",
      "body",
    ],
    projects: [
      "title",
      "summary",
      "slug",
      "domain",
      "status",
      "role",
      "methods",
      "tools",
      "tags",
      "relatedResearch",
      "relatedArticles",
      "repository",
      "demo",
      "links",
      "disclosure",
      "featured",
      "order",
      "draft",
      "body",
    ],
  };
  for (const [name, fields] of Object.entries(expectedFields)) {
    const start = cms.search(new RegExp(`^  - name:\\s*${name}\\s*$`, "mu"));
    if (start < 0) {
      fail(file, `missing ${name} collection`);
      continue;
    }
    const following = cms.slice(start + 1).search(/^  - name:\s*[a-z]/mu);
    const block = following < 0 ? cms.slice(start) : cms.slice(start, start + 1 + following);
    for (const field of fields) {
      if (!new RegExp(`\\bname:\\s*${field}\\b`, "u").test(block)) {
        fail(file, `${name} CMS collection is missing field ${field}`);
      }
    }
  }
  for (const slug of [...categorySlugs, ...domainSlugs]) {
    if (!new RegExp(`value:\\s*["']?${slug}["']?\\b`, "u").test(cms)) {
      fail(file, `CMS options are missing ${slug}`);
    }
  }
}

const [articles, research, projects] = await Promise.all([
  loadCollection("articles"),
  loadCollection("research"),
  loadCollection("projects"),
]);
const articleSlugs = validateSlugs(articles);
const researchSlugs = validateSlugs(research);
const projectSlugs = validateSlugs(projects);

validateTaxonomy(articles, research, projects);
validateRelations(articles, "related", articleSlugs);
validateRelations(research, "relatedProjects", projectSlugs);
validateRelations(research, "relatedArticles", articleSlugs);
validateRelations(projects, "relatedResearch", researchSlugs);
validateRelations(projects, "relatedArticles", articleSlugs);
validateOrders(
  articles.filter((article) => article.data.series || article.data.seriesOrder !== undefined),
  "seriesOrder",
  "series",
);
validateOrders(research, "order");
validateOrders(projects, "order");
await Promise.all([validateArticleCovers(articles), validateCmsContract()]);

if (failures.length > 0) {
  console.error(
    `Content contract failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
  );
  process.exit(1);
}

console.log(
  `Content contract passed: ${articles.length} articles, ${research.length} research directions, ${projects.length} projects.`,
);
