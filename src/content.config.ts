import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const category = z.enum([
  "vps",
  "sub2api",
  "network",
  "cards",
  "ansys",
  "linux",
  "tools",
  "learning",
]);

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(8),
    description: z.string().min(20).max(220),
    slug: z.string().min(2),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category,
    tags: z.array(z.string().min(1)).min(1),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    difficulty: z.enum(["入门", "进阶", "高级"]),
    prerequisites: z.array(z.string()).default([]),
    environment: z.array(z.string()).default([]),
    cover: z.object({
      src: z.string().regex(/^\/images\/covers\/[a-z0-9-]+\.webp$/),
      alt: z.string().min(8).max(180),
      focal: z.string().optional(),
    }),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    toc: z.boolean().default(true),
    lastVerified: z.coerce.date().optional(),
    author: z.string().default("JunhaoChou"),
    canonical: z.string().url().optional(),
    disclaimer: z.string().optional(),
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { articles };
