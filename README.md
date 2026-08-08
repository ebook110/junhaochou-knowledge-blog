# JunhaoChou Knowledge Blog

一个以材料计算、工程自动化、VPS 运维和可验证技术记录为主题的中文静态知识库。网站使用 Astro 静态输出，文章仅由 Git 管理的 Markdown/MDX 文件驱动。

## 本地运行

Windows PowerShell 请使用 `npm.cmd`，避免本机执行策略阻止 `npm.ps1`：

```powershell
npm.cmd install
npm.cmd run dev
```

生产构建会依次运行 Astro 类型检查、静态构建和 Pagefind 索引：

```powershell
npm.cmd run build
npm.cmd run test
```

## 内容维护

文章位于 `src/content/articles/`，由 `src/content.config.ts` 的 Zod schema 校验。新增文章前阅读 [CONTENT_GUIDE.md](CONTENT_GUIDE.md)。公开配置集中在 `src/data/site.ts`；可选评论与统计变量只放在 `.env.example` 指定的位置。

## Content Workflow

文章仍以 Git 管理的 Markdown/MDX 为唯一事实来源，可任选以下入口：

1. **CLI**：在 `src/content/articles/` 新建或修改 `.mdx`，按 [CONTENT_GUIDE.md](CONTENT_GUIDE.md) 填写前置数据，再运行 `npm.cmd run test`。
2. **Web CMS**：在完成安全配置后访问 `https://junhaochou.com/admin/`，登录 GitHub，新建或修改文章，依次经过 Draft、In Review、Ready、Publish。Decap 会创建 Git 分支和 Pull Request；PR 通过 CI 并合并至 `main` 后，GitHub Actions 才会部署到 VPS。

Web CMS 的字段、图片、草稿与删除规则见 [docs/admin-cms.md](docs/admin-cms.md)。`public/admin/config.yml` 必须始终指向当前 GitHub 仓库和 OAuth Worker；不得将令牌或 OAuth secret 写入该文件。缓存与 Cloudflare 手工规则见 [docs/cache-policy.md](docs/cache-policy.md)。

## 发布

Docker 镜像只包含 Nginx 和构建后的 `dist`。本机检查：

```powershell
docker compose up --build -d
Invoke-WebRequest http://127.0.0.1:8080/healthz/
```

完整 Ubuntu、Nginx、Cloudflare 和回滚步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。安全边界见 [SECURITY.md](SECURITY.md)。
