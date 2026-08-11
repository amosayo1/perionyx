# 19 — Anti-patterns

**Product System · Document 19 of 20**
**Authority: Anti-patterns is the catalog of prohibited product and engineering patterns for Perionyx. Each entry names the pattern, why it fails the doctrine, the research evidence against it, and the canonical replacement. It consolidates the per-document anti-pattern lists (07–18) into one binding register.**
**Sources: The four-product research program; the per-document anti-pattern sections; the Phase 20.0/20.2 validation friction findings; the security and financial integrity audits.**

---

## 1. The Anti-pattern Doctrine

**A prohibited pattern is named so it can be refused** (PP-147). Perionyx naming an anti-pattern is not pedantry; it is the cheapest form of governance. When a designer or engineer reaches for a known failure, they reach for its canonical replacement instead (PP-147, PP-130).

## 2. The Register

### A. Surface and Information Patterns

| # | Anti-pattern | Why it fails | Replace with |
|---|---|---|---|
| A-1 | **The poster dashboard** | Static, no decisions | Decision surface (PP-055) |
| A-2 | **The data catalog** | One widget per table | Persona dashboard (PP-051) |
| A-3 | **The vanity metric** | No decision impact | The "does this change a decision?" gate (PP-048) |
| A-4 | **The charts-first layout** | CFO waits for charts | Metrics-first (PP-043) |
| A-5 | **The silent staleness** | Stale shown as live | Labeled freshness (PP-060, PP-013) |
| A-6 | **The whole-page failure** | One error blanks all | Independent fallibility (PP-058) |
| A-7 | **The client-side slice** | Loads all rows to browser | Server-side filter/paginate (PP-066) |
| A-8 | **The dead-end row** | Rows lead nowhere | Row is a door (PP-070) |
| A-9 | **The silent total** | Total without basis | Labeled basis (PP-080) |
| A-10 | **The export of shame** | Loses filters/metadata | Export parity + metadata (PP-056, PP-277) |

### B. Entry and Validation Patterns

| # | Anti-pattern | Why it fails | Replace with |
|---|---|---|---|
| B-1 | **The gatekeeper form** | Errors without fixes | Explain-how-to-fix (PP-085) |
| B-2 | **The invisible default** | Hidden/unanchorable defaults | Visible, overridable (PP-087, PP-211) |
| B-3 | **The data-dump wizard** | Sequences all fields | Sequences decisions (PP-092) |
| B-4 | **The losing form** | Refresh wipes entry | Autosave + drafts (PP-089) |
| B-5 | **The double-post** | Retry duplicates money | Idempotency (F-05) |
| B-6 | **The orphaning label** | No programmatic association | htmlFor/id (PP-084) |

### C. Workflow and Authority Patterns

| # | Anti-pattern | Why it fails | Replace with |
|---|---|---|---|
| C-1 | **The status string** | Workflow as free text | State machines (PP-094) |
| C-2 | **The silent automation** | Money moves invisibly | Visible + audited (PP-160) |
| C-3 | **The approval-free work** | Matrix/SoD bypassed | Endpoint checks (PP-162) |
| C-4 | **The disconnected stage** | No queue/dashboard/evidence | Lifecycle ownership (PR-02) |
| C-5 | **The lost escalation** | SLA breach, no path | Automatic escalation (PP-098) |
| C-6 | **The one-person workflow** | No owner/assignee | Requires-me triage (PP-049) |

### D. AI and Intelligence Patterns

| # | Anti-pattern | Why it fails | Replace with |
|---|---|---|---|
| D-1 | **The oracle** | Output without evidence | Evidence Package (PP-105) |
| D-2 | **The silent autopilot** | AI executes unattended | Request confirmation (PP-107) |
| D-3 | **The fake confidence** | Scalar not tied to model | Categorical confidence (PP-109) |
| D-4 | **The ungrounded citation** | Fabricated source | Never-fabricate clause (PP-108) |
| D-5 | **The permissionless model** | AI bypasses IAM | Governance (PP-111) |
| D-6 | **The hidden reasoning** | Unexplained decision | Visible reasoning (PP-110) |

### E. Trust and Quality Patterns

| # | Anti-pattern | Why it fails | Replace with |
|---|---|---|---|
| E-1 | **The color-only status** | Meaning by color alone | Text-plus-color (PP-125) |
| E-2 | **The focus trap without exit** | Keyboard dead-end | Focus management (PP-115) |
| E-3 | **The decorative chart** | No text alternative | Data table alternative (PP-236) |
| E-4 | **The contrast gamble** | Low-contrast on charcoal | EDL AA palette (PP-125) |
| E-5 | **The flourish** | Meaningless motion | Communicative motion (PP-122) |
| E-6 | **The counting cash** | Money animates values | Settled numbers (PP-126) |
| E-7 | **The springy confirm** | Playful on destructive | Immediate confirm (PP-163) |
| E-8 | **The ad hoc timing** | Hardcoded durations | EDL motion tokens (PP-123) |
| E-9 | **The unclassified field** | No classification decision | Data classification (Law 13) |
| E-10 | **The SDK leak** | Domain imports provider | Capability contracts (Law 1) |
| E-11 | **The Float money** | Money in floating point | Decimal(38,12) (F-01) |
| E-12 | **The silent maybe** | Unknown action outcome | Fail-closed + explicit state (F-19, F-10) |
| E-13 | **The untested claim** | "Works" without a test | Tests prove claims (PP-130) |
| E-14 | **The skipped gate** | Merge without typecheck/build/test | Build gates (AGENTS.md) |

## 3. How to Use This Register

1. **Design phase** — consult the register before wireframing (PP-147).
2. **Review phase** — the register is the review checklist.
3. **Ship phase** — an anti-pattern named in review blocks release until replaced.
4. **Lesson phase** — new patterns discovered in practice are added here, with evidence (Lesson 40: enforcement through tooling).

## 4. Anti-pattern Doctrine Rules (Condensed)

1. Name it to refuse it (PP-147).
2. Every entry carries its canonical replacement (PP-147).
3. The register is the review checklist (PP-113).
4. New anti-patterns are added with evidence (PP-130).
5. Where possible, the anti-pattern is enforced by tooling, not memory (Law 7, PP-147).

---

*Next: `20 Product Constitution.md` — the constitutional capstone.*
