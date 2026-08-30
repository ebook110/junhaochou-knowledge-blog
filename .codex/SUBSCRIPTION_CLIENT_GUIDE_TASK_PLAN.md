# Task Plan: Client Subscription Guide

## Goal

Add a compliant Chinese knowledge article explaining how an authorized subscription link is imported, updated, and checked in Clash Verge, v2rayN, v2rayNG, and sing-box.

## Phases

- [x] Phase 1: Recover project conventions and inspect the content schema.
- [x] Phase 2: Identify the existing network-format article and define a distinct practical scope.
- [x] Phase 3: Create the article and its local cover asset.
- [x] Phase 4: Format, build, run link and browser checks, then update project memory.

## Decisions Made

- The guide will cover only links the reader is authorized to use and will not include evasion guidance.
- Actual subscription URLs are treated as secrets and excluded from source code, examples, and screenshots.
- Screenshots are represented by a shot list and placement cues until the author supplies redacted images.

## Errors Encountered

- `python scripts\\generate-cover-art.py` failed because the system Python does not provide Pillow. Resolution: use the desktop workspace's bundled Python runtime, which includes project image dependencies.

## Status

**Complete** - article, local cover, test coverage, and project memory are updated.
