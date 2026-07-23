---
id: future-roadmap
title: Future Roadmap
sidebar_label: Future
---

# Future Roadmap

This page tracks upcoming development phases and planned features for the Perionyx platform.

---

## Immediate Next Steps

### Phase 8+ Features
1. Version diff/comparison to workflow detail page
2. Analytics drill-down: click charts → see per-instance details
3. Wire onboarding wizard step execution to actual module APIs
4. Unit tests for all onboarding module classes and readiness service
5. Distributed rate limiting + Postgres read replicas

### Phase 8B Planned Work
1. Implement Redis for distributed rate limiting + caching
2. Add Postgres read replicas for GET endpoints
3. Add ETag support for entity endpoints
4. Implement response compression (Accept-Encoding: gzip)
5. Add response streaming for AI and analytics endpoints
6. Move sync background jobs to PgBoss queue
7. Build EnterpriseButton, EnterpriseInput, EnterpriseCard, EnterpriseBadge primitives on design tokens (8B.6 post-v1)
8. Arabic RTL Phase 1-4 (see `docs/i18n/localization-strategy.md`)
9. i18n integration into enterprise table/analytics/forms components
10. Native push notifications with deep linking for mobile
11. Offline action queue — persist approvals when offline, sync on reconnect
12. iOS/Android home screen widgets for cash position

---

## Upcoming Phases

### Phase 9C — Investments
- Investment portfolio management
- Asset allocation tracking
- Performance analytics
- Risk-adjusted returns

### Phase 9D — Risk
- Enterprise risk management framework
- Risk scoring and assessment
- Counterparty risk monitoring
- Exposure tracking and alerts

### Phase 9E — Compliance
- Regulatory compliance automation
- Policy enforcement monitoring
- Audit readiness scoring
- Reporting for SOX, GDPR, PCI DSS

### Phase 9F — Executive AI
- AI-powered financial insights
- Predictive analytics for cash flow
- Anomaly detection across all financial data
- Natural language financial reporting

---

## Localization

### Arabic RTL (Phases 1-4)
- Phase 1: Layout infrastructure (direction, text alignment, RTL-aware utilities)
- Phase 2: Core components (forms, tables, navigation, dialogs)
- Phase 3: Complex components (charts, workflow canvas, dashboards)
- Phase 4: Content translation and validation

See `docs/i18n/localization-strategy.md` for full details.

---

## Infrastructure Evolution

- Redis for distributed rate limiting + caching
- Postgres read replicas for GET endpoints
- ETag support for entity endpoints
- Response compression (gzip)
- Response streaming for AI and analytics
- PgBoss queue for sync background jobs

---

## Design System Evolution

- EnterpriseButton, EnterpriseInput, EnterpriseCard, EnterpriseBadge primitives
- Design token system
- Component library documentation
- Storybook integration

---

## Mobile Evolution

- Native push notifications with deep linking
- Offline action queue for approvals
- iOS/Android home screen widgets
- Biometric authentication

---

*This roadmap is subject to change based on customer feedback, business priorities, and technical discoveries.*
