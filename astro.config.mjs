import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import codeMeta from "./src/remark/code-meta.mjs";

export default defineConfig({
  site: "https://junhaochou.com",
  output: "static",
  integrations: [mdx(), sitemap()],
  markdown: { remarkPlugins: [remarkMath, codeMeta], rehypePlugins: [rehypeKatex] },
  vite: { plugins: [tailwindcss()] },
});
