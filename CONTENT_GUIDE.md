# 内容维护指南

## 文件与元数据

在 `src/content/articles/` 新建 `.md` 或 `.mdx` 文件。每篇文章必须包含 `title`、`description`、`slug`、`pubDate`、`category`、`tags`、`difficulty`；其余字段按 `src/content.config.ts` 填写。`slug` 使用稳定的小写 ASCII 路径，避免因中文 URL 重命名造成外部链接失效。

`pubDate` 是首次发布，`updatedDate` 是正文修改，`lastVerified` 是命令、界面或环境最近一次实际复核日期。三者不要混用。`draft: true` 的文章不会进入生产页面、RSS 或 Pagefind。

## 分类、标签与系列

分类只能使用：`vps`、`sub2api`、`network`、`cards`、`ansys`、`linux`、`tools`、`learning`。标签描述工具、对象或方法，避免写成长句。系列只用于有明确顺序的文章，并同时设置 `seriesOrder`；跨主题补充阅读使用 `related` 的 slug。

## 写作与安全

先写适用场景、前置条件、环境和验证方法。命令必须可解释、可回滚，并标明版本假设。涉及金融、网络服务、隐私或服务器的文章要提供风险/免责声明，且不得引导规避身份核验、攻击、欺诈、未授权访问或绕过平台限制。

提交前运行 `npm run format:check && npm run check && npm run build`。新增链接时运行 `npm run test:links`。
