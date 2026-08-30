# 内容维护指南

## 文件与元数据

在 `src/content/articles/` 新建 `.md` 或 `.mdx` 文件。每篇文章必须包含 `title`、`description`、`slug`、`pubDate`、`category`、`tags`、`difficulty` 和带中文替代文本的 `cover`；其余字段按 `src/content.config.ts` 填写。`slug` 使用稳定的小写 ASCII 路径，避免因中文 URL 重命名造成外部链接失效。

`pubDate` 是首次发布，`updatedDate` 是正文修改，`lastVerified` 是命令、界面或环境最近一次实际复核日期。三者不要混用。`draft: true` 的文章不会进入生产页面、RSS 或 Pagefind。

## 研究与项目集合

研究方向位于 `src/content/research/`，项目位于 `src/content/projects/`。两者都必须填写 `title`、`slug`、`summary`、`domain`、`status`、`methods`、`tools`、`tags`、`order`、`disclosure` 和 `updatedDate`：

- 研究还必须填写 `questions`，`status` 只能使用 `active` 或 `documented`。
- 项目还必须填写 `role`，`status` 只能使用 `active`、`maintained` 或 `completed`。
- `featured` 和 `draft` 默认都是 `false`，只有需要精选或隐藏内容时才显式填写。
- `disclosure` 只说明公开范围，不写入未公开实验结果、原始数据、凭据或敏感地址。
- 研究可通过 `relatedProjects`、`relatedArticles` 关联项目和文章；项目可通过 `relatedResearch`、`relatedArticles` 建立反向关系。所有值都必须是现有目标的稳定 slug。
- 通用 `links` 以及项目专属的 `repository`、`demo` 都是可选字段，只填写已公开、可长期访问的仓库、演示、论文或资料页面。
- `draft: true` 的研究或项目不会生成公开详情页，也不会进入 Pagefind。

站点名称、主导航、八个原分类和四个展示领域统一维护在 `src/data/site.ts`。不要只改 Content schema 或 CMS 选项；`npm.cmd run check` 会先执行 Astro schema/type 检查，再执行内容契约检查，覆盖 Decap、slug、系列、关联目标、封面和领域映射漂移。

## 分类、标签与系列

分类只能使用：`vps`、`sub2api`、`network`、`cards`、`ansys`、`linux`、`tools`、`learning`。标签描述工具、对象或方法，避免写成长句。系列只用于有明确顺序的文章，并同时设置 `seriesOrder`；跨主题补充阅读使用 `related` 的 slug。

## 写作与安全

先写适用场景、前置条件、环境和验证方法。命令必须可解释、可回滚，并标明版本假设。涉及金融、网络服务、隐私或服务器的文章要提供风险/免责声明，且不得引导规避身份核验、攻击、欺诈、未授权访问或绕过平台限制。

Windows PowerShell 提交前运行 `npm.cmd run format:check`、`npm.cmd run check` 和 `npm.cmd run build`。新增链接时运行 `npm.cmd run test:links`；发布前运行完整的 `npm.cmd test`。
