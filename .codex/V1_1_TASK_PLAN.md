# V1.1 CMS and Git Deployment Plan

## Goal

Add Decap CMS, GitHub OAuth proxy templates, editorial workflow, CI and safe production deployment automation without changing Astro static output or the existing Content Collection design.

## Phases

- [x] Audit existing content, deployment and CI configuration.
- [x] Add static `/admin/` and a schema-compatible Decap configuration.
- [x] Add Cloudflare Worker OAuth proxy template and security guidance.
- [x] Extend CI and add guarded production deployment workflow.
- [x] Update operational documentation and automated tests.
- [x] Run release and Docker verification, then review the worktree.
- [ ] Synchronize the final external-setup status commit to `origin/main`.
- [x] Configure Cloudflare Access for `/admin/*` with one-time email verification.
- [ ] Provision the Ubuntu 24.04 VPS, Cloudflare Origin CA TLS, and GitHub Actions deployment secrets.
- [ ] Run the first production deployment and verify CMS login plus public endpoints.

## Decisions

- Repository is `ebook110/junhaochou-knowledge-blog` on `main`; Decap points to its deployed Worker origin.
- The public site remains static and Git-managed. No database, server API, user accounts or Astro SSR will be introduced.
- OAuth secrets remain Cloudflare Worker secrets; deployment values remain GitHub Actions secrets.

## Errors Encountered

- A standalone Worker `tsc` command using only the WebWorker library also loaded project browser type packages and failed on unrelated DOM declarations. Re-run the same syntax/type check with `skipLibCheck`; the authoritative site type check remains `npm.cmd run check`.

## Status

**Currently in production infrastructure setup** - Cloudflare Access protects `/admin/*`; VPS connection details are required before creating the deployment user, Origin CA certificate, DNS records, and Actions secrets.
