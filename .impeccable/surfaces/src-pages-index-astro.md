---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/layouts/BaseLayout.astro", "src/pages/articles/index.astro"]
---

# Home and shared public surfaces

## Scope and mode

- Primary target: `src/pages/index.astro`, with the same visual world inherited by public listings, detail pages, search, and about.
- Visitor mode: Read, with a compact Experience layer on the homepage.

## Audience, job, and action

- A technical reader, collaborator, or recruiter should recognize JunhaoChou's materials-research and engineering-computation profile within the first viewport.
- The next action is to enter Research, Projects, or Articles; search remains immediately available for returning readers.

## Content and proof

- Use only approved facts from PRODUCT.md: VNbTaTiZr, LAMMPS, deformation mechanisms, UTS prediction and interpretation, and static knowledge-site engineering.
- Show methods, tools, content paths, and reproducible workflow as proof. Do not invent numerical results, publication metrics, clients, employers, or testimonials.

## Direction and memorable moment

- Scientific Editorial × Engineering Knowledge Base × Restrained Bento.
- The opening behaves like a research index sheet: a decisive typographic statement beside a compact method matrix, with fine alignment rules and one cobalt route marker.
- A restrained tensile-specimen line motif links research, projects, and articles across the first viewport without becoming a decorative illustration.
- Approved composition: `.impeccable/mocks/home-research-index.png`. The choice was delegated in the confirmed no-pause brief and recorded in its JSON sidecar.

## Composition and implementation inventory

| Region             | Commitment                                                                                                 | Medium                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| App navigation     | Compact wordmark, five primary routes, search and theme controls; active state uses one cobalt rule        | Semantic HTML, shared Astro component, Lucide icons                    |
| First viewport     | Approximately 52/48 split; headline and two actions at left, four-column method matrix at right            | Semantic HTML and CSS Grid                                             |
| Primary action     | Solid cobalt rectangular control with clear arrow and full keyboard states                                 | Shared link-button component and Lucide arrow                          |
| Signature geometry | One wide tensile-specimen profile with measurement ticks, spanning the container between hero and projects | Authored semantic SVG; decorative and hidden from assistive technology |
| Project rhythm     | Three unequal records with real project titles, concise method tags and disclosure/status                  | Astro project cards, borders rather than shadowed nested cards         |
| Knowledge domains  | Four full-width ledger rows with description and real category links                                       | Semantic navigation list and CSS Grid                                  |
| Latest articles    | Compact border-separated rows with metadata and dates                                                      | Astro article-row component                                            |
| Typography         | System Chinese sans with a decisive 2.6–4.5rem display range; mono only for tool/method codes              | CSS tokens; no external font request                                   |

The generated comp's fictional project names, methods, dates, charts, icons, and footer copy are layout placeholders only. Formal code must replace them with approved repository content. No part of the comp is shipped as a raster image.

## Constraints

- System Chinese typography, high-quality light and dark themes, static Astro output, semantic HTML, WCAG 2.2 AA, 44px controls, reduced motion, and fast first load.
- No portrait, generated hero raster, neon, strong glass, gradient text, marketing metrics, nested card grid, scroll hijacking, or external fonts.
- Preserve existing public routes and article truth.

## Unresolved decisions

- None. Detailed token values are resolved in implementation and documented from the shipped system in DESIGN.md.
