# Enterprise Relationship Intelligence Architecture

## Overview

Perionyx's CRM is not a marketing CRM or sales CRM. It is a **founder relationship operating system** designed for:

- **Relationship Intelligence** — track relationship strength, health, and strategic value
- **Voice of Customer** — capture structured product intelligence from every conversation
- **Pain Point Intelligence** — categorize and trend finance/accounting pain points
- **Product Discovery** — manage discovery sessions with structured outcomes
- **Knowledge Graph** — connect people, companies, pain points, ERPs, and workflows

## Architecture

### Layer Diagram

```
┌─────────────────────────────────────────────────────┐
│                    UI Pages                          │
│  /crm (dashboard)                                    │
│  /crm/contacts                                       │
│  /crm/voice-of-customer                              │
│  /crm/pain-points                                    │
│  /crm/discovery                                      │
│  /crm/knowledge-graph                                │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│                  API Routes                          │
│  /api/crm/contacts                                   │
│  /api/crm/insights                                   │
│  /api/crm/pain-points                                │
│  /api/crm/discovery                                  │
│  /api/crm/knowledge-graph                            │
│  /api/crm/analytics                                  │
│  /api/crm/search                                     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│                  Service Layer                       │
│  CRMService (core CRUD)                              │
│  RelationshipIntelligenceService (analytics/search)  │
│  VoiceOfCustomerService (VoC insights)               │
│  PainPointService (pain point taxonomy)              │
│  ProductDiscoveryService (discovery sessions)         │
│  KnowledgeGraphService (graph connections)            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│                Prisma Persistence                    │
│  11 models, 20 enums, 30+ indexes                    │
│  Schema: prisma/schema.prisma (lines 9252+)          │
│  Migration: 20260720000000_enterprise_relationship   │
└─────────────────────────────────────────────────────┘
```

### Prisma Models

| Model | Table | Description |
|-------|-------|-------------|
| Contact | `crm_contacts` | Core person record with relationship intelligence |
| ProfessionalProfile | `crm_professional_profiles` | 1:1 professional background (Section 2) |
| Interaction | `crm_interactions` | Contact interactions / conversations |
| Opportunity | `crm_opportunities` | Partnership and engagement opportunities |
| Task | `crm_tasks` | Follow-up tasks and action items |
| ContactIntelligence | `crm_contact_intelligence` | AI/person-generated intelligence |
| VoiceOfCustomerInsight | `crm_voc_insights` | Structured VoC insights (Section 3) |
| PainPoint | `crm_pain_points` | Pain point taxonomy and instances (Section 4) |
| ProductDiscoverySession | `crm_discovery_sessions` | Discovery session records (Section 6) |
| TimelineEvent | `crm_timeline_events` | Timeline of events (Section 7) |
| CrmKnowledgeLink | `crm_knowledge_graph` | Knowledge graph edges (Section 8) |

### Key Design Decisions

1. **No duplication**: All models extend the existing CRM foundation. The in-memory `CRMStore` was replaced with Prisma persistence.
2. **Enum mapping**: TypeScript uses lowercase-kebab-case (e.g., `"discovery-conversation"`) while Prisma stores UPPER_SNAKE_CASE (e.g., `"DISCOVERY_CONVERSATION"`). `toPrismaEnum()` and `fromPrismaEnum()` handle conversion.
3. **Json fields**: Arrays and complex objects use Prisma `Json` type (PostgreSQL jsonb) for flexibility — `expertise`, `tags`, `previousRoles`, `supportingQuotes`, etc.
4. **Self-referencing graph**: `CrmKnowledgeLink` references `Contact` twice (source/target) using named relations `"SourceContact"` and `"TargetContact"`.
5. **Soft delete**: Contacts use `status = ARCHIVED` instead of hard deletion.
6. **Relation integrity**: Most child models cascade delete with Contact; `KnowledgeGraphLink.targetContact` uses `SetNull`.

## Services

### CRMService (`crm.service.ts`)
Core CRUD for contacts, interactions, opportunities, tasks, and intelligence. Replaces the previous in-memory implementation.

### RelationshipIntelligenceService (`relationship-intelligence.service.ts`)
Analytics, search, dashboard data, and full-contact profile aggregation.

### VoiceOfCustomerService (`voice-of-customer.service.ts`)
Structured insight management, feature request aggregation, interview activity tracking.

### PainPointService (`pain-point.service.ts`)
Pain point taxonomy CRUD, trend analysis, industry/role/geography filtering.

### ProductDiscoveryService (`product-discovery.service.ts`)
Discovery session management, workflow/automation insight aggregation.

### KnowledgeGraphService (`knowledge-graph.service.ts`)
Graph link CRUD, contact-centric graph queries, full graph data for visualization.

## API Routes

All routes follow the pattern from `src/app/api/agents/route.ts`:
- Auth via `auth()` + `requireTenantContext()`
- Error handling via `handleRouteError()` / `zodErrorResponse()`
- JSON responses via `NextResponse.json()`

| Route | Methods |
|-------|---------|
| `/api/crm/contacts` | GET (list with filters), POST (create) |
| `/api/crm/contacts/[id]` | GET (full profile), PUT (update), DELETE (archive) |
| `/api/crm/insights` | GET (list), POST (create), PUT (update) |
| `/api/crm/pain-points` | GET (list), POST (create), PUT (update), DELETE |
| `/api/crm/discovery` | GET (list), POST (create), PUT (update) |
| `/api/crm/knowledge-graph` | GET (list/graph), POST (create), DELETE |
| `/api/crm/analytics` | GET (full analytics aggregated) |
| `/api/crm/search` | GET (?q= with optional filters) |
| `/api/crm/seed` | POST (development seeding) |

## Navigation & Permissions

- **Sidebar section**: "Relationship Intelligence" — 6 items (Dashboard, Contacts, VoC, Pain Points, Discovery, Knowledge Graph)
- **Permission**: `crm.view` (view access), `crm.manage` (create/update), `crm.delete`, `crm.seed`
- **Min role**: ADMIN
- **Icon**: Users

## Extension Guide

### Adding a new contact field

1. Add column to `model Contact` in `prisma/schema.prisma`
2. Add field to `CRMContact` interface in `src/modules/crm/types.ts`
3. Update `mapContactFromPrisma()` in `crm.service.ts`
4. Create migration: `npx prisma migrate dev --name add_field_x`

### Adding a new pain point category

1. Add value to `enum PainPointCategory` in schema
2. Add value to `PainPointCategory` type union in types.ts
3. Add mapping in `fromPrismaCategory()` / `toPrismaCategory()` in `pain-point.service.ts`
4. Create migration

### Adding a new analytics metric

1. Add method to `RelationshipIntelligenceService`
2. Add endpoint in `/api/crm/analytics/route.ts`
3. Add card to the dashboard page

### Consuming CRM data from another module

```typescript
import { CRMService } from "@/modules/crm";
import { relationshipIntelligenceService } from "@/modules/crm/relationship-intelligence.service";

const crm = new CRMService();
const contacts = await crm.getAllContacts();
const analytics = await relationshipIntelligenceService.getRelationshipAnalytics();
```

## Migration Guide (from in-memory to Prisma)

The previous CRM implementation used in-memory `Map` stores. Phase 15.6 migrated to Prisma persistence.

### Data Migration

Run the seed endpoint to restore existing contacts:

```bash
curl -X POST http://localhost:3000/api/crm/seed
```

This calls `seedCrmData()` which recreates all 19 contacts with interactions, opportunities, tasks, and intelligence.

### Breaking Changes

- `CRMService` methods are now **async** (return Promises). Existing sync callers must add `await`.
- `CRMService` is no longer a singleton — each consumer gets a fresh instance backed by Prisma.
- The `CRMStore` interface is deprecated.
