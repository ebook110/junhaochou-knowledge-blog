# V1.1 External Setup

## Goal

Publish the existing local repository to GitHub, configure Decap CMS OAuth through Cloudflare Workers, and prepare guarded VPS deployment integration without storing credentials in Git.

## Planned Actions

- [x] Confirm `ebook110/junhaochou-knowledge-blog` is available, create it as a public GitHub repository, make the initial `main` commit, and push it.
- [x] Create the GitHub OAuth App with the deployed Worker callback URL.
- [x] Create the `junhaochou-decap-oauth` Cloudflare Worker and its workers.dev origin.
- [x] Generate GitHub OAuth client credentials and add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` only through the Cloudflare dashboard.
- [x] Deploy the repository Worker source through Wrangler.
- [x] Replace Decap's repository and Worker-origin placeholders, commit, and publish the configuration on `main` (`9deec7b` and `4965a1b`).
- [x] Configure Cloudflare Access for `junhaochou.com/admin/*` with the `JunhaoChou CMS administrator only` one-time-email policy.
- [ ] Provision the VPS and configure GitHub Actions secrets when the target host and initial administrator access are available.
- [ ] Verify the public repository, Worker endpoint, static CMS route, CI run, then record remaining manual items.

## Decisions

- GitHub account confirmed in the logged-in browser: `ebook110`.
- Cloudflare account and `junhaochou.com` zone are visible in the logged-in browser.
- Proposed repository: `ebook110/junhaochou-knowledge-blog`.
- Proposed Worker name: `junhaochou-decap-oauth`; Worker origin will be discovered only after deployment.
- Repository is public because this is a public static technical blog. No source data, secrets, server addresses, SSH keys, OAuth client secrets, or VPS credentials will be committed.

## Status

Repository, Workers subdomain and OAuth App are created. The OAuth Client ID and Secret are stored as Cloudflare Worker secrets, and the repository Worker source was deployed through authenticated Wrangler. Cloudflare Access now protects `junhaochou.com/admin/*` with a single-email Allow policy and the One-time PIN identity provider. VPS provisioning, DNS, Origin CA and GitHub Actions deployment secrets await the target host and initial administrator access.

## Errors Encountered

- `wrangler login` did not display an authorization URL and timed out after two minutes; no project credential file was created. The Cloudflare dashboard was used to create the Worker instead.
- `wrangler login --device --use-keyring` failed because `@napi-rs/keyring` is unavailable on this Windows host. `--no-use-keyring` completed successfully and stores its session only in Wrangler's user-level configuration.
- Initial GitHub HTTPS attempts were interrupted by connection resets/timeouts; later synchronization confirmed `9deec7b` and `4965a1b` on `origin/main`.
- Direct local HTTP verification of the Workers.dev origin timed out, while `wrangler deployments list` confirmed deployment version `e3b494d8-c075-4573-ac01-04f2517d25ef`.
