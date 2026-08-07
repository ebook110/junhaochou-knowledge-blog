# Decap GitHub OAuth Worker

This Cloudflare Worker is a small OAuth callback service for Decap CMS. It is intentionally separate from the Astro Docker container, so an OAuth outage cannot prevent visitors from reading the static site.

## Deploy manually

1. Install Wrangler locally and authenticate to the Cloudflare account that owns the Worker.
2. Review `wrangler.toml`. Set `CMS_ORIGIN` to the exact public site origin if the domain changes. It must exactly match the origin serving Decap CMS, without a trailing path.
3. From this directory, create Worker secrets without adding them to Git:

   ```bash
   wrangler secret put GITHUB_CLIENT_ID
   wrangler secret put GITHUB_CLIENT_SECRET
   ```

4. Deploy with `wrangler deploy`.
5. In the GitHub OAuth App, set the authorization callback URL to `https://YOUR_OAUTH_WORKER.YOUR_SUBDOMAIN.workers.dev/callback`.
6. Replace the matching `base_url` placeholder in `public/admin/config.yml` with the deployed Worker origin.

## Security behavior

- `/auth` generates a signed, short-lived state value and redirects to GitHub with the minimum `repo` scope required for Git-backed publishing.
- `/callback` validates the state and posts the resulting authorization message only to `CMS_ORIGIN`.
- Callback HTML is non-cacheable, escapes provider error text, and uses a restrictive CSP. Its narrowly scoped inline script is required to send Decap's callback result to the CMS popup opener.
- The Worker stores no database records, GitHub token, article content or user account data.
- Do not place `GITHUB_CLIENT_SECRET`, GitHub tokens or a `.dev.vars` file in this repository.

For private repositories, the GitHub account used in Decap must have repository write access. This is separate from the SSH deploy key used by the VPS to fetch the repository.
