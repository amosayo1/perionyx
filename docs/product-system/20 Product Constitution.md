# 20 — Product Constitution

**Product System · Document 20 of 20**
**Authority: Product Constitution is the highest product authority in Perionyx — the values, non-negotiables, and commandments that govern every product decision. It consolidates the Philosophy (01), Product Principles (02), and the per-domain specifications (03–19) into one binding instrument.**
**Sources: The Vision (00) and Philosophy (01); Product Principles (02, all 18 domains); Finance Principles (04); Procurement Principles (05); Decision Intelligence (06); the Platform Constitution (Phase 23.0); the AI Behaviour Guide; the four-product research program.**

---

## 1. Preamble

Perionyx builds the Enterprise Financial Operating System. It is governed by two constitutions:

- **The Platform Constitution** (docs/platform/) governs *how systems are built* — architecture, security, data, deployment.
- **The Product Constitution** (this document) governs *what users experience* — decisions, surfaces, trust, and finance.

Where they meet, they agree: **financial integrity is never compromised** (Law 6), **trust is the floor** (PP-146), and **the human is the authority** (PP-102).

## 2. The Values

1. **Trust** — every number has a source; every state has an explanation (PP-146).
2. **Clarity** — every screen answers one question (PP-048).
3. **Speed** — CFOs don't wait (PP-128).
4. **Precision** — money is exact, always (F-01).
5. **Confidence** — measured, earned, never fake (PP-109).
6. **Velocity** — operators move at keyboard speed (PP-116).
7. **Sovereignty** — tenant data is sacred (PP-021).
8. **Evidence** — every claim is grounded (PP-105).
9. **Restraint** — omission is design (PP-041).
10. **Accountability** — every action is audited (PP-165).

## 3. The Non-Negotiables

The following cannot be traded away, at any cost, for any customer, in any phase:

1. **The human is the financial authority.** AI explains; it never decides (PP-102).
2. **AI never fabricates.** No invented numbers, sources, or citations (PP-108).
3. **AI never hides reasoning.** Reasoning is always visible and storable (PP-110).
4. **Money is never silent.** Every financial action is visible, confirmed, and audited (PP-160, F-18).
5. **Money is exact.** Decimal(38,12), banker's rounding, explicit residuals (F-01).
6. **Retry never double-executes.** Idempotency is universal on money (F-05).
7. **Doubt fails closed.** If a financial action's outcome is uncertain, it does not happen (F-10).
8. **The audit trail is append-only and tamper-evident.** Never edited, never deleted (F-08).
9. **No one approves their own money movement.** SoD and dual signature hold (F-13, F-17).
10. **Tenant isolation is absolute.** No cross-tenant learning, ever (PP-021, Law 11).
11. **Accessibility is a release gate.** WCAG 2.1 AA or nothing (PP-113).
12. **Verification is a gate.** Typecheck, build, test, and the Security Review before any commit (AGENTS.md).

## 4. The Commandments

**Of Decisions**
1. Every screen answers one question (PP-048).
2. Dashboards are decision surfaces, not posters (PP-055).
3. Every metric carries value, source, delta, timestamp (PP-044).
4. Every recommendation carries claim, sources, reasoning, confidence, alternatives (PP-104).
5. Confidence is categorical and measured: Approve / Reject / Needs-review (PP-109).

**Of Finance**
6. The ledger is the authority (F-02).
7. Money is server-confirmed; views are optimistic (F-11, 01 Money-Boundary).
8. Destructive actions confirm; irreversible actions elevate (PP-163, PP-164).
9. Approvals route by matrix and enforce SoD (PP-162, F-14).
10. SKIPPED is not APPROVED (PR-25).

**Of Work**
11. Workflows are explicit state machines (PP-094).
12. Work Queues answer "what requires me?" (PP-049).
13. Exceptions are work, not noise (PP-099).
14. Work is never lost; autosave and drafts hold (PP-089).

**Of Craft**
15. Motion communicates state; it never decorates (PP-122).
16. Motion, color, and typography come from the EDL tokens — never hardcoded (PP-123, PP-219).
17. Density is a preference, never a guess (PP-069).
18. Empty states teach (PP-078, PP-040).

**Of Engineering**
19. Nothing ships unverified (PP-130).
20. Every shared capability is implemented once, centrally (PP-131, Principle #20).
21. A prohibited pattern is named so it can be refused (PP-147).
22. The constitution evolves through process, not convenience (Law 15).

## 5. Conflict Resolution

When two doctrines conflict, the resolution order is:

1. **Non-negotiables** (§3) — absolute.
2. **Trust over momentum** — when speed and confidence conflict, confidence wins (01, Trust-and-Momentum).
3. **Financial integrity over product convenience** (Law 6).
4. **The human over the machine** (PP-102).
5. **The specific over the general** — Finance Principles (04) and Procurement Principles (05) refine Product Principles (02) within their domains.
6. **Evidence over opinion** — when two positions conflict, the one with customer evidence and tests wins (PP-130, Lesson 42).

## 6. Governance

- The Product Constitution is amended only through process: proposal → evidence → review → recorded decision (Law 15).
- The 300 Product Principles (02) are the operational body; this constitution is their spine.
- Every product review cites the governing principle (PP-147).
- The constitution is verified, like the platform: claims without tests are hypotheses (Lesson 42).

## 7. Epilogue

The four products we studied taught us different things: Stripe taught trust, Linear taught velocity, Ramp taught the intelligence layer, Coupa taught the lifecycle. Perionyx is the synthesis: **confidence first, then momentum; adopt the lifecycle, reject the data moat, surpass on trust.** This constitution is the covenant that holds the synthesis — and it binds every product decision, every phase, and every line we ship.

*This is the capstone of the Product System. It consolidates 00–19 and, with the Platform Constitution, governs Perionyx.*
