# Ubuntu VPS 部署

## 1. 准备主机

在已加固的 Ubuntu 24.04 VPS 上安装 Docker Engine、Docker Compose Plugin 与宿主机 Nginx。防火墙仅放行 SSH、80 和 443。将仓库克隆到受限管理员可管理的目录，确认没有 `.env`、私钥或供应商凭据被提交。

```bash
git clone <your-repository-url> app
cd app
BUILD_REVISION="$(git rev-parse HEAD)" docker compose build
HOST_PORT=8081 docker compose up -d
curl -fsS http://127.0.0.1:8081/healthz/
```

Compose 的安全默认值仍是仅回环绑定的 `127.0.0.1:8080`。本地生产等价检查与当前共享生产主机显式使用 `HOST_PORT=8081`；不要为了迁就测试而改变 Compose 默认端口，也不要映射到 `0.0.0.0`。

## 2. 配置宿主机 Nginx 与 HTTPS

复制 `deploy/nginx/junhaochou.com.conf` 到 `/etc/nginx/sites-available/junhaochou.com.conf`，并将 Cloudflare Origin CA 证书与私钥分别受限保存为 `/etc/nginx/junhaochou.com/origin.pem` 与 `/etc/nginx/junhaochou.com/origin.key`。建立软链接后使用 `sudo nginx -t` 验证配置，再 `sudo systemctl reload nginx`。Origin CA 私钥仅保留在 VPS，禁止提交到仓库或复制到 GitHub Actions。

## 3. Cloudflare

在 Cloudflare DNS 添加 `junhaochou.com` 和 `www` 的 A/AAAA 记录指向 VPS；SSL/TLS 使用 Full (strict)，确认源站证书有效。启用基础 DDoS 防护与缓存规则，但不要缓存 HTML 太久；静态资源由容器的缓存头控制。不要把 Cloudflare API Token 写进仓库或 GitHub Actions。

缓存响应头只由 Docker Nginx 生成，宿主 Nginx 应保持透明反代。`/_astro/`、`/images/` 与 `/fonts/` 可缓存 30 天，`/pagefind/` 只能短缓存，HTML 使用 `no-cache`，`/admin/` 必须使用 `no-store` 且在 Cloudflare Bypass Cache。完整的响应头矩阵、Cloudflare Dashboard 手工 Cache Rules 和验证命令见 [docs/cache-policy.md](docs/cache-policy.md)。不要通过 Cloudflare API 自动修改生产账号。

## 4. 更新与回滚

更新前执行 `git status`、`git pull --ff-only`、`BUILD_REVISION="$(git rev-parse HEAD)" docker compose build`；启动后检查 `/healthz/` 和首页。自动部署会在构建前把当前运行容器的镜像保存为 `junhaochou-knowledge-blog:rollback`，并把已验证 Git SHA 写入新镜像的 OCI revision label。

正常回滚仍应在 GitHub 创建 `git revert`，让回滚提交重新经过完整 CI。只有站点已经不可用、来不及等待重建时，才临时恢复上一镜像：

```bash
docker image inspect junhaochou-knowledge-blog:rollback
docker image tag junhaochou-knowledge-blog:rollback junhaochou-knowledge-blog:latest
HOST_PORT=8081 docker compose up -d --no-build --force-recreate
curl -fsS http://127.0.0.1:8081/healthz/
```

镜像回滚不会改写 Git 历史，也不会删除卷、镜像或目录；恢复服务后仍须立即提交并发布正式的 Git revert，使源码与运行镜像重新一致。

## 5. 日志与维护

查看容器日志：`docker compose logs --tail=100 junhaochou-blog`；查看代理日志：`sudo journalctl -u nginx -n 100 --no-pager`。每月更新系统和镜像，在更新窗口后复查站点、RSS、搜索与证书续期。

Docker builder cache 维护前先执行 `docker system df`。首次只允许管理员手动运行 `docker builder prune --filter "until=720h"` 并确认提示；禁止 `docker system prune -a`、`docker volume prune` 和 `docker image prune -a`。可选的每周 systemd timer 示例位于 `deploy/systemd/`，安装前必须先阅读 [docs/cache-policy.md](docs/cache-policy.md)，它只能清理 30 天以上 builder cache，不能触碰容器、镜像、卷、Git 或项目内容。

## 6. `/admin/`、OAuth 与 Access

Decap CMS 是随 Astro `dist` 和站点 Nginx 镜像一起发布的静态浏览器管理界面；生产环境没有 Astro 或 Decap 常驻运行时服务。只有 GitHub OAuth 由独立的 Cloudflare Worker 处理：

1. 将站点仓库的默认分支切换为 `main`，并把实际 `owner/repository` 写入 `public/admin/config.yml` 的 `backend.repo`。
2. 创建 GitHub OAuth App，并将回调地址设为 `https://YOUR_OAUTH_WORKER.YOUR_SUBDOMAIN.workers.dev/callback`。
3. 在 `deploy/cloudflare-oauth/` 中部署 Worker。设置 Worker secrets `GITHUB_CLIENT_ID` 与 `GITHUB_CLIENT_SECRET`，再以实际 Worker origin 替换 Decap 配置中的 `base_url` 占位符。详细步骤见 [deploy/cloudflare-oauth/README.md](deploy/cloudflare-oauth/README.md)。
4. 在 Cloudflare Zero Trust 中为 `junhaochou.com/admin/*` 创建 Self-hosted Access 应用，仅允许管理员邮箱或受批准的身份提供商组。具体步骤见 [docs/cloudflare-access.md](docs/cloudflare-access.md)。

OAuth Worker 发生故障时，CMS 登录会不可用，但首页、文章、RSS、搜索和 sitemap 仍由静态站点正常提供。

## 7. GitHub Actions 自动部署

现有 CI 会按失败成本由低到高执行：锁定依赖安装、生产依赖审计、格式、lint、无密钥扫描、Astro 与内容契约、静态构建与 Pagefind、链接、构建产物契约、Playwright、节流移动端 Web Vitals、Compose 配置，最后在 `HOST_PORT=8081` 构建并启动真实生产 Nginx 镜像。容器 smoke 会验证 `/healthz/`、`/admin/` 本地 bundle 与 noindex、缓存矩阵、robots 和安全响应头；退出时只清理当前 GitHub Runner 上的临时容器和网络。只有推送到 `main` 且 `verify` 成功时，`deploy` job 才会执行。部署任务按 `production-deploy` 串行化，不会并发覆盖同一 VPS。

在仓库 Settings -> Secrets and variables -> Actions 配置以下 GitHub Actions secrets，只填写真实值，不提交到仓库：

- `VPS_HOST`
- `VPS_HOST_PORT`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_PROJECT_DIR`
- `VPS_KNOWN_HOSTS`

`VPS_PROJECT_DIR` 使用 `/opt/junhaochou-blog/app`。`VPS_HOST_PORT` 用于传入仅绑定回环的容器端口；共享生产主机使用 `8081`，避免与现有服务冲突。部署程序会严格校验主机密钥，拒绝有本地未提交修改的工作树，只快进到触发并通过本次 CI 的精确 Git SHA，而不是部署运行期间出现的更新提交。随后它保留回滚镜像、重建 Compose、等待容器健康并检查本机 `/healthz/`；任一步失败都会使任务失败，不会自动删除容器、卷、镜像或目录。

部署 job 还会核对运行镜像的 OCI revision label 与触发 SHA、回环端口，并检查源站的首页、研究、项目、文章、搜索、RSS、健康页和后台静态路由。随后从公网复查这些公开入口，并要求未经授权的 `/admin/` 返回 Cloudflare Access 重定向；公网冒烟失败会恢复预先保留的稳定镜像。

若仓库是私有仓库，为 VPS 专门生成只读 Deploy Key，并将公钥添加到仓库的 Deploy keys。将对应私钥仅保存在 VPS 部署用户的受限 `~/.ssh` 目录，确认该用户能执行 `git fetch origin main` 后，再启用自动部署。不要复用个人 SSH 私钥或把 Deploy Key 放入 GitHub Actions secrets。

## 8. 自动部署故障排查

- `Configure SSH` 失败：重新生成 `VPS_KNOWN_HOSTS`，确认端口、用户和私钥属于同一 VPS 账户；不要关闭严格主机密钥验证。
- Git 更新失败：在 VPS 上检查仓库是否位于 `main`、工作树是否干净，以及私有仓库 Deploy Key 是否有读取权限。
- Docker 构建失败：先在 VPS 项目目录执行 `docker compose config` 和 `docker compose build`，保留失败日志后修复源码或 Docker 配置。
- 健康检查失败：检查 `docker compose ps`、`docker compose logs --tail=100 junhaochou-blog`，并复测 `curl -fsS http://127.0.0.1:8081/healthz/`。确认容器健康后再继续排查宿主机 Nginx 和 Cloudflare。
