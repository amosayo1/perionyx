---
title: "Architectural Debt Report — Phase 25.5"
created: 2026-07-27
updated: 2026-07-27
tags: [type/report, domain/architecture, status/complete]
owner: Architecture Team
---

## Known Debt (Immediate)

1. Foundation platform zero adoption (23 files, ~1,500 lines dead code)
2. Runtime Context zero consumers (AsyncLocalStorage not wired)
3. Persistence abstraction unused (31 files, zero consumers)
4. In-memory stores (6+ modules, business data lost on restart)
5. Duplicate workflow engines (2 systems)
6. Duplicate currency/Fx services (FALLBACK_RATES duplicated)
7. 763 `as any` assertions
8. Broken webhook signature verification
9. Plaintext passwords in identity module
10. formatCurrency is USD-only

## Hidden Debt (Discovered in Review)

11. Company model 346-field God Object
12. 68 Math.round calls bypassing financialRound
13. Zero soft delete on all models
14. Optimistic locking on only 5/389 models
15. No data retention/archival policy
16. No partitioning strategy for time-series tables
17. CapabilityRegistry health polling measures ~0ms latency
18. ConfigurationRuntime cache invalidation is over-broad
19. ClassificationRegistry uses hardcoded role hierarchy
20. MFA secret stored in plaintext

## Future Debt (Inevitable if Unaddressed)

21. Schema growth rate (~28 models/month) without partitioning
22. No E2E test coverage for critical workflows
23. No real SSO implementation (enterprise blocker)
24. No storage/documents integration (AP blocker)
25. No payment rail integration (executePayment is fake)
26. In-memory search resets on restart
27. In-memory session manager is unused dead code
28. 32 module-level singletons prevent DI and testing
29. No module registry (67 modules, no index)
30. docs/site/ pollutes typecheck with 8 errors

## Governance Debt

31. EDL governance covers design tokens but not constitutional laws
32. No architectural lint rules for Law 1/3/11/13
33. CONTRIBUTING.md and README.md have inconsistent tooling references (npm vs pnpm)
34. AGENTS.md is 700+ lines without TL;DR

## Priority Summary

| Priority | Count | Total Effort |
|----------|-------|-------------|
| P0 | 5 | ~16-22w |
| P1 | 12 | ~25-35w |
| P2 | 8 | ~12-16w |
| P3 | 5 | ~3-4w |
| Total | 30 | ~56-77w |
