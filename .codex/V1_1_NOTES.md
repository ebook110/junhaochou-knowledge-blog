# V1.1 Audit Notes

## Initial Git State

- The repository is on `master`, has no commits, and has no configured remote.
- All existing project files are untracked baseline files; do not infer a GitHub repository identifier.

## Constraints

- Preserve Astro static output and the existing `articles` Content Collection.
- Keep article and image files in Git.
- Do not add secrets, databases, dynamic APIs, destructive cleanup, or unauthorised external configuration.

## Content Mapping

- Collection: `articles`; source folder: `src/content/articles`; extension: `.md` and `.mdx`.
- Media folder: `public/images/covers`; public prefix: `/images/covers`; covers must use `.webp`.
- Required schema fields: `title`, `description`, `slug`, `pubDate`, `category`, `tags`, `difficulty`, and `cover` (`src`, Chinese `alt`, optional `focal`).
- Optional/defaulted fields: `updatedDate`, `series`, `seriesOrder`, `prerequisites`, `environment`, `draft`, `featured`, `toc`, `lastVerified`, `author`, `canonical`, `disclaimer`, `related`.
- Category slugs: `vps`, `sub2api`, `network`, `cards`, `ansys`, `linux`, `tools`, `learning`.
- Difficulty values: `入门`, `进阶`, `高级`; `series` is an optional string and `seriesOrder` an optional positive integer.

## Existing Automation

- `npm run build` runs `astro check`, static build and Pagefind indexing.
- Existing `.github/workflows/ci.yml` verifies push and PR changes on `main` and `master`; extend it with a deploy job rather than create a competing CI workflow.
- Docker image is static Nginx output and health checks `/healthz/`; recommended VPS path in documentation is `/opt/junhaochou-blog/app` as an example only.

## V1.1 Implementation Notes

- Added a static Decap CMS shell and a schema-compatible GitHub backend configuration. Repository and Worker URLs remain explicit placeholders because no Git remote exists locally.
- The independent Cloudflare Worker checks a signed short-lived OAuth state, targets `postMessage` to `CMS_ORIGIN`, escapes provider errors and uses a restrictive callback CSP.
- CI now deploys only verified `main` commits through a serialized, strict-host-key SSH session. It refuses a dirty remote worktree and only fast-forwards the VPS checkout.
- A direct Worker `tsc` invocation initially loaded unrelated project browser type declarations with a WebWorker-only lib. This is resolved for the targeted check by enabling `skipLibCheck`; the normal Astro check is still required.
