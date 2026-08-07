# Web CMS Publishing

The public site remains a static Astro build. Decap CMS is only a browser interface for committing Markdown or MDX and Git-managed WebP images to this repository.

## Access and workflow

1. Visit `https://junhaochou.com/admin/` after Cloudflare Access and the OAuth Worker are configured.
2. Sign in with the authorized GitHub account.
3. Create or edit an item in **文章**. The collection writes to `src/content/articles/` and uses the existing Astro `articles` schema.
4. Save work as a draft, then move it through Decap's Editorial Workflow: Draft, In Review, Ready, Publish.
5. Decap creates a Git branch and pull request. The pull request runs the existing CI workflow.
6. Merge the reviewed pull request into `main`. Only a successful `main` verification job can run the VPS deployment job.

## Content rules

- Keep the URL slug stable, lower-case and ASCII.
- Categories are fixed to the eight existing category slugs. Tags remain free-form lists.
- The editor keeps article bodies as Markdown or MDX source. Do not rely on a WYSIWYG editor to rewrite custom components such as `MermaidDiagram`.
- Cover uploads are Git-managed WebP files in `public/images/covers/`. Every cover needs Chinese alternative text; the current Astro schema rejects other cover paths and file extensions.
- Use `draft: true` for unpublished content. Astro excludes drafts from the public pages, RSS and Pagefind output.

## Required configuration

`public/admin/config.yml` deliberately contains two placeholders because this local repository has no configured Git remote:

- `YOUR_GITHUB_USERNAME/YOUR_REPOSITORY`
- `https://YOUR_OAUTH_WORKER.YOUR_SUBDOMAIN.workers.dev`

Replace both values after the GitHub repository and Cloudflare Worker are created. Do not put GitHub tokens or OAuth secrets in this file.

## Validation

Before merging CMS-generated pull requests, CI runs formatting, linting, Astro Content Collection validation, the production build with Pagefind, link checks, Playwright tests and Docker Compose configuration validation.
