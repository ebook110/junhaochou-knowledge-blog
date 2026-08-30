export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  url: string;
  github: string;
  email: string;
  tagline: string;
  profile: string;
}

export const site = {
  name: "JunhaoChou",
  title: "JunhaoChou Knowledge Blog",
  description: "难熔高熵合金、科研计算、机器学习与工程系统的中文知识库。",
  url: "https://junhaochou.com",
  github: "https://github.com/ebook110",
  email: "junhaozhou163@gmail.com",
  tagline: "材料研究、计算方法与工程实践",
  profile: "难熔高熵合金 · 分子动力学 · 机器学习 · 工程系统",
} as const satisfies SiteConfig;

export const categorySlugs = [
  "vps",
  "sub2api",
  "network",
  "cards",
  "ansys",
  "linux",
  "tools",
  "learning",
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

export interface CategoryConfig {
  slug: CategorySlug;
  name: string;
  description: string;
  accent: string;
}

const categoryDetails: Record<CategorySlug, Omit<CategoryConfig, "slug">> = {
  vps: { name: "VPS 与建站", description: "服务器、域名、部署与运维。", accent: "sky" },
  sub2api: {
    name: "Sub2API 与 AI",
    description: "合规 API 集成与工具实践。",
    accent: "cyan",
  },
  network: {
    name: "网络与节点",
    description: "网络原理、客户端与排查。",
    accent: "blue",
  },
  cards: {
    name: "银行卡与 U 卡",
    description: "产品比较、风险识别与合规。",
    accent: "amber",
  },
  ansys: {
    name: "ANSYS 与 Codex",
    description: "仿真工作流与工程协作。",
    accent: "indigo",
  },
  linux: {
    name: "Linux 与脚本",
    description: "Shell、自动化与故障处理。",
    accent: "emerald",
  },
  tools: {
    name: "工具与资源",
    description: "可信工具与排查资源。",
    accent: "violet",
  },
  learning: {
    name: "学习与项目",
    description: "知识管理与持续学习。",
    accent: "rose",
  },
};

export const categories: readonly CategoryConfig[] = categorySlugs.map((slug) => ({
  slug,
  ...categoryDetails[slug],
}));

export const domainSlugs = [
  "scientific-computing",
  "engineering-automation",
  "systems-deployment",
  "network-risk",
] as const;

export type DomainSlug = (typeof domainSlugs)[number];

export interface DomainConfig {
  slug: DomainSlug;
  name: string;
  description: string;
  categorySlugs: readonly CategorySlug[];
  methods: readonly string[];
}

export const domains = [
  {
    slug: "scientific-computing",
    name: "科研计算",
    description: "连接材料问题、数值模拟、数据建模与可解释分析。",
    categorySlugs: ["ansys"],
    methods: ["LAMMPS", "ANSYS", "Python", "可解释建模"],
  },
  {
    slug: "engineering-automation",
    name: "工程自动化",
    description: "把脚本、内容系统与协作流程组织为可复核的工程实践。",
    categorySlugs: ["sub2api", "tools", "learning"],
    methods: ["Astro", "Git", "Docker", "工作流自动化"],
  },
  {
    slug: "systems-deployment",
    name: "系统与部署",
    description: "关注 Linux 服务、容器交付、可观测性与安全运维。",
    categorySlugs: ["vps", "linux"],
    methods: ["Linux", "Docker Compose", "Nginx", "Cloudflare"],
  },
  {
    slug: "network-risk",
    name: "网络与数字风险",
    description: "以授权使用、来源核验和风险意识理解网络与数字产品。",
    categorySlugs: ["network", "cards"],
    methods: ["配置审查", "来源核验", "合规边界", "故障排查"],
  },
] as const satisfies readonly DomainConfig[];

export interface NavigationItem {
  href: string;
  label: string;
}

export const navigation = [
  { href: "/", label: "首页" },
  { href: "/research/", label: "研究" },
  { href: "/projects/", label: "项目" },
  { href: "/articles/", label: "文章" },
  { href: "/about/", label: "关于" },
] as const satisfies readonly NavigationItem[];

export interface ToolLink {
  name: string;
  description: string;
  href: string;
}

export const tools = [
  { name: "Docker", description: "可复现的容器化部署", href: "https://docs.docker.com/" },
  { name: "Cloudflare", description: "DNS、HTTPS 与边缘安全", href: "https://www.cloudflare.com/" },
  { name: "LAMMPS", description: "分子动力学模拟平台", href: "https://www.lammps.org/" },
  { name: "ANSYS", description: "工程仿真与参数化分析", href: "https://www.ansys.com/" },
] as const satisfies readonly ToolLink[];

export function getCategory(slug: CategorySlug): CategoryConfig {
  return categories.find((category) => category.slug === slug)!;
}

export function getDomain(slug: DomainSlug): DomainConfig {
  return domains.find((domain) => domain.slug === slug)!;
}
