# Contribution Model

## Overview

A contribution is any input from a person that generates product knowledge. Every conversation, meeting, interview, or feedback session can produce multiple contributions.

## Contribution Lifecycle

```
Conversation → Extract Knowledge → Create Contribution → Link to Evidence
                                                          ↓
                                              Roadmap Candidate?
                                              ├── Yes → Link to FeatureRequest → RoadmapItem
                                              └── No  → Archive as reference
```

## Contribution Types

| Type | Description | Example |
|------|-------------|---------|
| problem-identified | A previously unknown problem | "Inventory reconciliation is entirely manual" |
| solution-suggested | A specific solution approach | "Rule-based matching engine with exception workflow" |
| feature-request | A product feature request | "Real-time cash visibility dashboard" |
| workflow-insight | Understanding of current workflow | "Month-end close takes 10 days" |
| pain-point | A specific pain point | "Stock corrections require journal entry" |
| improvement-idea | A process improvement | "Automated discrepancy alerts" |
| validation | Confirmation of an insight | "Yes, that problem is real for us too" |
| use-case | A specific usage scenario | "We would use this for intercompany reconciliation" |
| integration-idea | An integration need | "Needs to sync with Odoo ERP" |

## Evidence Levels

| Level | Meaning |
|-------|---------|
| anecdotal | Single mention, not verified |
| single-source | One person's direct experience |
| multiple-sources | 2-5 independent confirmations |
| validated | 5+ confirmations or expert panel |
| statistically-significant | Formal research with statistical power |

## Confidence Scores

| Level | Meaning |
|-------|---------|
| very-low | Speculative, needs validation |
| low | Possible but unconfirmed |
| medium | Reasonable confidence, limited validation |
| high | Strong confidence, multiple validations |
| very-high | Confirmed across multiple sources |

## Linking Contributions

Every contribution links to:
- **Person**: Who contributed it
- **Conversation/ResearchSession**: Where it was captured
- **Modules**: Which product modules are affected
- **Evidence**: Supporting evidence records
- **Feature Requests**: Related feature requests
- **Roadmap Items**: If accepted into roadmap
