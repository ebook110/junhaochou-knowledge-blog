# CMS CRUD and Cache Lifecycle Notes

## Findings

- The `articles` collection already targets `src/content/articles` with MDX frontmatter and `publish_mode: editorial_workflow`; Astro's schema is complete and will remain unchanged.
- The deploy workflow already rejects a dirty VPS worktree, uses `git fetch origin main` plus `git merge --ff-only origin/main`, and serializes production deployment with the `production-deploy` concurrency group.
- Docker Nginx currently emits cache headers. Host Nginx does not alter upstream cache headers, so Docker Nginx is the single cache-control authority.
- Existing broad JavaScript caching would also cache `/pagefind/`; explicit path rules are required to shorten Pagefind cache lifetime.
- Decap needs explicit `delete: true`, view metadata, and `squash_merges: true` to make the desired management behavior visible and deterministic.

## Verification Evidence

- `format:check`, ESLint and `astro check` passed. Astro retains five baseline hints unrelated to this change.
- Full build passed: 62 static routes, Pagefind indexed 53 pages, and 63 internal HTML files passed the link check.
- All 32 Playwright desktop and mobile tests passed against the existing refreshed Astro preview on port 4321. A second Astro preview is intentionally not started because Astro holds a workspace-level preview session lock.
- A temporary Docker Compose project on loopback port 8082 verified: HTML `no-cache`; `/_astro/` and `/images/` `max-age=2592000`; `/pagefind/` `max-age=600`; and `/admin/` plus `config.yml` `private, no-store, no-cache, must-revalidate`.
- Production verification remains pending the normal GitHub Actions verify and deploy jobs.
