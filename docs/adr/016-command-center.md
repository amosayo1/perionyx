# ADR-016: Command Center (Persona System)

**Status**: Ratified  
**Date**: June 2025  
**Author**: Architecture Team  

## Context

Different users need different information from an AI financial assistant. A CEO needs executive summaries; a Treasurer needs cash positions; a Risk Officer needs threat detection. One-size-fits-all AI responses serve no one well.

## Decision

Implement an **8-persona system** that adapts AI responses to the user's role:

- **CEO**: Strategic overview, revenue, growth, board-level metrics
- **CFO**: Financial health, liquidity, risk, reporting, compliance
- **Treasurer**: Cash position, FX, banking, wallet balances, transfers
- **Risk Officer**: Threat detection, incidents, policy violations, anomalies
- **Compliance Officer**: Regulatory, audit readiness, policy enforcement
- **Auditor**: Transaction tracing, controls, ledger, reconciliation
- **Developer**: API, integrations, debugging, connector health
- **Finance Manager**: Budget, AP/AR, approvals, operations

### Implementation
- Persona profiles stored in `command-center.ts` with priorities, focus modules, and system prompts
- Persona passed through API in conversation creation and message sending
- System prompt dynamically constructed based on selected persona
- Suggested questions adapt to persona (5 questions per persona, 40 total)

## Consequences

- **Positive**: Tailored responses for each user role
- **Positive**: Suggested questions guide users to relevant queries
- **Positive**: Persona can be changed mid-conversation
- **Negative**: 8 personas to maintain as the platform grows
- **Negative**: Persona selection adds UI complexity

## Alternatives Considered

1. **Dynamic persona detection (AI decides)**: Rejected — unpredictable, may guess wrong
2. **Single persona for all**: Rejected — insufficient for diverse enterprise roles
3. **User-configurable only (no presets)**: Rejected — too much effort for new users
