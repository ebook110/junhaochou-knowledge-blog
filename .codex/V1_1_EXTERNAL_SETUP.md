# V1.1 External Setup

## Goal

Publish the existing local repository to GitHub, configure Decap CMS OAuth through Cloudflare Workers, and prepare guarded VPS deployment integration without storing credentials in Git.

## Planned Actions

- [x] Confirm `ebook110/junhaochou-knowledge-blog` is available, create it as a public GitHub repository, make the initial `main` commit, and push it.
- [x] Create the GitHub OAuth App with the deployed Worker callback URL.
- [x] Create the `junhaochou-decap-oauth` Cloudflare Worker and its workers.dev origin.
- [x] Generate GitHub OAuth client credentials and add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` only through the Cloudflare dashboard.
- [x] Deploy the repository Worker source through Wrangler.
- [ ] Replace only Decap's repository and Worker-origin placeholders, commit, and push the configuration (local commits `9deec7b` and `4965a1b` created; GitHub push pending network recovery).
- [ ] Configure Cloudflare Access for `junhaochou.com/admin/*` and GitHub Actions/VPS secrets when their values and target VPS are available.
- [ ] Verify the public repository, Worker endpoint, static CMS route, CI run, then record remaining manual items.

## Decisions

- GitHub account confirmed in the logged-in browser: `ebook110`.
- Cloudflare account and `junhaochou.com` zone are visible in the logged-in browser.
- Proposed repository: `ebook110/junhaochou-knowledge-blog`.
- Proposed Worker name: `junhaochou-decap-oauth`; Worker origin will be discovered only after deployment.
- Repository is public because this is a public static technical blog. No source data, secrets, server addresses, SSH keys, OAuth client secrets, or VPS credentials will be committed.

## Status

Repository, Workers subdomain and OAuth App are created. The OAuth Client ID and Secret are stored as Cloudflare Worker secrets, and the repository Worker source was deployed through authenticated Wrangler. The CMS configuration and Worker correction are committed locally as `9deec7b` and `4965a1b`; publishing remains blocked by the current local GitHub HTTPS connection reset. Cloudflare Access and VPS deployment secrets still require administrator policy and VPS details.

## Errors Encountered

- `wrangler login` did not display an authorization URL and timed out after two minutes; no project credential file was created. The Cloudflare dashboard was used to create the Worker instead.
- `wrangler login --device --use-keyring` failed because `@napi-rs/keyring` is unavailable on this Windows host. `--no-use-keyring` completed successfully and stores its session only in Wrangler's user-level configuration.
- Local GitHub HTTPS requests currently fail with connection resets/timeouts; commits `9deec7b` and `4965a1b` have not reached `origin/main`.
- Direct local HTTP verification of the Workers.dev origin timed out, while `wrangler deployments list` confirmed deployment version `e3b494d8-c075-4573-ac01-04f2517d25ef`.
