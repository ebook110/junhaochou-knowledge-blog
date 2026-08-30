# Notes: Client Subscription Guide

## Existing Project Conventions

- Articles live in `src/content/articles/` and must use the `network` category for this topic.
- Every article includes a local WebP cover from `public/images/covers/`.
- Existing `network-client-formats` explains YAML/JSON format differences; this new article focuses on the reader workflow.

## Content Scope

- Required clients: Clash Verge, v2rayN, v2rayNG, sing-box.
- Workflow: obtain an authorized link, import it as a remote profile, update, select a usable profile, and confirm local connection state.
- Safety: do not publish a full link, preserve certificate checks, use official releases, and revoke/replace an accidentally exposed link.

## Screenshot Plan

- One redacted image each for the profile/subscription import screen of the four clients.
- One final image for the active profile and local connection state.
- Mask the entire URL, account identifier, traffic quota, expiry date, server names, IP addresses, QR codes, and device identifiers.
