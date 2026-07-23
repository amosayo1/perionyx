# Developer Guide

## Adding a New Person

```typescript
const epip = new EnterpriseProductIntelligenceService();

const person = epip.addPerson({
  name: "Jane Doe",
  role: "Finance Manager",
  seniority: "finance-manager",
  personType: "customer",
  relationshipStage: "discovery",
  organizationId: org.id,
  industry: "financial-services",
  country: "uae",
  region: "middle-east",
  financeSpecializations: ["treasury", "reconciliation"],
  erpExperience: ["sap", "odoo"],
  notes: "Interested in treasury automation",
  tags: ["Treasury", "Design Partner Candidate"],
});
```

## Recording a Conversation

```typescript
const conv = epip.addConversation({
  type: "discovery-call",
  channel: "zoom",
  personId: person.id,
  direction: "inbound",
  sentiment: "positive",
  subject: "Treasury workflow discovery",
  summary: "Jane described her team's manual cash reconciliation process",
  keyInsights: [
    "Bank reconciliation takes 3 days per month",
    "Uses 4 different bank portals",
    "Wants automated matching",
  ],
  actionItems: ["Send product overview", "Schedule follow-up demo"],
  durationMinutes: 45,
});
```

## Capturing a Contribution

```typescript
epip.addContribution({
  personId: person.id,
  conversationId: conv.id,
  type: "problem-identified",
  domain: "treasury",
  problem: "Bank reconciliation requires manual portal access to 4 different banks",
  gap: "No single view of all bank accounts",
  suggestedSolution: "Unified bank reconciliation dashboard with automated statement import",
  moduleIds: [reconciliationModuleId, treasuryModuleId],
  evidenceLevel: "single-source",
  confidence: "high",
  roadmapCandidate: true,
  publicCreditAllowed: true,
});
```

## Creating Evidence

```typescript
epip.addEvidence({
  problem: "Bank reconciliation requires access to 4 different bank portals",
  currentWorkflow: "Login to each bank, download statements, import to Excel, match manually",
  currentWorkaround: "Dedicated staff member spends 3 days/month on reconciliation",
  businessImpact: "3 days/month of senior accountant time, delayed close, error-prone",
  frequency: "monthly",
  severity: "high",
  suggestedImprovement: "Automated bank statement aggregation with rule-based matching",
  supportingPersonIds: [person.id],
  supportingIndustries: ["financial-services"],
  supportingCountries: ["uae"],
  moduleIds: [reconciliationModuleId, treasuryModuleId],
  confidenceScore: 7,
});
```

## Searching Knowledge

```typescript
// Search across all entities
const results = epip.search.search("reconciliation");

// Search by person
const byPerson = epip.search.searchByPerson("Muhammed Jamsheed");

// Search by module
const byModule = epip.search.searchByModule("Inventory");

// Search by industry
const byIndustry = epip.search.searchByIndustry("agriculture");

// Search by problem text
const byProblem = epip.search.searchByProblem("spreadsheet");
```

## Running Analytics

```typescript
const summary = epip.analytics.getSummary();
const topFeatures = epip.analytics.getMostRequestedFeatures(10);
const topProblems = epip.analytics.getMostCommonProblems(10);
const leaderboard = epip.analytics.getContributionLeaderboard();
const heatMap = epip.analytics.getEvidenceHeatMap();
```

## Generating a Report

```typescript
const report = epip.generateReport();
console.log(report);
```

## Full Initialization

```typescript
import { EnterpriseProductIntelligenceService } from "@/server/product-intelligence";
import { importInitialData } from "@/server/product-intelligence/initial-import";

const epip = new EnterpriseProductIntelligenceService();
importInitialData(epip);
```
