import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));

async function files(directory) {
  const entries = await readdir(directory);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry);
      return (await stat(path)).isDirectory() ? files(path) : [path];
    }),
  );
  return nested.flat();
}

const html = (await files(root)).filter((file) => file.endsWith(".html"));
const failures = [];
for (const file of html) {
  const content = await readFile(file, "utf8");
  for (const match of content.matchAll(/(?:href|src)="([^"#?]+)"/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(target)) continue;
    const pathname = decodeURIComponent(new URL(target, "https://junhaochou.com").pathname);
    const local = target.startsWith("/") ? join(root, pathname) : resolve(file, "..", pathname);
    const candidates = [local, join(local, "index.html"), `${local}.html`];
    try {
      await Promise.any(candidates.map((candidate) => stat(candidate)));
    } catch {
      failures.push(`${relative(root, file)} -> ${target}`);
    }
  }
}
if (failures.length) {
  console.error(`Broken internal links:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`Checked ${html.length} HTML files: no broken internal links.`);
