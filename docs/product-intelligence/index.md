# Product Intelligence Platform Documentation

## Overview

The Enterprise Product Intelligence Platform (EPIP) captures every conversation, interview, meeting, customer discussion, advisory session, design partner review, and product decision as structured, searchable knowledge.

## Contents

### Architecture & Design
- [Architecture Overview](architecture.md)
- [Domain Model](domain-model.md)
- [Contribution Model](contribution-model.md)
- [Evidence Model](evidence-model.md)

### Guides
- [Research Guide](research-guide.md)
- [CRM Guide](crm-guide.md)
- [Developer Guide](developer-guide.md)
- [Operations Guide](operations-guide.md)

### Reports
- [Architecture Review](architecture-review.md)
- [Enterprise Product Intelligence Report](enterprise-product-intelligence-report.md)

## Quick Start

```typescript
import { EnterpriseProductIntelligenceService } from "@/server/product-intelligence";
import { importInitialData } from "@/server/product-intelligence/initial-import";

const epip = new EnterpriseProductIntelligenceService();
importInitialData(epip);

// Search
const results = epip.search.search("reconciliation");

// Analytics
const summary = epip.analytics.getSummary();

// Report
console.log(epip.generateReport());
```

## Source Structure

```
src/server/product-intelligence/
├── types.ts                         — All domain types (30+ entities)
├── repository.ts                    — Data access (Repository pattern)
├── product-intelligence.service.ts  — Main facade
├── search.service.ts                — Knowledge search
├── analytics.service.ts             — Product analytics
├── initial-import.ts                — Bootstrap import
└── index.ts                         — Barrel export
```
