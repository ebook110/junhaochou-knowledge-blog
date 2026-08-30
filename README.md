# JunhaoChou Knowledge Blog

一个连接材料研究、计算方法与工程实践的中文个人品牌和静态知识库。网站使用 Astro 静态输出，研究、项目与文章均由 Git 管理的 Markdown/MDX 文件驱动。

产品边界与公开原则见 [PRODUCT.md](PRODUCT.md)，视觉令牌、组件和布局规则见 [DESIGN.md](DESIGN.md)。

## 本地运行

Windows PowerShell 请使用 `npm.cmd`，避免本机执行策略阻止 `npm.ps1`：

```powershell
npm.cmd install
npm.cmd run dev
```

生产构建会生成 Astro 静态页面与 Pagefind 索引；完整门禁会额外执行类型、内容、链接、SEO、浏览器与安全检查：

```powershell
npm.cmd run build
npm.cmd run test
```

## 内容维护

文章位于 `src/content/articles/`，研究与项目分别位于 `src/content/research/` 和 `src/content/projects/`，统一由 `src/content.config.ts` 的 Zod schema 校验。新增内容前阅读 [CONTENT_GUIDE.md](CONTENT_GUIDE.md)。站点名称、导航、分类、四个展示领域和公开链接集中在 `src/data/site.ts`；可选评论与统计变量只放在 `.env.example` 指定的位置。

## Content Workflow

文章仍以 Git 管理的 Markdown/MDX 为唯一事实来源，可任选以下入口：

1. **CLI**：在对应 collection 中新建或修改 `.mdx`，按 [CONTENT_GUIDE.md](CONTENT_GUIDE.md) 填写前置数据，再运行 `npm.cmd run test`。
2. **Web CMS**：在完成安全配置后访问 `https://junhaochou.com/admin/`，登录 GitHub，新建或修改文章、研究或项目，依次经过 Draft、In Review、Ready、Publish。Decap 会创建 Git 分支和 Pull Request；PR 通过 CI 并合并至 `main` 后，GitHub Actions 才会部署到 VPS。

Decap 使用锁定版本的本地构建资源，不依赖浮动 CDN。后台提供接近正文的 Markdown 预览，但 MDX、Mermaid 与 KaTeX 的最终效果始终以生产构建为准。

Web CMS 的字段、图片、草稿与删除规则见 [docs/admin-cms.md](docs/admin-cms.md)。`public/admin/config.yml` 必须始终指向当前 GitHub 仓库和 OAuth Worker；不得将令牌或 OAuth secret 写入该文件。缓存与 Cloudflare 手工规则见 [docs/cache-policy.md](docs/cache-policy.md)。

完整的站长日常操作、发布、回滚和维护清单见 [docs/website-operations-guide.md](docs/website-operations-guide.md)。

## 发布

Docker 镜像只包含 Nginx 和构建后的 `dist`。本机检查：

```powershell
$env:HOST_PORT = "8081"
docker compose up --build -d
node scripts/check-container.mjs http://127.0.0.1:8081/
docker compose down
Remove-Item Env:HOST_PORT
```

Compose 未设置 `HOST_PORT` 时仍默认绑定 `127.0.0.1:8080`；本地生产等价 smoke 固定使用 `8081`，避免占用默认端口，并覆盖健康页、后台本地资源、noindex、缓存矩阵和安全响应头。

完整 Ubuntu、Nginx、Cloudflare 和回滚步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。安全边界见 [SECURITY.md](SECURITY.md)。
