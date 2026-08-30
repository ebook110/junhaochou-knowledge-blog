import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { categorySlugs, domainSlugs } from "./data/site";

const stableSlug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a stable lowercase ASCII slug.");
const category = z.enum(categorySlugs);
const domain = z.enum(domainSlugs);
const tags = z.array(z.string().trim().min(1).max(40)).min(1).max(12);
const methods = z.array(z.string().trim().min(2).max(60)).min(1).max(12);
const tools = z.array(z.string().trim().min(1).max(60)).min(1).max(12);
const references = z.array(stableSlug).max(12).default([]);
const publicLinks = z
  .array(
    z
      .object({
        label: z.string().trim().min(2).max(40),
        url: z.url(),
      })
      .strict(),
  )
  .max(6)
  .default([]);

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
    canonical: z.url().optional(),
    disclaimer: z.string().optional(),
    related: z.array(z.string()).default([]),
  }),
});

const research = defineCollection({
  loader: glob({ base: "./src/content/research", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: z.string().trim().min(8).max(100),
      summary: z.string().trim().min(20).max(220),
      slug: stableSlug,
      domain,
      status: z.enum(["active", "documented"]),
      questions: z.array(z.string().trim().min(8).max(160)).min(1).max(8),
      methods,
      tools,
      tags,
      relatedProjects: references,
      relatedArticles: references,
      links: publicLinks,
      disclosure: z.string().trim().min(20).max(500),
      featured: z.boolean().default(false),
      order: z.number().int().positive(),
      draft: z.boolean().default(false),
      updatedDate: z.coerce.date(),
      lastVerified: z.coerce.date().optional(),
    })
    .strict(),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: z.string().trim().min(8).max(100),
      summary: z.string().trim().min(20).max(220),
      slug: stableSlug,
      domain,
      status: z.enum(["active", "maintained", "completed"]),
      role: z.string().trim().min(4).max(100),
      methods,
      tools,
      tags,
      relatedResearch: references,
      relatedArticles: references,
      repository: z.url().optional(),
      demo: z.url().optional(),
      links: publicLinks,
      disclosure: z.string().trim().min(20).max(500),
      featured: z.boolean().default(false),
      order: z.number().int().positive(),
      draft: z.boolean().default(false),
      updatedDate: z.coerce.date(),
      lastVerified: z.coerce.date().optional(),
    })
    .strict(),
});

export const collections = { articles, research, projects };
