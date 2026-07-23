# ADR-029: AI Governance — Deterministic Financial Facts, AI Only Explains

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

Enterprise financial platforms face a fundamental tension: AI can make users more productive by explaining data, detecting anomalies, and recommending actions, but AI hallucinations in financial context are unacceptable. An AI that fabricates a transaction amount, invents an approval status, or suggests an incorrect journal entry could cause real financial harm and fail every audit.

Previous ADR-010 established the AI Copilot architecture with grounded generation and offline fallback. This ADR extends that with the governance framework that separates deterministic financial facts from AI-generated commentary.

## Problem

How do we provide AI-powered financial intelligence without ever allowing AI to become the system of financial record?

## Decision

Establish a **strict separation of concerns** between deterministic systems (which produce financial facts) and AI systems (which provide commentary, explanation, and recommendations).

### The Principle

> **Financial facts are always produced by deterministic systems. AI may explain, summarize, recommend, or investigate those facts, but it must never become the system of financial record.**

### Separation of Concerns

| System | Role | Examples | Trust Model |
|--------|------|----------|-------------|
| **Deterministic** | Produce, store, and verify financial facts | Double-entry ledger, journal entries, transaction records, audit logs, risk scores, compliance checks | Source of truth — immutable, auditable, verifiable |
| **AI** | Explain, summarize, recommend, investigate | Natural language insights, trend commentary, anomaly explanations, action recommendations | Advisory — labeled as AI-generated, evidence-cited, confidence-rated |

### What AI May Do

| Capability | Governance | Enforcement |
|------------|------------|-------------|
| Explain financial data | Must cite data sources with module, record ID, field | `evidence` array required in all responses |
| Summarize trends | Must indicate data freshness and scope | Confidence scoring + staleness labels |
| Recommend actions | Must include evidence chain and confidence level | `recommendedActions` with `href` and `description` |
| Investigate anomalies | Must trace through actual audit trail records | Timeline engine uses database records only |
| Generate commentary | Must distinguish AI text from deterministic output | Label: "AI-generated analysis" on every output |

### What AI May Never Do

| Activity | Risk | Enforcement |
|----------|------|-------------|
| Produce journal entries | AI-created financial records | No write access to ledger module APIs |
| Approve transactions | Unauthorized financial action | Approval engine requires human actor authentication |
| Modify financial records | Breaking immutable audit trail | Append-only ledger, no mutation APIs |
| Generate financial statements as records of truth | False financial reporting | Statement generation is template-based from deterministic ledger queries |
| Fabricate data not in platform | Hallucination risk | Knowledge Index constraint + no-citation rule |

### Human Approval Requirement

All financial actions require explicit human approval:

```typescript
// AI can recommend
interface AISuggestion {
  action: "approve_transaction" | "create_journal" | "flag_anomaly";
  targetId: string;
  evidence: Evidence[];
  confidence: "high" | "medium" | "low";
}

// Human must execute
interface HumanAction {
  action: "approved" | "rejected" | "modified";
  actorId: string;
  timestamp: string;
  reason?: string;
  // Recorded in audit trail
}
```

### Evidence Chain

Every AI output that references platform data must include an evidence chain:

```typescript
interface Evidence {
  sourceModule: string;   // Prisma module name
  sourceId: string;       // Database record ID
  sourceField?: string;   // Specific field (optional)
  sourceLabel: string;    // Human-readable label
  sourceTimestamp: string; // When the data was retrieved
  sourceScoreType: string; // "database_query" | "cached_query" | "calculated_metric" | etc.
  confidence: "high" | "medium" | "low";
}
```

### Confidence Scoring

| Level | Criteria | UI |
|-------|----------|-----|
| **high** | Live Prisma query result | Green indicator |
| **medium** | Cached or computed result | Amber indicator |
| **low** | AI general knowledge (not platform-specific) | Red indicator with warning |
| **simulated** | Sandbox/demo environment data | Gold indicator |

### Audit Trail Integration

All AI interactions that reference financial data are logged:

- Prompt and response (for investigation)
- Data sources cited (for verification)
- User identity and timestamp (for audit)
- Confidence scores (for trust assessment)

## Alternatives Considered

1. **AI-autonomous financial operations**: Rejected — unacceptable audit and fiduciary risk; no financial regulator would permit it
2. **Full AI with human review of all outputs**: Rejected — review of AI-generated financial data creates false sense of security; humans tend to trust AI outputs
3. **No AI at all**: Rejected — AI provides significant value for data explanation, anomaly detection, and productivity — the governance framework enables safe use

## Consequences

- **Positive**: Financial records remain trustworthy and auditable — AI cannot corrupt them
- **Positive**: Users get AI productivity benefits without fiduciary risk
- **Positive**: Clear boundaries for engineering teams — no ambiguity about what AI code may do
- **Positive**: Audit trail of all AI interactions enables post-hoc review
- **Negative**: AI cannot automate financial actions — every journal entry needs a human
- **Negative**: Users may find the "AI cannot do that" boundary frustrating
- **Negative**: Requires discipline to maintain separation — any new feature must be classified as deterministic or AI

## Future Considerations

- Regulated environments may permit AI-assisted journal entry generation with dual human approval
- Expansion of AI recommendation scope as trust models mature
- Integration of external AI providers must follow the same governance framework
- Periodic governance review as AI regulation evolves
