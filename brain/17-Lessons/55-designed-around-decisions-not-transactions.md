---
title: "Lesson 55 — The Best Enterprise Software Is Designed Around Decisions, Not Transactions"
created: 2026-07-28
updated: 2026-07-28
tags:
  - type/lesson
  - domain/product
  - domain/design
  - status/active
  - phase/27.1
lesson_number: 55
---

# Lesson 55 — The Best Enterprise Software Is Designed Around Decisions, Not Transactions

## Statement

The best enterprise software is designed around decisions, not transactions. Every screen must answer: what needs attention, why, what evidence exists, what decision is required, and what happens next.

## Context

Phase 27.0A produced 13 product specification documents (~5,200 lines) establishing the canonical AP workflow. Phase 27.1 refined these into 13 enhanced EPS documents (~9,110 lines total) with a critical insight: the earlier documents described transactions (invoice received → validated → matched → approved → paid), but enterprise customers don't think in transactions — they think in decisions.

Every screen in the Information Architecture was redesigned around 5 questions:
1. What needs attention?
2. Why?
3. What evidence exists?
4. What decision is required?
5. What happens next?

This reframing changed the priority of every UI element. The attention queue is sorted by SLA risk and financial impact, not by chronology. The approve button is disabled until evidence has been acknowledged. Every monetary field displays confidence indicators and data freshness.

## Evidence

- 10-stage workflow redesigned around decision points, not status transitions
- 65 business rules (BR-001 to BR-065) tagged with decision ownership
- 10 user journeys mapped with explicit decision points at each stage
- 5 state machines designed with guard conditions that reflect decision readiness
- AI Behaviour Guide: AI can prepare evidence but never make decisions
- Design System Guide: approve button disabled until evidence acknowledged
- 12 success metrics measuring decision quality and speed, not transaction volume

## Principle

The quality of enterprise software is determined by how well it reduces the cognitive effort required to reach trusted financial decisions. Transactions are infrastructure. Decisions are the product. When you design around decisions, the UI surfaces what matters, the AI prepares evidence, the workflow enforces readiness, and the audit trail records the reasoning.

## Implications

1. **Design around decisions, not status** — A screen that shows "Invoice Status: Pending" answers nothing. A screen that shows "Invoice requires attention: 3 discrepancies found in line items 4, 7, 12. Evidence: PO #1234 shows $1,200 vs invoice shows $1,500. Decision: confirm or dispute. Next: exception routed to vendor manager." answers everything.

2. **Every screen must answer 5 questions** — What needs attention? Why? What evidence exists? What decision is required? What happens next? Any screen that cannot answer all 5 is incomplete.

3. **AI prepares decisions, humans make them** — AI's job is to extract, match, detect, and present evidence. The human's job is to evaluate and decide. Crossing this boundary destroys trust.

4. **Exception handling is a first-class decision flow** — Exceptions are not errors. They are decisions that require different evidence and different authority. Dedicated exception queue with decision-ready context.

5. **Metrics measure decision quality** — Processing time matters, but decision accuracy, exception rate, and audit trail completeness matter more.

## Related

- Lesson 53 (Workflow Quality Determines Software Quality)
- Lesson 54 (Customer Knowledge Compounds)
- Principle #32 (Enterprise software is designed around decisions, not transactions)
- ADR-032 (Enterprise Product Specification v2.0)
- Phase 27.1 evolution timeline entry
- 13 EPS documents at `docs/product/eps/`
