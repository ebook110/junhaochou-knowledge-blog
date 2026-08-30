import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const textExtensions = new Set([
  "",
  ".astro",
  ".css",
  ".env",
  ".example",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".py",
  ".sh",
  ".ts",
  ".txt",
  ".yaml",
  ".yml",
]);
const excluded = new Set(["package-lock.json"]);
const patterns = [
  { label: "private key", expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u },
  { label: "GitHub token", expression: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/u },
  { label: "GitHub fine-grained token", expression: /\bgithub_pat_[A-Za-z0-9_]{40,}\b/u },
  { label: "AWS access key", expression: /\bAKIA[0-9A-Z]{16}\b/u },
  {
    label: "assigned secret-like value",
    expression:
      /(?:password|passwd|api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["'][A-Za-z0-9_/+.-]{16,}["']/iu,
  },
];

const tracked = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
  cwd: root,
  encoding: "utf8",
})
  .split(/\r?\n/u)
  .filter(Boolean);
const findings = [];

for (const name of tracked) {
  if (excluded.has(name) || name.startsWith(".git/") || name.startsWith("node_modules/")) continue;
  const extension = extname(name).toLowerCase();
  if (!textExtensions.has(extension)) continue;
  const file = resolve(root, name);
  let fileStat;
  try {
    fileStat = await stat(file);
  } catch (error) {
    if (error?.code === "ENOENT") continue;
    throw error;
  }
  if (fileStat.size > 1024 * 1024) continue;
  const source = await readFile(file, "utf8");
  for (const pattern of patterns) {
    const match = source.match(pattern.expression);
    if (!match) continue;
    const line = source.slice(0, match.index).split(/\r?\n/u).length;
    findings.push(`${relative(root, file)}:${line} resembles a ${pattern.label}`);
  }
}

if (findings.length > 0) {
  console.error(`Secret scan failed:\n${findings.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}

console.log(`Secret scan passed: ${tracked.length} tracked and unignored files considered.`);
