# Task Plan: JunhaoChou Site Rebuild V2

## Goal

Rebuild the existing Astro site into a polished personal brand and engineering knowledge base while preserving published URLs, Git-managed content, the static deployment model, and all pre-existing user work.

## Phases

- [x] Phase 1: Preserve the pre-rebuild work in a local baseline commit and create an isolated branch.
- [x] Phase 2: Confirm product truth, design direction, architecture findings, references, and release constraints.
- [x] Phase 3: Implement content collections, taxonomy, routes, design system, layouts, search, relations, CMS, SEO, and deterministic cover assets.
- [x] Phase 4: Expand automated checks and run format, lint, Astro, build, link, browser, Docker, Nginx, security, and visual verification.
- [ ] Phase 5: Record DESIGN.md, update project memory, review the final diff, commit, merge, push, and verify production with a reversible rollback point.
  - [x] Document the implemented design system and capture the final six light/dark desktop/mobile screenshots.
  - [x] Complete independent code/design review and resolve every reported implementation finding.
  - [x] Pass every executable local static, browser, performance, content, security, Compose and Nginx gate; retain the clean image build as a mandatory CI gate because local Docker Hub IPv6 resolution is unavailable.
  - [ ] Commit the release candidate, fast-forward `main`, push once, monitor Actions and run public smoke checks.

## Key Questions

1. Can the redesign preserve every existing public article/category/tag/series URL while adding research and project collections?
2. Can Pagefind index only canonical detail pages and share one accessible UI across the modal and search page?
3. Can Decap be locally pinned without changing Git as the content source of truth?
4. Can the final static bundle meet the quality, accessibility, and production-equivalent test gates?

## Decisions Made

- Product position: personal brand plus engineering knowledge base.
- Visual direction: Scientific Editorial × Engineering Knowledge Base × Restrained Bento.
- Platform: Astro static output with strict TypeScript, Tailwind, MDX, Pagefind, Docker/Nginx, GitHub Actions, and Cloudflare.
- Navigation: 首页 / 研究 / 项目 / 文章 / 关于.
- Content model: separate `articles`, `research`, and `projects` collections.
- Disclosure: publish research questions, methods, tools, and reproducibility approach only; do not publish unpublished results or sensitive data.
- Search: canonical detail pages only, with type/domain/tag filters and shared accessible behavior.
- CMS: pin Decap locally and preserve Git editorial workflow; production build remains authoritative for MDX/Mermaid/KaTeX rendering.
- Release: preserve the last verified production revision, push only the final merged state, and deploy automatically after all gates pass.

## Errors Encountered

- The pre-rebuild baseline contains two intentional Markdown hard-break lines that `git diff --check` reports as trailing whitespace; preserved unchanged in baseline commit `6109763`.
- The inherited baseline has known `/admin/` Playwright server-parity failures and a large eager Mermaid bundle; both are implementation targets rather than ignored failures.
- The sandbox exposes `.codex/` through a reparse boundary that blocks `apply_patch`; project memory is preserved through one exact, approved PowerShell write after reviewing the existing file.
- The Impeccable concept seed rejects title-cased modes; rerun with the required lowercase `read` value.
- The concept-seed process emitted a Windows libuv closing-handle assertion after printing a complete seed packet; it exited successfully and the brief-pinned direction remains authoritative.
- `npm view decap-cms-app version` could not write to the user-level npm cache inside the sandbox (`EPERM`); rerun with the explicitly authorized external package-install permission.
- Installing the current pinned `decap-cms-app@3.15.1` completed with legacy peer warnings and reported 32 high-severity transitive audit findings. Do not run an automatic audit fix; inspect reachability and keep the package build/admin-only before deciding release readiness.
- The default `python` interpreter no longer has Pillow, so deterministic cover regeneration failed with `ModuleNotFoundError: PIL`; locate the existing bundled/workspace Python before installing anything.
- The initial sandboxed `npm install` for the nanoid security override could not write the user npm cache; the approved external rerun succeeded and production-only `npm audit` is now clean.
- A full Docker image rebuild is locally blocked by Docker Hub anonymous-token resolution choosing an unreachable IPv6 endpoint. The current `dist` and Nginx configuration were still verified in a read-only production-equivalent container on `127.0.0.1:8081`; `nginx -t`, `/healthz/`, admin caching/noindex, security headers and static routes all passed. CI retains a clean Linux image build gate.
- The independent Impeccable finish review returned `fix` for five craft-floor issues; all five were corrected and the verdict pass recomputed the final disposition to `ship` with no regressions.
- Astro 7.2 agent-aware preview and Playwright's Windows shell-tree cleanup caused completed browser tests to wait indefinitely. `test:e2e` now uses a foreground Node static server owned by `scripts/run-playwright.mjs`, which preserves all assertions and exits cleanly on Windows and Linux.

## Status

**Currently in Phase 5** — the release candidate is documented and every executable local gate passes; CI will additionally perform the clean image build. The remaining transaction is the one-shot commit/fast-forward merge/push followed by Actions and public production smoke.
