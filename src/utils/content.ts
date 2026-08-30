import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type ResearchEntry = CollectionEntry<"research">;
export type ProjectEntry = CollectionEntry<"projects">;

export const researchStatusLabels = {
  active: "持续研究",
  documented: "方法归档",
} as const;

export const projectStatusLabels = {
  active: "持续推进",
  maintained: "持续维护",
  completed: "阶段完成",
} as const;

export async function getPublishedResearch(): Promise<ResearchEntry[]> {
  const entries = await getCollection("research", ({ data }) => !data.draft);
  return entries.sort((left, right) => left.data.order - right.data.order);
}

export async function getPublishedProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection("projects", ({ data }) => !data.draft);
  return entries.sort((left, right) => left.data.order - right.data.order);
}
