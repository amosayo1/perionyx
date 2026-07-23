---
id: principles
title: AI Principles
sidebar_label: Principles
---

# AI Principles

## AI Development Principles (from the Engineering Constitution)

### Governance-Aware AI

AI capabilities (Enterprise Intelligence, Copilot, Decision Intelligence) must operate within the same governance framework as human operators. AI-recommended actions must be auditable, reversible, and subject to the same approval workflows.

### Read-Optimized by Default

AI components must read financial data through the existing service layer, respecting tenant isolation and row-level security. AI must never bypass the service layer to query the database directly.

### No Autonomous Financial Writes

AI must never write financial data autonomously. All AI-generated transaction proposals must be reviewed and approved through the approval workflow engine before execution.

### Explainable Recommendations

AI-generated insights, risk assessments, and recommendations must include sufficient context for human decision-makers to understand the rationale. Black-box financial decisions are unacceptable.

---

## AI Integration Rules (from the AI Engineering Playbook)

### Enterprise Intelligence Integration

**Rule:** Integrate Enterprise Intelligence when the feature involves data analysis, anomaly detection, or financial insight generation.

**Why:** Enterprise Intelligence is the platform's capability for governance-aware AI. Every new data analysis feature should leverage it rather than creating separate analysis logic.

**Implementation:**
- New dashboards, reports, or insight generators should use `EnterpriseIntelligenceService` for data access.
- AI-generated insights must include confidence scores and supporting evidence.
- All EI-generated outputs must be auditable.

### Decision Intelligence Integration

**Rule:** Integrate Decision Intelligence when the feature involves recommending financial actions.

**Why:** Decision Intelligence provides risk assessment, recommendation scoring, and governance-aware action proposals. Bypassing it for recommendation features fragments the decision framework.

**Implementation:**
- Financial action recommendations (transfers, approvals, policy changes) must go through DecisionIntelligenceService.
- Decision Intelligence recommendations must be logged in the audit trail.
- All recommended actions must pass through the approval workflow before execution.

### Copilot Integration

**Rule:** Integrate Copilot when the feature provides conversational or natural language access to financial data.

**Why:** Copilot is the platform's natural language interface. Every new conversational capability should extend Copilot rather than creating a standalone chatbot.

**Implementation:**
- New conversational capabilities must be added as Copilot tools, not as separate endpoints.
- Copilot tools must respect the same RBAC, tenant isolation, and audit requirements as the UI.
- Copilot tools must read through the service layer.

---

## Enterprise Intelligence Checklist

| # | Question | Required |
|---|----------|----------|
| 9.1 | Does the implementation read financial data through the service layer (not direct DB access for EI)? | Yes |
| 9.2 | Does the implementation respect tenant isolation and RLS? | Yes |
| 9.3 | Are AI-generated insights explainable and auditable? | Yes |
| 9.4 | Does the implementation avoid autonomous financial writes by AI components? | Yes |
| 9.5 | Are AI-recommended actions subject to approval workflows? | Yes |

## Decision Intelligence Checklist

| # | Question | Required |
|---|----------|----------|
| 10.1 | Are financial action recommendations going through DecisionIntelligenceService? | Yes |
| 10.2 | Are recommendations logged in the audit trail? | Yes |
| 10.3 | Do recommended actions pass through approval workflow before execution? | Yes |
| 10.4 | Are confidence scores and supporting evidence included with recommendations? | Yes |
