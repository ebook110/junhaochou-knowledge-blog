# CMS CRUD and Cache Lifecycle Plan

## Goal

Incrementally improve Decap article management and cache lifecycle controls without changing the Astro content schema or adding a runtime backend.

## Phases

- [x] Phase 1: Restore project context and create task records.
- [x] Phase 2: Inspect CMS, CI, Nginx, Docker, and deployment documentation.
- [x] Phase 3: Implement CMS metadata, cache headers, and operational documentation.
- [x] Phase 4: Run local checks and controlled production header verification.
- [ ] Phase 5: Commit, push, confirm CI deployment, and publish the final report.

## Decisions

- Git remains the only content source of truth.
- Keep the existing double-Nginx topology. The Docker Nginx owns response cache headers; host Nginx remains a transparent TLS reverse proxy.
- Do not call Cloudflare APIs. Document manual Cache Rules instead.
- Docker builder cache cleanup is manual by default; any timer must be opt-in and only target builder cache older than 30 days.

## Status

Currently in Phase 5: committing the Cloudflare Pagefind rule clarification and awaiting the final documentation deployment.

## Errors Encountered

- A broad documentation patch did not match the existing UTF-8 content. No partial edit was applied; retry with smaller anchors.
- `format:check` identified only `docs/cache-policy.md`; apply Prettier and rerun before release.
- `CI=true npm.cmd run test` completed build and link checks, but Playwright's Windows web-server process invoked `npm` and exited early under the local execution policy. The preview command is now platform-aware; rerun E2E.
- Direct preview inspection showed the actual cause: an existing Astro preview for this workspace owns the preview session and refuses a second server, even on another port. The platform-aware Playwright change was reverted to keep scope narrow; reuse the existing 4321 preview after the current build.
- Browser UI recheck could not start because the installed Chrome skill has no `scripts/browser-client.mjs` runtime. No browser fallback was used; production CMS config and the prior OAuth acceptance remain the evidence for CMS behavior.
