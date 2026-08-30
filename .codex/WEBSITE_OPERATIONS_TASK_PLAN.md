# Task Plan: 网站使用、编辑、上线与维护指南

## Goal

基于当前项目的真实配置，整理一套可直接执行的网站使用、内容编辑、自动上线和后续维护流程。

## Phases

- [x] Phase 1: 恢复项目上下文
- [x] Phase 2: 核对编辑与部署配置
- [x] Phase 3: 编写操作指南
- [x] Phase 4: 复核并交付

## Key Questions

1. 普通读者和站长分别从哪里进入网站？
2. 如何通过 CMS 和本地 Markdown 编辑文章？
3. 内容如何从 GitHub 自动部署到 VPS？
4. 日常、月度和故障维护分别做什么？

## Decisions Made

- 以现有 Decap CMS、GitHub Actions、Docker、Nginx 和 Cloudflare 配置为准。
- 同时提供在线编辑和本地 Git 编辑两条路径。
- 在线编辑作为日常发文首选，本地编辑用于复杂 MDX、组件和批量修改。

## Errors Encountered

- 当前 Codex Desktop 的临时 `apply_patch` 启动器被 WindowsApps 权限策略拒绝执行；新文档改用 UTF-8 安全写入，不覆盖已有用户文件。
- Windows PowerShell 不支持 `Invoke-WebRequest -SkipHttpErrorCheck`；线上状态改用 `curl.exe -I` 验证。`r`n- 收尾脚本中的中文弯引号触发 PowerShell 解析错误；确认脚本未执行后改用 UTF-8 here-string。

## Status

**Completed** - 操作手册、README 入口、线上核对和完整项目验证均已完成。
