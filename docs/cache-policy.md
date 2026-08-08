# Cache Policy

## 责任边界

生产请求路径为 Cloudflare -> 宿主 Nginx -> Docker Nginx。缓存响应头由 `nginx/default.conf` 中的 Docker Nginx 统一发出；宿主 Nginx 只做 TLS 终止和反向代理，刻意不重写 `Cache-Control`，避免两层产生冲突策略。

Cloudflare 的 **Browser TTL** 告诉访问者浏览器可保留响应多久；**Edge TTL** 告诉 Cloudflare 边缘节点可保留响应多久。两者互不替代。下表的浏览器策略由源站响应头实现，Cloudflare Edge TTL 需要在控制台手工创建规则。

## Cache-Control 矩阵

| 路径                              | 浏览器响应头                                   | Cloudflare Edge 策略 | 说明                                             |
| --------------------------------- | ---------------------------------------------- | -------------------- | ------------------------------------------------ |
| `/_astro/*`                       | `max-age=2592000`                              | 1 month              | 已构建并带内容哈希的 Astro 静态资源。            |
| `/images/*`                       | `max-age=2592000`                              | 1 month              | 图片使用新文件名发布，不能同名覆盖。             |
| `/fonts/*`                        | `max-age=2592000`                              | 1 month              | 本地字体资源。                                   |
| `/pagefind/*`                     | `max-age=600`                                  | 不设置 30 天规则     | Pagefind 索引最多短缓存约 10 分钟。              |
| `/admin/*`                        | `private, no-store, no-cache, must-revalidate` | Bypass Cache         | 后台、CMS 配置和登录后的界面不得长期保存。       |
| HTML 页面（含 `/`、`/articles/`） | `no-cache`                                     | 不设置 30 天规则     | 浏览器每次使用前重新验证，文章发布后可及时更新。 |

`no-cache` 不表示禁止存储，而是要求再次使用前验证；`no-store` 则禁止浏览器和中间缓存保存响应。后台同时使用两者。

## Cloudflare 手工 Cache Rules

不要通过 API、Wrangler 或 GitHub Actions 修改 Cloudflare 缓存设置。在 Cloudflare Dashboard 的 **Caching -> Cache Rules** 手工创建以下规则，并把后台规则放在静态资源规则之前。

### Rule 1: Admin bypass

- 名称：`Admin bypass cache`
- 条件：`http.request.uri.path starts_with "/admin/"`
- Cache eligibility：**Bypass cache**

### Rule 2: Versioned static assets

- 名称：`Static assets one month`
- 条件：路径以 `/_astro/`、`/images/` 或 `/fonts/` 开头
- Edge TTL：**1 month**
- Browser TTL：**1 month**

不要把 `/pagefind/`、HTML 页面、RSS、sitemap、robots 或 `/admin/` 加入 Rule 2。发布新封面或手工替换的图片时使用新文件名；若必须替换既有文件，应由管理员在 Cloudflare 控制台对该精确 URL 做手工 purge，而不是扩大整站缓存。

### Rule 3: Pagefind short cache

- 名称：`Pagefind ten minutes`
- 条件：`http.request.uri.path starts_with "/pagefind/"`
- Browser TTL：**10 minutes**
- Edge TTL：**10 minutes**

如果账号中存在全站 Browser TTL 或 Cache Rule，这条规则必须置于会匹配 `/pagefind/` 的通用规则之前。它覆盖 Pagefind 的 30 天或数小时缓存，确保新文章的搜索索引在短时间内刷新。

## 验证

部署后从已完成 Cloudflare Access 的会话检查后台；未授权 `curl -I /admin/` 返回 Access 登录重定向是预期行为。其他路径可用：

```bash
curl -I https://junhaochou.com/
curl -I https://junhaochou.com/articles/
curl -I https://junhaochou.com/_astro/ACTUAL_ASSET.css
curl -I https://junhaochou.com/images/covers/ACTUAL_IMAGE.webp
curl -I https://junhaochou.com/pagefind/pagefind.js
curl -I https://junhaochou.com/admin/
```

期望分别看到 HTML 的 `no-cache`、静态资源的 30 天、Pagefind 的约 600 秒，以及后台的 `private, no-store, no-cache, must-revalidate`（Access 会话内）。

## Docker builder cache 维护

VPS 磁盘有限时，先检查占用：

```bash
docker system df
```

首次清理必须由管理员手工确认提示，不添加 `--force`：

```bash
docker builder prune --filter "until=720h"
```

该命令只目标为 30 天以上的 Docker builder cache。禁止使用 `docker system prune -a`、`docker volume prune`、`docker image prune -a`，也不要删除容器、镜像、卷、Git 数据、`src/content`、`public/images` 或项目目录。

确认手工流程符合预期后，管理员可选择安装 `deploy/systemd/junhaochou-builder-cache.service.example` 与 `deploy/systemd/junhaochou-builder-cache.timer.example`。该 timer 每周运行一次，只执行 `docker system df` 和超过 30 天的 `docker builder prune --force`；它不是默认安装项。
