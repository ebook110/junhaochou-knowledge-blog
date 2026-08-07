# V1.1 CMS and Git Deployment Plan

## Goal

Add Decap CMS, GitHub OAuth proxy templates, editorial workflow, CI and safe production deployment automation without changing Astro static output or the existing Content Collection design.

## Phases

- [x] Audit existing content, deployment and CI configuration.
- [x] Add static `/admin/` and a schema-compatible Decap configuration.
- [x] Add Cloudflare Worker OAuth proxy template and security guidance.
- [x] Extend CI and add guarded production deployment workflow.
- [x] Update operational documentation and automated tests.
- [ ] Run release and Docker verification, then review the worktree.

## Decisions

- Repository owner/name is unknown because no Git remote is configured; use `YOUR_GITHUB_USERNAME/YOUR_REPOSITORY` in Decap configuration.
- The public site remains static and Git-managed. No database, server API, user accounts or Astro SSR will be introduced.
- OAuth secrets remain Cloudflare Worker secrets; deployment values remain GitHub Actions secrets.

## Errors Encountered

- A standalone Worker `tsc` command using only the WebWorker library also loaded project browser type packages and failed on unrelated DOM declarations. Re-run the same syntax/type check with `skipLibCheck`; the authoritative site type check remains `npm.cmd run check`.

## Status

Completed. Release, browser, Docker, static SEO and worktree checks passed; required external Cloudflare, GitHub and VPS setup remains documented for the operator.
