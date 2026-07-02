# ADR-007: Risk Engine

**Status**: Ratified  
**Date**: April 2024  
**Author**: Architecture Team  

## Context

Enterprises need to detect, classify, and manage financial risks. Risks come from various sources: balance anomalies, failed operations, policy violations, suspicious activity, and system errors.

## Decision

Implement a **rule-based risk management system** with:

- **Risk alerts**: Individual risk events with category (9 types), severity (LOW/MEDIUM/HIGH/CRITICAL), status lifecycle (OPEN → ACKNOWLEDGED → INVESTIGATING → RESOLVED/DISMISSED)
- **Risk incidents**: Grouped collections of related alerts with root cause, resolution tracking, and timeline
- **Alert sources**: Generated automatically by policy violations, reconciliation failures, connector errors, balance anomalies, and system events
- **Severity scoring**: Determined by financial impact, regulatory implications, and recurrence

## Consequences

- **Positive**: Comprehensive risk coverage across all financial domains
- **Positive**: Alert-to-incident grouping reduces noise
- **Positive**: Status lifecycle supports proper incident management workflows
- **Negative**: Rule-based detection may miss novel patterns (ML enhancement planned)
- **Negative**: Alert volume management required to prevent alert fatigue

## Alternatives Considered

1. **ML-only detection**: Rejected — requires labeled training data, not immediately available
2. **Third-party risk platform**: Rejected — data sovereignty, integration overhead
3. **No structured risk system**: Rejected — insufficient for enterprise financial software
