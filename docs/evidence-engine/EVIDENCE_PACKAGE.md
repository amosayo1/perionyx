# Phase 22.4 — Evidence Package: Canonical Model Specification

**Authority:** Product System 06 (Decision Intelligence) §3 defines the Evidence Package's eight components. This document makes them concrete and machine-checkable. It is binding on every evidence producer and consumer.

---

## 1. Canonical Sections

Every package renders sections in this exact order (`SECTION_ORDER`):

| # | Section id | Title | Contents |
|---|---|---|---|
| 1 | `identity` | Identity | Who/what is being decided: entity id, type, display id |
| 2 | `entity` | Entity | Tenant-scoped subject: company, business unit, department, owner |
| 3 | `type` | Type | Kind of object (invoice, treasury position, reconciliation run, …) |
| 4 | `status` | Status | Current state + explanation |
| 5 | `tenant` | Tenant | Tenant scope the evidence was assembled under |
| 6 | `business-context` | Business Context | Purpose, vendor, GL coding, cost centre, dimensions |
| 7 | `financial-context` | Financial Context | Currency, amount, tax, balance, variance — every monetary fact |
| 8 | `relationships` | Relationships | PO, GRN, Invoice, Vendor, Contract, Payment, Journal links |
| 9 | `history` | History | Previous actions, previous approvals, historical decisions, prior exceptions |
| 10 | `policy` | Policy | Policy evaluations, authority limits, SoD, compliance checks |
| 11 | `risk` | Risk | Duplicate risk, supplier risk, fraud indicators, anomaly signals, operational risk |
| 12 | `timeline` | Timeline | Chronological events: actor, timestamp, evidence source |
| 13 | `supporting-documents` | Supporting Documents | Attachments, OCR state, storage references |
| 14 | `communications` | Communications | Vendor/internal notes, memos |
| 15 | `missing-evidence` | Missing Evidence | **Mandatory.** Required facts that are absent, why they matter, and whether the decision can proceed |
| 16 | `metadata` | Metadata | Assembly time, evidence version, source systems, freshness, confidence source, integrity |

Sections may be filtered via `request.sections`. A consumer that requests `sections: []` gets identity+metadata (the engine always includes identity and metadata so the package is self-describing).

---

## 2. Evidence Item Anatomy

Every `EvidenceItem` MUST expose all eight explainability fields (Product System 06 §3; the phase's "Title, Summary, Reason, Source, Timestamp, Importance, Related entity, Expandability"):

| Field | Type | Meaning | Rule |
|---|---|---|---|
| `id` | `string` | Stable item key | Unique within the package; used for dedupe |
| `sectionId` | `SectionId` | Owning section | Set by the provider |
| `title` | `string` | **Title** — short noun phrase | Non-empty |
| `summary` | `string` | **Summary** — the value in plain language | Non-empty; already formatted (numbers/money via canonical format layer) |
| `reason` | `string` | **Reason** — why this matters to the decision | Non-empty (the "so what" for a CFO/Controller) |
| `source` | `EvidenceSource` | **Source** — system, record type, record id | Always present; never empty |
| `timestamp` | `string \| null` | **Timestamp** — when the source fact was recorded | ISO |
| `importance` | `"high" \| "medium" \| "low"` | **Importance** to the decision | Provider-assigned |
| `related` | `string[]` | **Related entity** record ids | Invoice/PO/GRN/vendor ids |
| `expandable` | `boolean` | **Expandability** | True when related detail exists behind `EvidenceResolver` |
| `status` | `"positive" \| "negative" \| "neutral" \| "pending" \| "action"` | Signal color | Drives the UI dot |
| `confidence` | `"high" \| "medium" \| "low" \| "none"` | Categorical band | Never a scalar (DI-R2, PP-177) |
| `confidenceBasis` | `string` | What was actually measured | Non-empty — names the data (never "from the model") |
| `evidence` | `string[]` | Supporting record references | Human-readable refs (`m_1`, `po_1`) |
| `order` | `number` | Position within section | Set by contributor; stable |

### The Confidence Rule (DI-R2, DI-P4)
- `confidence` is one of `high | medium | low | none` — never "72%".
- `confidenceBasis` MUST name the measured fact: "Overall confidence 0.92 measured across the match" — never "model output".
- When a band is derived from a score, the score is shown in the basis.

### The Absence Rule (the phase's mandatory Missing Evidence)
Absence is **never silence**:

1. Every required-but-absent fact is a `MissingEvidence` entry.
2. `MissingEvidence` has: `id`, `label`, `reason` (why it matters), `impact` (`blocking` | `advisory`), `canProceed` (whether the decision may proceed without it), and the source system that looked for it.
3. The `missing-evidence` section is ALWAYS present. When nothing is missing it contains one item: `"No missing evidence — all required facts present"`.
4. Absent relationship evidence ALSO renders as an in-place item in its section (`po.none`, `grn.none`, `vendor.missing`) with `status: negative|pending` — never as a silent gap.

### The Provenance Rule (PP-004)
`EvidenceSource` = `{ system: string, type: string, id: string, at: string | null }`. `system` names the canonical source system (e.g. `ap.repository`), `type` the record type (`VendorInvoice`, `ThreeWayMatch`), `id` the record id. Every item carries it; the UI surfaces it; an auditor can open the record.

---

## 3. Missing Evidence Semantics

```ts
interface MissingEvidence {
  id: string;                 // e.g. "missing.match"
  sectionId: SectionId;       // where the fact would live
  label: string;              // what is missing
  reason: string;             // why it matters to the decision
  impact: "blocking" | "advisory";
  canProceed: boolean;        // decision may proceed with this missing
  sourceSystem: string;       // who looked and found nothing
}
```

- **Blocking** missing evidence (e.g. no three-way match, no vendor record) → `canProceed: false` and the package's `decisionReady` is `false`.
- **Advisory** missing (e.g. no communications) → `canProceed: true`, flagged for the human.
- The package computes `decisionReady = all blocking items absent`. Consumers (recommendation engine, UI) may gate on it.

---

## 4. Package Metadata

```ts
interface EvidencePackageMetadata {
  assembledAt: string;          // request `now` (injectable → deterministic)
  evidenceVersion: string;      // "22.4.0"
  entityType: string;
  entityId: string;
  tenantId: string;
  providerIds: string[];        // who contributed
  sourceSystems: string[];      // union of provider systems (deduped)
  itemCount: number;
  duplicatesSkipped: number;
  sections: SectionId[];
  decisionReady: boolean;       // no blocking missing evidence
  freshness: {
    oldestTimestamp: string | null;
    newestTimestamp: string | null;
    stale: boolean;             // any item older than STALE_AFTER (30d default)
  };
  contentHash: string;          // stable hash over item keys — tamper-evidence
}
```

### Freshness & Confidence Source
- Every item timestamp feeds `oldestTimestamp`/`newestTimestamp`.
- `metadata.freshness.stale` is true when any required financial fact is older than `STALE_AFTER_DAYS` (default 30). Stale packages must be labeled stale (PP-013 — label it, don't hide it).
- Confidence is never aggregate-faked: each item carries its own band + basis; the package exposes no overall confidence scalar.

---

## 5. Determinism Contract

For the same request and the same repository state:

1. Section order is identical (fixed `SECTION_ORDER`).
2. Item order within a section is identical (stable contribution order; providers iterate records in deterministic order — audit/approval sorted by timestamp ascending).
3. `assembledAt` is the request's `now`, not `Date.now()` inside a provider — so the package is time-stable in tests and reproducible.
4. `contentHash` changes only when content changes.

---

## 6. Deduplication

- Dedupe key: `item.id`.
- The assembler keeps the **first** contributor's item and counts the duplicate in `metadata.duplicatesSkipped`.
- Providers coordinate: each fact has one owning provider (e.g. "Vendor risk" is RiskProvider's; "PO amount" is PurchaseOrderProvider's). Overlap is expected between history providers (audit + approvals both feed `history`) and is resolved by the dedupe rule above.

---

## 7. DI Alignment (Product System 06 §3)

| DI Component | Evidence Package mapping |
|---|---|
| Claim | `Item.title + summary` |
| Sources | `Item.source` + `metadata.sourceSystems` |
| Citations | `Item.evidence` + `Item.related` |
| Reasoning | NOT in the engine — rendered by the workspace/recommendation (DI-R3). Engine is evidence-only. |
| Confidence | `Item.confidence` band + `confidenceBasis` (DI-R2) |
| Alternatives | NOT in the engine — `recommendation.alternatives` (unchanged) |
| Basis | `metadata.evidenceVersion` + each item's `confidenceBasis` |
| Integrity | `metadata.contentHash` (PP-201, best-effort — no persistence yet) |

The future Decision Intelligence platform consumes `EvidencePackage` as-is — it is already the DI §3 artifact, minus the reasoning/alternatives the engine must not produce.
