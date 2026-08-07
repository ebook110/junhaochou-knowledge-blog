export const site = {
  name: "JunhaoChou",
  title: "JunhaoChou Knowledge Blog",
  description: "材料计算、工程自动化与可靠技术实践的中文知识库。",
  url: "https://junhaochou.com",
  github: "https://github.com/ebook110",
  email: "junhaozhou163@gmail.com",
  tagline: "记录 · 分享 · 探索 · 成长",
  profile: "材料模拟 · 机器学习 · 工程自动化 · 技术笔记",
} as const;

export const categories = [
  { slug: "vps", name: "VPS 与建站", description: "服务器、域名、部署与运维。", accent: "sky" },
  {
    slug: "sub2api",
    name: "Sub2API 与 AI",
    description: "合规 API 集成与工具实践。",
    accent: "cyan",
  },
  { slug: "network", name: "网络与节点", description: "网络原理、客户端与排查。", accent: "blue" },
  {
    slug: "cards",
    name: "银行卡与 U 卡",
    description: "产品比较、风险识别与合规。",
    accent: "amber",
  },
  {
    slug: "ansys",
    name: "ANSYS 与 Codex",
    description: "仿真工作流与工程协作。",
    accent: "indigo",
  },
  {
    slug: "linux",
    name: "Linux 与脚本",
    description: "Shell、自动化与故障处理。",
    accent: "emerald",
  },
  { slug: "tools", name: "工具与资源", description: "可信工具与排查资源。", accent: "violet" },
  { slug: "learning", name: "学习与项目", description: "知识管理与持续学习。", accent: "rose" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export const navigation = [
  { href: "/", label: "首页" },
  { href: "/articles/", label: "文章" },
  { href: "/series/", label: "系列" },
  { href: "/tools/", label: "工具" },
  { href: "/about/", label: "关于" },
];

export const tools = [
  { name: "Docker", description: "可复现的容器化部署", href: "https://docs.docker.com/" },
  { name: "Cloudflare", description: "DNS、HTTPS 与边缘安全", href: "https://www.cloudflare.com/" },
  { name: "LAMMPS", description: "分子动力学模拟平台", href: "https://www.lammps.org/" },
  { name: "ANSYS", description: "工程仿真与参数化分析", href: "https://www.ansys.com/" },
];
