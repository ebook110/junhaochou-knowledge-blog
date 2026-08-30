# Notes: 网站运营工作流

## Confirmed Context

- 网站是 Astro 静态站点，文章与图片均保存在 Git 仓库中。
- 在线编辑入口是 `https://junhaochou.com/admin/`，由 Cloudflare Access 与 GitHub OAuth 双层认证保护。
- CMS 使用 Editorial Workflow：Draft、In Review、Ready、Publish，并通过分支和 Pull Request 保存变更。
- Pull Request 和 `main` 推送会运行格式、lint、Astro check、构建、链接、Playwright 与 Docker Compose 校验。
- 验证通过且变更进入 `main` 后，GitHub Actions 通过 SSH 在 VPS 快进更新、重建容器并执行 `/healthz/` 检查。
- 生产站点、健康检查和 RSS 在 2026-08-08 返回 HTTP 200；未授权 `/admin/` 返回 Cloudflare Access 302 登录跳转，符合预期。

## Content Rules

- 文章目录：`src/content/articles/`。
- 封面目录：`public/images/covers/`，仅 WebP，必须使用新文件名并填写中文 alt。
- `slug` 使用稳定的小写 ASCII；摘要为 20–220 字符；分类限现有八类。
- 普通下线优先设置 `draft: true`，不要直接删除文章。

## Maintenance Risks

- 当前线上 `/pagefind/pagefind.js` 在 2026-08-08 仍返回 `Cache-Control: max-age=14400`，即浏览器缓存 4 小时；应在 Cloudflare 手工建立 10 分钟 Pagefind Cache Rule。
- VPS 清理只允许先看 `docker system df`，必要时人工确认执行 `docker builder prune --filter "until=720h"`。
- 禁止把任何密钥、令牌、服务器地址或真实 `.env` 提交到 Git。
