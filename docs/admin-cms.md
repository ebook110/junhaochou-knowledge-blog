# Decap CMS 内容管理

公开站点仍是 Astro 静态构建。Decap CMS 只是浏览器中的 Git 编辑界面：文章、研究和项目最终仍分别存放在 `src/content/articles/`、`src/content/research/` 与 `src/content/projects/`，封面存放在 `public/images/covers/`，Git 是唯一内容事实来源。

## 访问与 Editorial Workflow

1. 通过 Cloudflare Access 访问 `https://junhaochou.com/admin/`。
2. 使用获授权的 GitHub 账号登录。
3. 在 **文章**、**研究方向** 或 **项目** 集合中创建或编辑 MDX 内容。
4. 使用 Decap Editorial Workflow 将内容依次推进：Draft、In Review、Ready、Publish。
5. Decap 为变更创建 Git 草稿分支和 Pull Request；`squash_merges: true` 让已发布的 CMS 变更以可读的单个提交进入 `main`。
6. Pull Request 的 CI 必须通过。变更进入 `main` 后，GitHub Actions 才会部署生产站点。

## CRUD 行为

- **Create**：在对应集合创建 MDX。`create: true` 保持启用，文件夹和扩展名不变。
- **Read**：使用集合顶部的搜索框按文章标识字段 `title` 查找条目；列表显示标题、分类、草稿状态和发布日期，可按标题、分类、草稿、精选、发布日期、更新日期和最后验证日期排序，并可筛选草稿、已发布和首页精选内容。
- **Update**：编辑现有条目后继续走 Editorial Workflow。不要为适配后台修改 Astro Content Collections schema。
- **Delete**：集合保留 `delete: true`。删除会形成 Git 可追踪的变更，必须经过相同的分支、Pull Request、CI 和 `main` 发布流程。

普通下线优先将 `draft` 设置为 `true`。Astro 会将草稿排除在公开页面、RSS、sitemap 和 Pagefind 之外，同时保留文章的 Git 历史。只有确认不再需要文章文件时才使用 **Delete**；本站没有自动删除文章的机制。

## 内容规则

- URL slug 保持小写 ASCII 且稳定；分类只能使用现有八个分类 slug。
- `tags` 保持自由文本列表，`featured` 只用于首页精选，`lastVerified` 用于记录最后人工验证日期。
- 研究与项目使用四个固定展示领域，并通过显式 slug 关联研究、项目和文章；只公开问题、方法、工具链与复现思路。
- 后台提供 Markdown 近似预览，不用富文本编辑器改写 `MermaidDiagram` 等自定义组件；MDX、Mermaid 与 KaTeX 以生产构建结果为准。
- Decap 由项目锁定版本在本地构建，`/admin/` 不应引用 unpkg、jsDelivr 等浮动 CDN。
- 封面上传到 `public/images/covers/`，必须是 WebP 并填写中文 alt。Astro schema 会拒绝其他封面路径和扩展名。
- 不要用相同文件名覆盖已缓存的图片。新图片使用新文件名，旧资源由 Git 历史保留。

## 发布前验证

CMS 生成的 Pull Request 与直接推送一样会运行格式、lint、Astro Content Collections 校验、生产构建与 Pagefind、链接检查、Playwright 和 Docker Compose 配置校验。`main` 的 verify 成功后才允许生产部署。
