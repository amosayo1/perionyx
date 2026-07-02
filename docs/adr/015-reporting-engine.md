# ADR-015: Reporting Engine

**Status**: Draft  
**Date**: March 2025  
**Author**: Architecture Team  

## Context

Enterprise financial platforms require reporting capabilities — predefined reports, custom reports, scheduled distribution, and multiple export formats.

## Decision

(Design phase — this ADR documents the planned approach.)

Implement a **template-based reporting engine** with:

- **Report templates**: Predefined layouts for Treasury Summary, Risk Report, Approval Analytics, Reconciliation Summary, Audit Report
- **Export formats**: PDF (with branding), CSV, Excel, PowerPoint, JSON
- **Scheduling**: One-time and recurring report generation with delivery
- **Distribution**: Email delivery, webhook notification, in-app download
- **Custom reports**: Planned for medium-term roadmap

### Architecture
- Reports are generated as background jobs (PgBoss)
- Templates are stored as configuration (not hardcoded)
- Data is queried at report generation time (not cached)

## Consequences

- **Positive**: Consistent report output across the platform
- **Positive**: Background generation prevents request timeouts
- **Positive**: Multiple export formats satisfy diverse enterprise requirements
- **Negative**: Report generation is resource-intensive
- **Negative**: Template customization requires development effort

## Alternatives Considered

1. **Third-party reporting tool (Metabase, Tableau)**: Rejected — embedded BI is costly, data exposure concerns
2. **Client-side report generation**: Rejected — performance, data completeness concerns
3. **No reporting (export only)**: Rejected — insufficient for enterprise requirements
