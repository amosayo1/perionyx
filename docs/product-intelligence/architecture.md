# Product Intelligence Platform — Architecture

## Overview

The Enterprise Product Intelligence Platform (EPIP) is the institutional memory of Perionyx. It captures every conversation, interview, meeting, customer discussion, advisory session, design partner review, and product decision as structured, searchable knowledge.

## Core Philosophy

- **Not a CRM**: CRM is about leads and sales. EPIP is about knowledge and product decisions.
- **Not a sales pipeline**: No deal stages or revenue tracking.
- **Not a contact database**: People are contributors of knowledge, not just contacts.
- **Institutional memory**: Every feature should trace back to who requested it, why, and which evidence supports it.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│              EnterpriseProductIntelligenceService          │
│                      (Facade Pattern)                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │ ProductIntelligence  │  │   KnowledgeSearchService │   │
│  │    Repository        │  │     (Search Engine)     │   │
│  │  (Data Store)        │  └─────────────────────────┘   │
│  └─────────┬───────────┘                                 │
│            │                                              │
│  ┌─────────┴───────────┐  ┌─────────────────────────┐   │
│  │  18 In-Memory Maps   │  │  ProductAnalyticsService │   │
│  │  (Persons, Evidence, │  │   (Analytics Engine)    │   │
│  │   Conversations...)  │  └─────────────────────────┘   │
│  └─────────────────────┘                                 │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                      Domain Model                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Person ─── Organization                                  │
│     │                                                     │
│     ├── Conversation (LinkedIn, WhatsApp, Email, Zoom...) │
│     ├── ResearchSession (Discovery calls, Interviews)     │
│     ├── Contribution (Ideas, feedback, pain points)      │
│     ├── Evidence (Structured problem validation)         │
│     ├── Validation (Feature approval/rejection)          │
│     └── AdvisoryProfile (Engagement scores)              │
│                                                          │
│  Problem ──── Opportunity                                  │
│     │                                                     │
│     ├── FeatureRequest (Validated product features)       │
│     ├── RoadmapItem (Scheduled implementation)            │
│     ├── Recommendation (Prioritized actions)              │
│     └── BusinessImpact (Quantified value)                  │
│                                                          │
│  Workflow ─── WorkflowPainPoint ─── WorkflowImprovement   │
│                                                          │
│  ModuleReference (Product module catalog)                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Design Patterns

### Repository Pattern
`ProductIntelligenceRepository` provides CRUD operations for all entity types over in-memory Maps. Designed to be swapped to persistent storage (Prisma) in production.

### Facade Pattern
`EnterpriseProductIntelligenceService` is the single entry point. It delegates to the repository for storage and to specialized services for search and analytics.

### Event-driven Architecture
The platform captures all knowledge as timestamped entities. Future extensions will emit events on entity creation for downstream consumers.

## Entity Relationships

```
Person ──1:N──> Conversation
Person ──1:N──> Contribution
Person ──1:N──> ResearchSession (as participant)
Person ──1:1──> AdvisoryProfile
Person ──N:M──> Evidence (as supporter)
Person ──N:M──> FeatureRequest (as requester/validator)
Person ──N:M──> Validation (as validator)

Contribution ──N:M──> Evidence
Contribution ──N:M──> FeatureRequest
Contribution ──N:M──> ModuleReference

Evidence ──N:M──> Problem
Evidence ──N:1──> Frequency
Evidence ──N:1──> Severity

FeatureRequest ──N:1──> Validation
FeatureRequest ──N:M──> RoadmapItem

Problem ──N:1──> Opportunity

Organization ──1:N──> Person
```

## Key Design Decisions

1. **In-memory by default**: Enables rapid iteration. Repository interface supports swapping to Prisma without changing service logic.
2. **Single service facade**: All operations go through `EnterpriseProductIntelligenceService`. Prevents circular dependencies and provides a clean API.
3. **Separate search service**: `KnowledgeSearchService` encapsulates all search logic, keeping the main service focused on knowledge management.
4. **Separate analytics service**: `ProductAnalyticsService` computes all aggregations and reports.
5. **Strong typing**: Every entity is fully typed with unions for constrained fields.
6. **No UI coupling**: The platform exposes a clean programmatic API. UI is a separate concern.
