# Cloudflare Access for `/admin/`

Cloudflare Access protects the Decap CMS route before GitHub OAuth starts. It is a second protection layer, not a replacement for GitHub authorization.

1. In Cloudflare Zero Trust, open **Access** then **Applications**.
2. Create a **Self-hosted** application.
3. Set the domain to `junhaochou.com` and the path to `/admin/*`.
4. Create an Allow policy limited to the administrator's email address or an approved identity-provider group.
5. Save the application, then verify an unauthenticated browser cannot access `/admin/`.

Do not claim this configuration is active until it has been applied in the Cloudflare dashboard. The public site remains static and does not need Cloudflare Access to serve pages, search, RSS or SEO metadata.
