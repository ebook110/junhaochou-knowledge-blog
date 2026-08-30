import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4322";
const output = resolve(process.argv[3] ?? ".impeccable/screenshots");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ channel: process.env.CI ? undefined : "chrome" });
const captures = [
  { name: "home-light-desktop", path: "/", width: 1440, height: 1000, theme: "light" },
  { name: "home-dark-desktop", path: "/", width: 1440, height: 1000, theme: "dark" },
  { name: "home-light-mobile", path: "/", width: 390, height: 844, theme: "light" },
  { name: "home-dark-mobile", path: "/", width: 390, height: 844, theme: "dark" },
  {
    name: "article-light-desktop",
    path: "/articles/ansys-codex-workflow/",
    width: 1440,
    height: 1000,
    theme: "light",
  },
  {
    name: "articles-dark-desktop",
    path: "/articles/",
    width: 1440,
    height: 1000,
    theme: "dark",
  },
];

try {
  for (const capture of captures) {
    const context = await browser.newContext({
      viewport: { width: capture.width, height: capture.height },
      colorScheme: capture.theme,
      deviceScaleFactor: 1,
    });
    await context.addInitScript((theme) => {
      localStorage.setItem("junhao-theme", theme);
    }, capture.theme);
    const page = await context.newPage();
    await page.goto(new URL(capture.path, baseUrl).toString(), { waitUntil: "networkidle" });
    await page.screenshot({ path: resolve(output, `${capture.name}.png`), animations: "disabled" });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Captured ${captures.length} visual review screenshots in ${output}.`);
