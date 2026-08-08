# Ubuntu VPS 部署

## 1. 准备主机

在已加固的 Ubuntu 24.04 VPS 上安装 Docker Engine、Docker Compose Plugin 与宿主机 Nginx。防火墙仅放行 SSH、80 和 443。将仓库克隆到受限管理员可管理的目录，确认没有 `.env`、私钥或供应商凭据被提交。

```bash
git clone <your-repository-url> app
cd app
docker compose build
HOST_PORT=8081 docker compose up -d
curl -fsS http://127.0.0.1:8081/healthz/
```

## 2. 配置宿主机 Nginx 与 HTTPS

复制 `deploy/nginx/junhaochou.com.conf` 到 `/etc/nginx/sites-available/junhaochou.com.conf`，并将 Cloudflare Origin CA 证书与私钥分别受限保存为 `/etc/nginx/junhaochou.com/origin.pem` 与 `/etc/nginx/junhaochou.com/origin.key`。建立软链接后使用 `sudo nginx -t` 验证配置，再 `sudo systemctl reload nginx`。Origin CA 私钥仅保留在 VPS，禁止提交到仓库或复制到 GitHub Actions。

## 3. Cloudflare

在 Cloudflare DNS 添加 `junhaochou.com` 和 `www` 的 A/AAAA 记录指向 VPS；SSL/TLS 使用 Full (strict)，确认源站证书有效。启用基础 DDoS 防护与缓存规则，但不要缓存 HTML 太久；静态资源由容器的缓存头控制。不要把 Cloudflare API Token 写进仓库或 GitHub Actions。

缓存响应头只由 Docker Nginx 生成，宿主 Nginx 应保持透明反代。`/_astro/`、`/images/` 与 `/fonts/` 可缓存 30 天，`/pagefind/` 只能短缓存，HTML 使用 `no-cache`，`/admin/` 必须使用 `no-store` 且在 Cloudflare Bypass Cache。完整的响应头矩阵、Cloudflare Dashboard 手工 Cache Rules 和验证命令见 [docs/cache-policy.md](docs/cache-policy.md)。不要通过 Cloudflare API 自动修改生产账号。

## 4. 更新与回滚

更新前执行 `git status`、`git pull --ff-only`、`docker compose build`；启动后检查 `/healthz/` 和首页。保留上一个镜像标签：若出现问题，将 Git 工作树回到上一个已验证提交（使用非破坏性的分支或 `git revert`），重新构建并 `docker compose up -d`。不要通过删除卷或执行批量删除来处理构建异常。

## 5. 日志与维护

查看容器日志：`docker compose logs --tail=100 junhaochou-blog`；查看代理日志：`sudo journalctl -u nginx -n 100 --no-pager`。每月更新系统和镜像，在更新窗口后复查站点、RSS、搜索与证书续期。

Docker builder cache 维护前先执行 `docker system df`。首次只允许管理员手动运行 `docker builder prune --filter "until=720h"` 并确认提示；禁止 `docker system prune -a`、`docker volume prune` 和 `docker image prune -a`。可选的每周 systemd timer 示例位于 `deploy/systemd/`，安装前必须先阅读 [docs/cache-policy.md](docs/cache-policy.md)，它只能清理 30 天以上 builder cache，不能触碰容器、镜像、卷、Git 或项目内容。

## 6. `/admin/`、OAuth 与 Access

Decap CMS 是静态的浏览器管理界面，不运行在 Astro 容器中。它通过独立的 Cloudflare Worker 完成 GitHub OAuth：

1. 将站点仓库的默认分支切换为 `main`，并把实际 `owner/repository` 写入 `public/admin/config.yml` 的 `backend.repo`。
2. 创建 GitHub OAuth App，并将回调地址设为 `https://YOUR_OAUTH_WORKER.YOUR_SUBDOMAIN.workers.dev/callback`。
3. 在 `deploy/cloudflare-oauth/` 中部署 Worker。设置 Worker secrets `GITHUB_CLIENT_ID` 与 `GITHUB_CLIENT_SECRET`，再以实际 Worker origin 替换 Decap 配置中的 `base_url` 占位符。详细步骤见 [deploy/cloudflare-oauth/README.md](deploy/cloudflare-oauth/README.md)。
4. 在 Cloudflare Zero Trust 中为 `junhaochou.com/admin/*` 创建 Self-hosted Access 应用，仅允许管理员邮箱或受批准的身份提供商组。具体步骤见 [docs/cloudflare-access.md](docs/cloudflare-access.md)。

OAuth Worker 发生故障时，CMS 登录会不可用，但首页、文章、RSS、搜索和 sitemap 仍由静态站点正常提供。

## 7. GitHub Actions 自动部署

现有 CI 会在 Pull Request 和 `main`/`master` 推送时执行格式化、lint、Astro 校验、构建与 Pagefind、链接检查、Playwright 和 Docker Compose 配置检查。只有推送到 `main` 且 `verify` 成功时，`deploy` job 才会执行。部署任务按 `production-deploy` 串行化，不会并发覆盖同一 VPS。

在仓库 Settings -> Secrets and variables -> Actions 配置以下 GitHub Actions secrets，只填写真实值，不提交到仓库：

- `VPS_HOST`
- `VPS_HOST_PORT`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_PROJECT_DIR`
- `VPS_KNOWN_HOSTS`

`VPS_PROJECT_DIR` 使用 `/opt/junhaochou-blog/app`。`VPS_HOST_PORT` 用于传入仅绑定回环的容器端口；共享生产主机使用 `8081`，避免与现有服务冲突。部署程序会严格校验主机密钥，拒绝有本地未提交修改的工作树，随后执行 `git fetch origin main`、`git merge --ff-only origin/main`、Docker Compose 重建和本机 `/healthz/` 检查；任一步失败都会使任务失败，不会自动删除容器、卷、镜像或目录。

若仓库是私有仓库，为 VPS 专门生成只读 Deploy Key，并将公钥添加到仓库的 Deploy keys。将对应私钥仅保存在 VPS 部署用户的受限 `~/.ssh` 目录，确认该用户能执行 `git fetch origin main` 后，再启用自动部署。不要复用个人 SSH 私钥或把 Deploy Key 放入 GitHub Actions secrets。

## 8. 自动部署故障排查

- `Configure SSH` 失败：重新生成 `VPS_KNOWN_HOSTS`，确认端口、用户和私钥属于同一 VPS 账户；不要关闭严格主机密钥验证。
- Git 更新失败：在 VPS 上检查仓库是否位于 `main`、工作树是否干净，以及私有仓库 Deploy Key 是否有读取权限。
- Docker 构建失败：先在 VPS 项目目录执行 `docker compose config` 和 `docker compose build`，保留失败日志后修复源码或 Docker 配置。
- 健康检查失败：检查 `docker compose ps`、`docker compose logs --tail=100 junhaochou-blog`，并复测 `curl -fsS http://127.0.0.1:8081/healthz/`。确认容器健康后再继续排查宿主机 Nginx 和 Cloudflare。
