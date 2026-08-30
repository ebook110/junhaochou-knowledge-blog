# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary reader is a Chinese-speaking materials, mechanical, computational, or engineering practitioner who needs credible, reusable explanations rather than short-lived social posts. Secondary readers include research collaborators, graduate students, engineering peers, and recruiters evaluating a combined profile in materials research, computation, data analysis, and practical systems work. The author is also a core user: the site must remain straightforward to update through Git or the protected editorial interface.

## Product Purpose

JunhaoChou is a public personal brand and engineering knowledge base. It makes the author's research directions, selected reproducible projects, and long-form technical articles easy to understand, navigate, search, reference, and maintain. Success means a new visitor can identify the author's research and engineering focus within the first viewport, reach an appropriate content path without taxonomy knowledge, and read technical material comfortably on desktop or mobile.

## Positioning

The site connects refractory high-entropy-alloy research, molecular dynamics, machine-learning interpretation, and engineering operations in one evidence-led knowledge system. It presents methods and reproducible reasoning rather than claiming unpublished results, and it treats research pages, project records, and technical articles as connected but distinct forms of knowledge.

## Operating Context

Public content is authored as Markdown or MDX, reviewed through Git, indexed at build time, and deployed as static files. Readers use navigation, Pagefind search, domains, tags, series, related links, and backlinks to move between research, projects, and articles. The author edits locally or through a Cloudflare Access-protected Decap CMS, then relies on GitHub Actions, Docker/Nginx, and health checks for release.

## Capabilities and Constraints

- Astro static output, strict TypeScript, Tailwind CSS, Content Collections, Pagefind, Shiki, Mermaid, KaTeX, RSS, sitemap, robots, and Git-managed content are durable platform constraints.
- Public routes for existing articles, categories, tags, series, tools, friends, admin, RSS, and health checks remain compatible.
- Research and projects are first-class typed collections; articles retain their existing slugs, field contract, and substantive body content while allowing presentation and relationship metadata updates.
- Search operates entirely on the generated static index and must not index listing-card duplicates.
- The editorial control plane remains Decap CMS plus Git and CI/CD. There is no database, public account system, runtime business API, payment flow, or commercial CMS.
- No real credentials, tokens, passwords, private addresses, unpublished experimental data, or confidential paper results may enter the repository.

## Brand Commitments

- Public identity: `JunhaoChou`.
- Primary navigation language: Chinese, with concise English technical terminology where it improves precision.
- Voice: calm, precise, practical, evidence-led, and appropriate for a materials researcher who writes code and builds engineering systems.
- The identity uses a minimal text wordmark rather than a portrait or large illustrative hero.
- The approved replacement direction is “Scientific Editorial × Engineering Knowledge Base × Restrained Bento,” with a high-quality light and dark theme and without neon, heavy glass, anime imagery, terminal cosplay, or marketing-template composition.

## Evidence on Hand

- Existing Git-managed articles, series, tags, categories, cover assets, RSS, search index, site metadata, deployment configuration, and operations documentation.
- Publicly safe research context: VNbTaTiZr refractory high-entropy alloys, LAMMPS tensile simulations, microscopic deformation mechanisms, and machine-learning prediction and interpretation of UTS.
- Publicly safe engineering context: Astro knowledge-site architecture, content workflow, static search, Docker/Nginx deployment, and Cloudflare access control.
- No publication metrics, benchmark claims, testimonials, employer endorsements, or unpublished numerical research results are approved for display; future work must not fabricate them.

## Product Principles

1. Make research identity unmistakable without overstating evidence.
2. Optimize long-form technical comprehension before visual novelty.
3. Connect knowledge through stable routes, useful taxonomy, related content, and backlinks.
4. Keep publishing inspectable, Git-native, static, secure, and reversible.
5. Earn trust through precise content, accessible interaction, fast delivery, and honest disclosure.

## Accessibility & Inclusion

The public site targets WCAG 2.2 AA, including keyboard-complete navigation and dialogs, visible focus, semantic landmarks and headings, useful alternative text, sufficient contrast in both themes, reduced-motion behavior, 44px touch targets, and layouts that remain usable at narrow widths and increased text sizes.
