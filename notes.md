# Notes: JunhaoChou Site Rebuild V2

## Baseline

- Branch before rebuild: `main` at local commit `6109763` (`chore(baseline): preserve pre-rebuild content and operations work`).
- Rebuild branch: `codex/site-rebuild-v2`.
- Baseline commit is local only and must not be pushed independently.
- Existing production safety model: Git content, Astro static output, GitHub Actions, Docker Nginx on loopback port 8081, host Nginx, Cloudflare proxy and Access.

## Confirmed Product Direction

- Primary audiences: materials/computational researchers, engineering practitioners, future collaborators/recruiters, and the author maintaining a durable public knowledge base.
- First-view task: immediately understand the author works across refractory high-entropy alloys, molecular dynamics, machine learning, and engineering systems; then enter research, projects, or articles.
- Brand expression: `JunhaoChou` wordmark, restrained cobalt accent, cool neutral surfaces, system Chinese typography, precise borders, minimal shadows, no portrait and no generated hero image.
- Information architecture: 首页 / 研究 / 项目 / 文章 / 关于; taxonomy/archive routes remain compatible but move below the primary navigation.
- New public content: VNbTaTiZr molecular dynamics, UTS machine-learning interpretation, and this knowledge-blog engineering project, without unpublished findings.

## Evidence and References

- Astro Starlight: accessible documentation layout and responsive navigation.
- AstroPaper: article/search/theme/RSS completeness.
- Quartz: backlinks and related-content patterns, without replacing Astro or adding a global graph.
- AstroWind and Kepler: restrained homepage/project rhythm, reimplemented for this product rather than copied.
- Vercel Web Interface Guidelines: final audit reference.
- Local audit found an article desktop grid defect, Pagefind list-card pollution, duplicate search implementations, ignored `toc`, eager Mermaid imports, generic article Open Graph metadata, and `/admin/` test/production routing mismatch.

## Implementation Guardrails

- Preserve existing article bodies, slugs, categories, tags, series, RSS, sitemap, robots, admin route, environment-variable names, OAuth worker boundaries, and deployment security model.
- Do not add a runtime database, user account service, server API, commercial CMS, analytics, external font, external image service, secret, token, password, or server address.
- Use local deterministic cover generation and retain WebP paths plus useful Chinese alt text.
- Treat port 8081 and repository deployment documentation as authoritative over the older skill example that mentions 8080.
- Visual QA is bounded to one desktop/mobile inspection batch, one fix batch, and one final confirmation batch before the independent finish review.

## Impeccable Direction Record

- Seed key: `cd50028b`, mode `read`.
- The user-approved direction overrides the assigned candidate: Scientific Editorial × Engineering Knowledge Base × Restrained Bento.
- The rejected category rut is a generic SaaS hero followed by equal icon cards; the site must instead open with research identity, working methods, and clear knowledge paths.
- Restraint is functional: typography, structure, precise rules, and sparse cobalt interaction color carry the world. Technical personality comes from authentic method labels and geometric material notation, not terminal styling or decorative monospace.
- Three composition probes were generated with the built-in OpenAI image tool. `.impeccable/mocks/home-research-index.png` is approved through the user's delegated no-pause choice; it keeps explicit actions and the clearest research-to-knowledge path. The mock is a north star only and no generated pixels ship in the public site.

## Implemented V2 System

- Added strict Git-native `research` and `projects` Content Collections with `summary`, disclosure, methods, tools, tags, ordering, draft state, explicit relations and optional public links; existing article slugs and bodies remain intact.
- Added `/research/`, `/research/[slug]/`, `/projects/` and `/projects/[slug]/`, plus a four-domain article center, method-led about page, five-item app shell and true three-column article layout.
- Pagefind now indexes exactly 14 canonical detail pages (9 articles, 2 research directions, 3 projects); shared modal/page search supports type/domain/tag filters, keyboard navigation, focus restoration and safe allow-listed highlighting.
- Mermaid loads only when rendered. Decap CMS is pinned locally at `3.15.1`, covers all three collections, and exposes an approximate Markdown preview while the production build remains authoritative.
- SEO includes canonical URLs, correct article Open Graph types, image alt metadata, Website/Person/Article/ScholarlyArticle/CreativeWork/CollectionPage/Breadcrumb JSON-LD, RSS, sitemap and robots.
- Deterministic 1600×900 WebP covers use a shared engineering-texture grammar; no external image service or generated hero raster ships.
- Validation now covers content/CMS contract drift, secrets, distribution metadata, Pagefind uniqueness, internal links, Playwright functional/responsive/accessibility contracts, performance budgets and production Nginx headers/routes.

## Verification Snapshot

- `format:check`, ESLint and Astro check: clean; content contract: 9 articles / 2 research / 3 projects.
- Production build: 76 pages; Pagefind: exactly 14 detail pages and 3 filters; internal links: 0 broken; homepage initial JS: 4.3 KiB gzip.
- Playwright: 14 passed, 10 intentionally skipped by desktop/mobile responsibility, 0 failed; coverage includes series paging and cross-collection backlinks.
- Throttled 390px lab on the conservative no-store static test server: homepage LCP 1.65s / CLS 0 / INP 40ms; representative article LCP 1.42s / CLS 0 / INP 32ms (the earlier compressed Astro preview measured 1.15s and 1.06s LCP).
- Production dependency audit: 0 known vulnerabilities after a scoped `postcss -> nanoid 3.3.18` override. Decap's legacy peer/dev-only audit warnings remain isolated from public runtime bundles.
- Nginx production-equivalent container on 8081: config syntax, health, local Admin assets/noindex/no-store, cache matrix and security headers pass. Full image rebuild awaits Docker Hub network availability; CI still builds from clean Linux runners.
- Final Impeccable verdict: `disposition: ship`; detector: `[]`.
- `DESIGN.md` and `.impeccable/design.json` record the actual 4/8/12px radius scale, semantic color system and reusable components; all six final screenshots were recaptured after token alignment.
- Independent final code audit reported no blocking findings. Its two SEO consistency observations were resolved: `/admin/` is filtered from sitemap with a distribution regression check, and Article JSON-LD now shares the resolved canonical URL.
- The exact temporary smoke container `junhao-v2-smoke` (`c0b17bda7cee`) was removed after its final checks; no existing Docker services were changed.
- Playwright no longer delegates server ownership to Astro's agent-aware preview or the Windows `taskkill` path. `scripts/run-playwright.mjs` starts the foreground `scripts/serve-dist.mjs` on an IPC-confirmed random free port, runs the unchanged test suite, and always reclaims the direct child process; a cold full run now exits normally in about eight seconds.
