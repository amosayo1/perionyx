---
title: Archive
created: 2026-07-26
updated: 2026-07-26
tags: [index, archive, deprecated, superseded, historical, snapshots]
owner: platform-team
status: active
---

# Archive

## Purpose

Deprecated, superseded, and historical content. Preserves a record of what changed and why, but should not be treated as current guidance.

**Authority:** None — archived content is historical. Always check current folders for authoritative versions.

## Summary

The Archive folder is the Brain's memory of things that were once current but have been superseded by newer work. It preserves context for understanding how the platform evolved, but archived documents should not be referenced for active decision-making. When in doubt, check the originating folder first.

## Content Map

| File | Description | Original Location |
|------|-------------|-------------------|
| [[19-Archive/archived-phases\|Archived Phases]] | Completed phase reports moved from Roadmaps | [[12-Roadmaps/index\|12-Roadmaps]] |
| [[19-Archive/deprecated-decisions\|Deprecated Decisions]] | Superseded ADRs and decision records | [[11-Decisions/index\|11-Decisions]] |
| [[19-Archive/superseded-architecture\|Superseded Architecture]] | Old architecture docs replaced by newer versions | [[05-Architecture/index\|05-Architecture]] |
| [[19-Archive/historical-snapshots\|Historical Snapshots]] | Point-in-time snapshots of key documents | Various |
| [[19-Archive/old-reports\|Old Reports]] | Reports that have been fully incorporated into newer analysis | Various |

### Archive Policy

| Rule | Guideline |
|------|-----------|
| **What gets archived** | Superseded docs, completed phases, deprecated decisions, replaced architecture |
| **What stays in place** | Active lessons, current decisions, ongoing roadmaps |
| **Naming** | Original filename preserved; add `-archived-YYYY-MM` suffix if needed |
| **Links** | Original folders should NOT link to Archive; Archive links TO originating folders |
| **Review** | Archive contents reviewed quarterly; truly obsolete content deleted after 12 months |

### When to Archive

- A decision is explicitly superseded by a newer ADR
- A phase is complete and its report is no longer referenced
- Architecture docs are replaced by a newer version
- A report's findings have been fully incorporated into active documents
- Content is more than 6 months old and no longer referenced

## Navigation

| Folder | Relationship |
|--------|-------------|
| [[12-Roadmaps/index\|12-Roadmaps]] | Phases move here after completion (optional) |
| [[00-Constitution/index\|00-Constitution]] | Constitution versions archived here when superseded |

## Related

- [[12-Roadmaps/index\|12-Roadmaps]] | Source of archived phase reports
- [[11-Decisions/index\|11-Decisions]] | Source of deprecated ADRs
- [[05-Architecture/index\|05-Architecture]] | Source of superseded architecture docs
- [[17-Lessons/index\|17-Lessons]] | Lessons learned from archived content
