# V1.1 External Setup

## Goal

Publish the existing local repository to GitHub, configure Decap CMS OAuth through Cloudflare Workers, and prepare guarded VPS deployment integration without storing credentials in Git.

## Planned Actions

- [ ] Confirm `ebook110/junhaochou-knowledge-blog` is available, create it as a public GitHub repository, make the initial `main` commit, and push it.
- [ ] Create the GitHub OAuth App with the deployed Worker callback URL.
- [ ] Create and deploy the `junhaochou-decap-oauth` Cloudflare Worker; add only Worker secrets through the Cloudflare dashboard.
- [ ] Replace only Decap's repository and Worker-origin placeholders, commit, and push the configuration.
- [ ] Configure Cloudflare Access for `junhaochou.com/admin/*` and GitHub Actions/VPS secrets when their values and target VPS are available.
- [ ] Verify the public repository, Worker endpoint, static CMS route, CI run, then record remaining manual items.

## Decisions

- GitHub account confirmed in the logged-in browser: `ebook110`.
- Cloudflare account and `junhaochou.com` zone are visible in the logged-in browser.
- Proposed repository: `ebook110/junhaochou-knowledge-blog`.
- Proposed Worker name: `junhaochou-decap-oauth`; Worker origin will be discovered only after deployment.
- Repository is public because this is a public static technical blog. No source data, secrets, server addresses, SSH keys, OAuth client secrets, or VPS credentials will be committed.

## Status

Read-only account and resource discovery is complete. External side-effect actions await explicit action-time confirmation.
