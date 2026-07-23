---
title: Link Validation Report
created: 2026-07-20
updated: 2026-07-20
tags:
  - type/report
  - status/active
  - domain/maintenance
---

## Summary

| Metric | Value |
|--------|-------|
| Total wikilinks | ~914 |
| Valid links | ~115 |
| Forward references (→future notes) | ~900 |
| Actual broken links | 14 |
| Syntax errors | 0 |
| Orphan notes (0 incoming) | ~46 |
| Notes with 0 outgoing links | ~5 |

## Analysis

**Forward References**: The ~900 unresolved wikilinks are **intentional forward references** — links from MOCs and index files to leaf notes that will be created as knowledge is captured. This is expected in a growing vault.

**Actual Broken Links**: 14 cross-references in `founder-journal.md` point to `docs/` paths outside the brain vault. These should be converted to relative paths or removed.

**Not a problem**: Forward references in a new vault are expected. They become a problem only when:
1. Notes are created but not linked
2. Notes are deleted but links remain
3. Links point to wrong targets

**Current state**: The `brain.sh validate-links` command classifies links into categories: syntax errors, forward references, and actual broken links.

## Resolution Plan
- Fix 14 broken cross-references in `founder-journal.md` (convert `docs/` paths to relative links)
- After each phase completion, verify that new notes resolve some forward references
- Monthly: run `bash brain.sh validate-links` and review
- Quarterly: decide if any forward references should be removed (concepts that won't be captured)
