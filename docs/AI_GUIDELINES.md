# Perionyx — AI Guidelines

**Version 1.0**  
**Last Updated: July 2026**

---

## 1. AI Philosophy

The Perionyx AI (marketed as "PERIONYX Intelligence") is not a chatbot. It is an enterprise financial intelligence layer that provides explainable, actionable, and transparent insights grounded in platform data. Every AI interaction must produce responses that an auditor could review.

---

## 2. Grounded AI

### 2.1 Grounding Principle

All AI responses must be grounded in platform data. The AI may not fabricate:

- Transaction amounts, statuses, or IDs
- User names, roles, or permissions
- Wallet balances or account details
- Risk alerts or incidents
- Any data that exists in the platform's database

### 2.2 Knowledge Index

The `knowledge-index.ts` module queries all 19+ Prisma modules and provides structured summaries of what data exists. When the AI needs to know about platform data, it queries the Knowledge Index rather than generating from training data.

### 2.3 Offline Mode

When no AI API key is configured (`AI_API_KEY` environment variable is unset), the platform operates entirely offline:

- **Executive Briefing**: Generated using structured data from the Knowledge Index, formatted into the briefing template
- **Transaction Investigation**: Traced via the `timeline-engine.ts` module using actual database records
- **Data Discovery**: Returns the full Knowledge Index with module names, record counts, and summaries
- **General Queries**: Returns a structured response showing what data is available and suggesting specific queries

---

## 3. Response Structure

Every AI response must follow this structure:

```typescript
interface AIResponse {
  summary: string;                    // Brief overview (1-2 sentences)
  details: string;                    // Detailed response with data
  sources: Array<{                    // All data sources cited
    module: string;
    id: string;
    field?: string;
    label: string;
  }>;
  confidence: "high" | "medium" | "low";  // Confidence rating
  recommendedActions?: Array<{        // Suggested next steps
    label: string;
    description: string;
    href?: string;
  }>;
  followUpQuestions?: string[];       // Suggested follow-ups
}
```

---

## 4. Persona System

### 4.1 Available Personas

| Persona | Focus | Prompt Emphasis |
|---------|-------|-----------------|
| CEO | Strategic overview, revenue, growth | Executive summaries, board-level metrics |
| CFO | Financial health, liquidity, risk | Reporting, compliance, financial controls |
| Treasurer | Cash position, FX, banking | Wallets, treasury accounts, transfers |
| Risk Officer | Threat detection, incidents | Risk alerts, policy violations, anomalies |
| Compliance Officer | Regulatory, audit readiness | Audit trail, policy enforcement |
| Auditor | Transaction tracing, controls | Ledger, approval chains, reconciliation |
| Developer | API, integrations, debugging | API routes, webhooks, connector health |
| Finance Manager | Budget, AP/AR, operations | Approvals, transactions, reconciliation |

### 4.2 Persona Adaptation

The AI adapts its responses based on the selected persona:

- **Language**: Technical depth matches persona expectations
- **Data Scope**: Relevant modules are prioritized
- **Recommendations**: Actions are tailored to persona responsibilities
- **Questions**: Suggested follow-ups match persona concerns

---

## 5. Context Engine

The `context-builder.ts` module executes 19 parallel database queries to build a complete picture of the enterprise before generating responses:

```
Dashboard Stats     → Record counts per module
Wallet Balances     → All wallets with current balances
Recent Transactions → Latest N transactions
Pending Approvals   → Awaiting action
Recent Audit Logs   → Latest audit events
Open Risk Alerts    → Active risk items
Treasury Accounts   → Active bank accounts
Policies            → Active policies
Ledger Entries      → Recent postings
Reconciliation      → Latest status
Calendar Events     → Upcoming events
Notifications       → Unread notifications
User Count          → Active users
```

---

## 6. Citation Requirements

### 6.1 Source Format

Every factual claim must include one or more source citations:

```markdown
The current USD wallet balance is **$1,250,000.00**.
[Source: Wallets — wallet_abc123 — balance]
```

### 6.2 Citation Types

- **Module**: The Prisma model providing the data
- **Record ID**: The specific database record
- **Field**: The specific field containing the data
- **Timestamp**: When the data was retrieved

### 6.3 No-Citation Rule

If the AI cannot cite a source for a claim, it must not make the claim. The response should indicate what data is available rather than fabricating specifics.

---

## 7. Confidence Scoring

### 7.1 Confidence Levels

| Level | Criteria | UI Treatment |
|-------|----------|--------------|
| **high** | Data from live database query, current within seconds | Green trust indicator |
| **medium** | Data from cached query or historical snapshot | Amber trust indicator |
| **low** | Data from AI training (general knowledge), not platform-specific | Red trust indicator with warning |
| **simulated** | Data from sandbox/demo environment | Gold trust indicator |

### 7.2 Confidence Communication

Low-confidence responses must include:

> *"I'm not able to verify this information from your platform data. Please check directly in the [relevant module] for accurate information."*

---

## 8. RBAC Integration

### 8.1 Data Access

The AI only has access to data that the authenticated user can access. If a user lacks permission to view certain modules, those modules are excluded from the context and the AI will not reference them.

### 8.2 Tenant Isolation

All context queries include `companyId` filtering. The AI for Company A never sees Company B's data.

---

## 9. Prompt Principles

### 9.1 System Prompt Structure

```
You are PERIONYX Intelligence, the enterprise financial intelligence layer for [Company Name].
[Persona-specific instructions]
[Data available:]
- Wallets: [count], [total balance]
- Transactions: [count] in last 30 days
- ...
[Response format requirements]
[Citation requirements]
[Confidence requirements]
```

### 9.2 Persona System Prompt

Each persona has custom instructions injected into the system prompt:

```typescript
const personaConfig = {
  cfo: {
    priority: "Financial health, liquidity analysis, and reporting",
    focus: ["Treasury", "Transactions", "Risk", "Reconciliation"],
    prompt: "Focus on financial metrics, trends, and controls..."
  },
  treasurer: {
    priority: "Cash position, FX exposure, and banking operations",
    focus: ["Wallets", "Treasury", "Transfers", "Exchange Rates"],
    prompt: "Focus on liquidity, currency risk, and bank relationships..."
  },
  // ... 6 more personas
};
```

---

## 10. Memory & Context

### 10.1 Conversation Memory

The Copilot maintains conversation history within a session. Previous messages are included in the API call for context continuity.

### 10.2 Context Window

The conversation history is limited to the most recent N messages (configurable per deployment, default: 20).

### 10.3 No Long-Term Memory

The AI does not maintain state between conversations. Each conversation starts fresh, though the user can reference previous conversations.

---

## 11. Action Cards

When the AI identifies actionable items, it presents them as action cards:

```typescript
{
  "type": "action_card",
  "action": "approve_transaction",
  "label": "Approve TXN-001",
  "description": "$50,000 payment to Supplier A requires your approval",
  "href": "/approvals/txn_001",
  "priority": "high",
  "confidence": "high"
}
```

Action cards are rendered in the UI as interactive buttons with icons and priority indicators.

---

## 12. Recommendations

### 12.1 Proactive Recommendations

The AI generates proactive recommendations based on:

- Unusual transaction patterns
- Pending approvals approaching deadlines
- Wallet balances near thresholds
- Open risk alerts requiring attention
- Reconciliation exceptions not resolved

### 12.2 Recommendation Format

```typescript
{
  "type": "recommendation",
  "severity": "warning" | "critical" | "info",
  "title": "Large pending approval",
  "description": "Transaction TXN-001 for $50,000 has been pending for 4 hours",
  "action": { "label": "Review", "href": "/approvals/txn_001" }
}
```

---

## 13. Future AI Capabilities

| Capability | Description | Status |
|-----------|-------------|--------|
| **Multi-turn conversation** | Context-aware follow-ups across sessions | Planned |
| **Proactive alerting** | AI monitors data and pushes alerts | Planned |
| **Natural language reports** | Generate formatted reports from natural language | Planned |
| **Anomaly detection** | ML-based transaction pattern analysis | Research |
| **Cash flow prediction** | Forecast future cash positions | Research |
| **Policy suggestion** | AI recommends policy changes based on patterns | Research |
| **Automated reconciliation** | AI matches exceptions and suggests resolutions | Research |
| **Voice interface** | Natural language voice queries | Future |
