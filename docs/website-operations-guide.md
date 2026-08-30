# JunhaoChou 网站使用、编辑、发布与维护手册

> 适用站点：[https://junhaochou.com/](https://junhaochou.com/)
>
> 在线管理后台：[https://junhaochou.com/admin/](https://junhaochou.com/admin/)
>
> 文档最后核对：2026-08-30

## 1. 先理解网站的工作方式

这个网站不是 WordPress，也没有数据库。它是一套 **Astro 静态网站 + GitHub 内容仓库 + Decap CMS 在线编辑器 + GitHub Actions 自动部署 + VPS Docker/Nginx + Cloudflare** 的系统。

内容发布链路是：

```text
在线 CMS 或本地编辑 Markdown
        ↓
GitHub 分支 / Pull Request
        ↓
GitHub Actions 自动检查
        ↓
合并到 main
        ↓
VPS 自动拉取、构建 Docker、健康检查
        ↓
Cloudflare 对外提供 junhaochou.com
```

文章和封面始终保存在 Git 仓库中，所以 Git 是唯一内容事实来源。CMS 只是一个更方便的浏览器编辑界面。

## 2. 平时如何浏览和使用网站

普通访客直接打开首页，可以使用：

- 研究与项目：了解公开的研究问题、方法链、工程记录和披露边界。
- 文章中心：按四个展示领域浏览全部技术文章。
- 分类、标签和系列：按主题组织内容。
- 搜索：使用 Pagefind 搜索已发布的文章、研究和项目详情。
- RSS：订阅 `/rss.xml` 获取更新。
- 深色模式、移动端目录和文章阅读进度等前端功能。

只有站长需要访问 `/admin/`。后台不应公开给普通访客，也不要把管理后台地址当成公开投稿入口。

## 3. 在线编辑：日常发文章的推荐方式

### 3.1 登录后台

1. 打开 [https://junhaochou.com/admin/](https://junhaochou.com/admin/)。
2. Cloudflare Access 会要求验证获授权邮箱；按页面提示接收一次性验证码。
3. 通过 Access 后，再使用具有仓库写权限的 GitHub 账号授权 Decap CMS。
4. 登录后进入 **文章**、**研究方向** 或 **项目** 集合。

如果 Cloudflare 邮箱验证成功但 GitHub 登录失败，通常是 GitHub OAuth、仓库权限或 OAuth Worker 配置问题，不要反复创建个人访问令牌。

### 3.2 新建文章

点击 **新建文章**，按以下规则填写：

- **标题**：至少 8 个字符，清楚描述问题或成果。
- **摘要**：20–220 个字符，用于列表页和 SEO。
- **URL Slug**：稳定的小写 ASCII，例如 `lammps-tensile-workflow`；发布后尽量不改。
- **发布日期**：首次发布日。
- **更新日期**：正文发生实质修改时填写。
- **分类**：只能选择后台已有的八个分类。

> 当前分类中还没有独立的“材料计算 / 分子动力学”分类。准备集中发布 LAMMPS、难熔高熵合金和机器学习论文内容前，应同时修改 Astro schema、站点分类数据与 CMS 配置，正式新增分类；不要只在 CMS 中临时填写一个未定义值。

- **标签**：填写工具、对象或方法，例如 `LAMMPS`、`VPS`、`Python`。
- **难度**：入门、进阶或高级。
- **前置条件/适用环境**：写清版本、系统和读者准备条件。
- **封面**：上传 WebP，填写包含中文的替代文本；新封面使用新文件名。
- **草稿**：初次编辑建议保持开启。
- **最后验证日期**：教程命令或界面被实际复核的日期。
- **正文**：使用 Markdown/MDX 源码编写。

正文可使用标题、列表、引用、代码块、链接、表格、KaTeX 和项目支持的 MDX 组件。后台提供 Markdown 近似预览；复杂 Mermaid、KaTeX 或自定义 MDX 组件建议在本地复核，因为生产构建才是最终页面依据。

### 3.3 保存与发布

推荐状态流转：

1. **Draft**：写作和补充材料。
2. **In Review**：检查结构、图片、命令和风险提示。
3. **Ready**：内容已准备发布，等待 CI 结果。
4. **Publish**：将 CMS 创建的 Pull Request 合并到 `main`。

发布后 GitHub Actions 会自动执行检查和部署。不要连续重复点击发布；先到 GitHub 仓库的 **Actions** 页面查看运行状态。

### 3.4 修改、下线和删除

- 修改文章：打开原文章编辑，更新 `updatedDate`；技术内容重新验证后更新 `lastVerified`。
- 临时或长期下线：优先将 **草稿** 设置为 `true`。文章会从页面、搜索、RSS 和 sitemap 中移除，但 Git 历史仍保留。
- 永久删除：只有确认文件不再需要时才使用 Delete。删除同样必须经过 Pull Request、CI 和发布流程。

## 4. 本地编辑：复杂文章和网站改版

### 4.1 首次准备

在 Windows PowerShell 中进入项目目录：

```powershell
cd "C:\Users\Tom bill\Documents\ChatGPT\我的个人网站"
npm.cmd install
npm.cmd run dev
```

浏览器打开 Astro 显示的本地地址，通常是 `http://localhost:4321/`。

### 4.2 编辑内容

- 文章：`src/content/articles/*.mdx`
- 研究：`src/content/research/*.mdx`
- 项目：`src/content/projects/*.mdx`
- 封面：`public/images/covers/*.webp`
- 内容字段规则：`src/content.config.ts`
- 网站公开信息：`src/data/site.ts`

开始前先同步远程：

```powershell
git status
git pull --ff-only
```

建议为每次文章或改版建立分支：

```powershell
git switch -c content/lammps-tensile-workflow
```

不要在 Git 中保存 `.env`、密码、SSH 私钥、Cloudflare Token、GitHub Token、OAuth secret 或真实服务器地址。

### 4.3 发布前检查

```powershell
npm.cmd run format
npm.cmd run lint
npm.cmd run check
npm.cmd run test
```

`npm.cmd run test` 会校验内容契约与无密钥规则、构建站点、生成 Pagefind 搜索索引、检查内部链接和分发产物，并运行 Playwright。任何一步失败都应修复根因，不要删除或跳过检查。

检查通过后：

```powershell
git add src/content public/images/covers
git commit -m "docs(article): add lammps tensile workflow"
git push -u origin content/lammps-tensile-workflow
```

然后在 GitHub 创建 Pull Request，等待 CI 通过，再合并到 `main`。合并后会自动部署到 VPS。

## 5. 上传到网站实际发生了什么

你不需要手工通过 FTP 把 HTML 上传到服务器。正常流程是：

1. CMS 发布或 Git 推送产生提交。
2. GitHub Actions 对 Pull Request 和 `main` 运行完整检查。
3. 只有 `main` 验证通过，部署任务才通过 SSH 连接 VPS。
4. VPS 对仓库执行快进更新，重新构建 Docker 镜像并启动容器。
5. 自动检查 `http://127.0.0.1:8081/healthz/`。
6. Cloudflare、宿主机 Nginx 和 Docker Nginx继续对外提供网站。

GitHub Actions 是当前的正式上线入口；不要同时在 VPS 手工改文章，否则部署脚本检测到服务器工作树不干净时会拒绝覆盖。

## 6. 每次发布后的检查清单

发布完成后依次检查：

- GitHub Actions 的 `verify` 和 `deploy` 都是绿色成功状态。
- Actions 显示的部署 Git SHA 与本次合并提交一致，运行镜像 revision 检查通过。
- 首页、研究、项目、文章与搜索入口能够打开，新内容出现在正确列表中。
- 文章标题、目录、代码块、图片、数学公式和移动端布局正常。
- 搜索能找到文章；Pagefind 正常情况下应在约 10 分钟内刷新。
- `/rss.xml` 能访问并包含新文章。
- `/healthz/` 返回 HTTP 200。
- 未登录访问 `/admin/` 会跳转到 Cloudflare Access，而不是直接暴露后台。
- 浏览器无明显控制台错误，外链和下载链接可用。

上次公开核对（2026-08-08）时，线上 Pagefind 响应仍显示 4 小时浏览器缓存，而目标策略是 10 分钟。每次发布后都应重新实测；如果仍为 4 小时，应在 Cloudflare Dashboard 手工添加 `Pagefind ten minutes` 规则，并确保它排在可能命中 `/pagefind/` 的通用规则之前。

## 7. 后续维护周期

### 每次发文

- 检查文章字段、封面 alt、发布日期、风险提示和外链。
- 发布后检查 Actions、页面、搜索、RSS 和移动端。
- 不覆盖同名封面；使用新文件名避免 30 天图片缓存。

### 每周或每两周

- 查看 GitHub Actions 是否有失败记录。
- 查看站点关键入口和 `/healthz/`。
- 更新过时文章的 `lastVerified`，修复失效外链。
- 审核 CMS 中长期停留的 Draft 或 In Review。

### 每月

在 VPS 维护窗口中：

```bash
sudo apt update
sudo apt upgrade
cd /opt/junhaochou-blog/app
docker compose ps
docker compose logs --tail=100 junhaochou-blog
sudo journalctl -u nginx -n 100 --no-pager
docker system df
curl -fsS http://127.0.0.1:8081/healthz/
```

系统升级后再次检查公网首页、文章、搜索、RSS 和 HTTPS。首次清理 Docker builder cache 时只允许人工确认执行：

```bash
docker builder prune --filter "until=720h"
```

禁止使用 `docker system prune -a`、`docker volume prune`、`docker image prune -a`，也不要批量删除容器、镜像、卷、Git 数据、文章、图片或项目目录。

### 每季度

- 在单独分支运行 `npm.cmd outdated`，评估 Astro、TypeScript、Playwright、Pagefind 等依赖升级。
- 升级后运行完整检查，不要在生产服务器直接试验依赖更新。
- 复核 GitHub 仓库管理员、Deploy Key、Actions secrets、GitHub OAuth App 和 Cloudflare Access 允许名单。
- 检查 Cloudflare Origin CA 证书有效期、DNS、SSL/TLS `Full (strict)` 和缓存规则。
- 确认至少有一个可用的本地仓库副本；单独备份 VPS Nginx 配置和运维记录，但不要把证书私钥或 secrets 放进 Git。

## 8. 常见故障处理

### CMS 打不开

- 未授权时 `/admin/` 跳到 Cloudflare Access 登录页是正常现象。
- 检查使用的邮箱是否仍在 Access Allow 策略中。
- 检查 GitHub 账号是否有仓库写权限。
- 检查 OAuth Worker 和 GitHub OAuth callback 是否可用。

### 发布后网站没变化

1. 查看 GitHub Actions 是 `verify` 失败还是 `deploy` 失败。
2. 检查 Pull Request 是否真正合并到 `main`。
3. 检查文章是否仍为 `draft: true`。
4. 普通 HTML 应重新验证；图片若沿用旧文件名可能仍被缓存。
5. 搜索索引受 Pagefind 缓存影响，等待目标 10 分钟后重试；若本次响应头实测仍为旧规则，可能需要最多约 4 小时。

### VPS 部署失败

```bash
cd /opt/junhaochou-blog/app
git status
docker compose config
docker compose ps
docker compose logs --tail=100 junhaochou-blog
curl -fsS http://127.0.0.1:8081/healthz/
sudo nginx -t
sudo journalctl -u nginx -n 100 --no-pager
```

不要在原因不明时删除容器、镜像或目录。先保存日志并确认是 Git、构建、容器、Nginx 还是 Cloudflare 层的问题。

## 9. 安全回滚

如果刚发布的提交有问题，首选在 GitHub 对该提交执行 `git revert`，让修复提交重新经过 CI 和自动部署。不要在生产环境执行破坏性重置，也不要删除 Git 历史。

回滚后重新确认：

- GitHub Actions 成功。
- VPS 容器健康。
- 首页、问题页面、RSS 和搜索恢复。
- 相关缓存已按精确 URL 处理，而不是整站无差别清理。

## 10. 最简日常流程

如果只是发布一篇普通文章，记住下面六步即可：

1. 打开 `/admin/` 并登录。
2. 新建文章，先保存为 Draft。
3. 上传新的 WebP 封面并填写中文 alt。
4. 检查正文，推进到 Ready。
5. CI 通过后 Publish。
6. 检查 Actions、文章页面、搜索、RSS 和 `/healthz/`。
