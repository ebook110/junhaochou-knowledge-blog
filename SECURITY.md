# 安全说明

## 秘密与配置

仓库不保存 API Key、密码、Cloudflare Token、GitHub Token、服务器地址、私钥或真实生产 `.env`。只提交 `.env.example` 中的变量名。部署主机上的 `.env` 应设置为仅管理员可读，例如 `chmod 600 .env`。

Giscus 与统计脚本可选启用；未配置时页面不加载相应第三方脚本。使用第三方分析、评论或托管服务前，应评估其隐私政策和数据处理边界。

## 服务器基线

仅通过 SSH 密钥访问服务器，关闭不必要的入站端口，Docker 站点端口只映射到 `127.0.0.1:8080`。宿主机 Nginx 负责 TLS，应用容器不保存源代码、`node_modules` 或可写数据。升级前记录镜像标签，保留上一版镜像和已验证配置以便回滚。

优先使用独立的部署用户和 SSH 密钥，不使用密码认证或个人日常私钥。GitHub 仅保存部署所需的 Actions secrets；VPS 访问私有仓库时使用最小权限、只读的 Deploy Key。为 GitHub 管理员账号开启双因素认证，并定期复核仓库写入权限和 Deploy Key。

## `/admin/` 与 GitHub OAuth

`/admin/` 不是公开内容入口。上线前应使用 Cloudflare Zero Trust Access 为 `junhaochou.com/admin/*` 配置 Allow 策略，仅允许管理员邮箱或审批过的身份提供商组访问。Access 是 GitHub OAuth 之前的一层防护，不能替代 GitHub 账号本身的权限控制。

Decap CMS 使用 GitHub OAuth 的 `repo` scope 写入文章分支和图片，因此授权账号必须最小化：仅为需要发布的仓库授予写权限，不将个人访问令牌填入 Decap 配置。OAuth client secret 只通过 Cloudflare Worker secret 保存；GitHub Actions 仅使用 VPS secrets；两者都不写入 Git、日志、截图或文档示例。若怀疑泄露，立即在对应平台撤销或轮换 secret，并检查 GitHub 审计记录与近期 Pull Request。

Worker 回调会校验短时效、签名 state，并只向配置的站点 origin 发送授权结果。它不存储文章、数据库记录或用户资料；Worker 不可用时只会影响 CMS 登录，不影响公开静态站点。

## 内容边界

金融、网络、节点和 VPS 内容仅用于合法使用、风险教育、产品比较、正常部署和故障排查。发现存在安全影响的文章应在修订前标记风险，必要时移除可被滥用的细节并记录更改原因。
