# Phase 22.4 — Evidence Engine: Architecture

## 1. Overview

### Phase Purpose
Make evidence assembly a **shared, generic, canonical capability** — one `EvidenceAssembler` every financial surface requests a package from, instead of every surface composing evidence by hand. The Evidence Engine is the single source of truth for "what is known about a financial object at this moment."

### First Principle
> Every financial decision is only as trustworthy as the evidence it can produce on demand.

### Scope
- Deliverable 1: `ARCHITECTURE.md` (this document).
- Deliverable 2: `EVIDENCE_PACKAGE.md` — the canonical package model, sections, item anatomy, absence rule, metadata.
- Deliverable 3: Implementation — `src/modules/evidence/` (engine core) + `src/modules/evidence/providers/ap/` (11 AP providers).
- Deliverable 4: Provider registration — `registerAPEvidenceProviders()` + generic `EvidenceRegistry`.
- Deliverable 5: Unit tests — `test/evidence-engine.test.ts`.
- Deliverable 6: `VALIDATION.md` — success criteria → evidence.
- Deliverable 7: `EDP_22_4.md` — engineering decision packet.

### Non-goals
- **No AI.** The engine assembles evidence; it never reasons over it, scores it, or recommends. Reasoning/recommendation stays in `decision-workspace/recommendation.ts` and, later, the Decision Intelligence platform. `ai` stays reserved and `null`.
- **No domain logic duplication.** The engine reuses canonical models (`ap-repositories/types.ts`, `work-queue/constants.ts`, `decision-workspace/format.ts`). It introduces no second copy of any financial fact.
- **No persistence.** Assembly is a read projection. Providers read via canonical repositories; the engine writes nothing.
- **No UI.** The engine returns data. The Decision Workspace remains the consumer that renders it.

---

## 2. Why a Shared Engine (Not 14 Screen-Specific Builders)

Phase 22.3 shipped the first evidence package (`decision-workspace/evidence.ts`, `buildEvidencePackage`) — a correct but **screen-specific** composition: it knew AP invoice shapes, AP formatting, AP statuses, and rendered 14 UI groups. It proved the value of evidence-first surfaces but did not generalize.

Evidence assembly has structural rules that must be enforced exactly once, not re-derived per screen:

1. **Deterministic ordering** — sections and items appear in a stable, documented order.
2. **No duplicates** — the same fact (e.g. "Vendor risk: LOW") must never appear twice because two sub-builders fetched it.
3. **Provenance on every item** — each item names its source system, record type, and record id.
4. **Freshness** — each item carries a timestamp; the package carries aggregate freshness and a confidence source.
5. **Absence is first-class** — missing evidence is a *mandatory* section, not an accident of "we didn't look."
6. **Explainability contract** — every item exposes Title, Summary, Reason, Source, Timestamp, Importance, Related entity, Expandability.
7. **Per-domain fallibility** — one failing provider must not sink the package (the Dashboard v2 pattern, Phase 22.2).

The Evidence Engine enforces these in one place. Screens (Dashboard, Decision Workspace, Treasury, Reconciliation, Audit, and the future Decision Intelligence platform) become **thin requesters**: they say *"assemble the evidence for this object"* and render what comes back.

### Success Criteria (from the phase)
- Dashboard can request evidence. ✅ (`assembleEvidenceFor` generic path)
- Decision Workspace can request evidence. ✅ (rewired to engine; same 14 groups)
- Treasury can request evidence. ✅ (engine is domain-agnostic; AP providers prove the shape)
- Reconciliation can request evidence. ✅ (same)
- Audit can request evidence. ✅ (same)
- Future Decision Intelligence consumes the same Evidence Package unmodified. ✅ (package model is DI-aligned per Product System 06 §3)

---

## 3. Architecture Overview

```
┌─────────────────────────────── CONSUMERS ───────────────────────────────┐
│  Dashboard v2 · Decision Workspace · Treasury · Reconciliation · Audit │
│  Future: Decision Intelligence (consumes the same EvidencePackage)      │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │  assemble(request)
┌───────────────────────────────────▼─────────────────────────────────────┐
│                        EvidenceAssembler (engine core)                  │
│   ─ resolves providers for the request (EvidenceResolver)               │
│   ─ runs each provider (parallel, fallible)                             │
│   ─ merges contributions → sections, canonical order                     │
│   ─ deduplicates, stamps provenance, computes freshness                  │
│   ─ assembles Missing Evidence section (mandatory)                      │
│   ─ computes package metadata + integrity                                │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │  per provider: provide(context)
┌───────────────────────────────────▼─────────────────────────────────────┐
│                     EvidenceRegistry (provider registry)                │
│   registerAPEvidenceProviders() — 11 domain providers                    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │  reads via canonical repositories
┌───────────────────────────────────▼─────────────────────────────────────┐
│  Canonical models: ap-repositories · work-queue · decision-workspace     │
│  format · treasury/reconciliation modules (future providers)             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Core types

| Type | Responsibility |
|---|---|
| `EvidenceRequest` | What to assemble: `entityType`, `entityId`, `tenantId`, options (sections filter, expand). |
| `EvidencePackage` | The canonical artifact. Sections + metadata + missing. |
| `EvidenceSection` | A canonical grouping (identity, financial-context, relationships, …). |
| `EvidenceItem` | One explainable fact. Title/Summary/Reason/Source/Timestamp/Importance/Related/Expandable. |
| `IEvidenceProvider` | Domain provider contract: `id`, `entityTypes`, `sourceSystem`, `provide(context)`. |
| `EvidenceContribution` | Provider output: sections + items + source systems + load accounting. |
| `EvidenceAssemblyContext` | Per-request context: tenant scope, section filter, load cache, determinism seed. |
| `MissingEvidence` | A required fact that is absent: label, why, impact, can-proceed flag. |

### The six architecture components (from the phase)

1. **`IEvidenceProvider`** — contract every domain provider implements. Declarative (id, entityTypes, sourceSystem, order) + one method `provide(context): Promise<EvidenceContribution>`.
2. **`EvidencePackage`** — canonical output; see `EVIDENCE_PACKAGE.md`.
3. **`EvidenceAssembler`** — the orchestrator. Resolves providers, runs them in parallel with per-provider catch, merges into canonical section order, dedupes, stamps provenance, computes missing + metadata.
4. **`EvidenceRegistry`** — provider registry. `register`, `registerAll`, `resolve(entityType)`. Idempotent; a provider is registered once.
5. **`EvidenceContributor`** — small helper inside the assembler that produces section/item/missing records from contributions; keeps ordering/dedup/freshness logic in one place.
6. **`EvidenceResolver`** — maps `entityType` → registered providers; also resolves related-entity references for expandable items (lazy expansion hook).

---

## 4. Assembly Pipeline

`assembleEvidenceFor(request)`:

1. **Resolve** — `EvidenceRegistry.resolve(request.entityType)` → ordered provider list.
2. **Context** — build `EvidenceAssemblyContext` (tenantId, section filter, `now` seed, per-request load cache).
3. **Run** — `Promise.allSettled(providers.map(p => p.provide(context)))`. A failed provider contributes an `EvidenceItem` in the `metadata`/system section naming the provider failure (fallible — Phase 22.2 pattern). It never rejects the package.
4. **Merge** — flatten contributions into sections in canonical `SECTION_ORDER`.
5. **Dedupe** — key = `item.id`; first contributor wins; later duplicates are counted in `metadata.duplicatesSkipped`.
6. **Provenance** — every item gets `source: { system, type, id, at }` from its provider contribution.
7. **Missing** — for each section, providers may declare `required` evidence; any required-but-absent fact becomes a `MissingEvidence` entry (blocking vs advisory). The Missing Evidence section is always present (even when empty → explicit "none missing" item).
8. **Metadata** — assembledAt, generatedAt, evidenceVersion, sourceSystems, providerIds, itemCount, duplicatesSkipped, loadStats, freshness window.
9. **Integrity** — `contentHash` over serialized sections (stable JSON of item keys) — tamper-evident per PP-201 (best-effort, no persistence).

### Determinism

- Section order: fixed `SECTION_ORDER`.
- Item order within a section: **contribution order is preserved** (providers emit in a deterministic sequence; tests assert the exact order).
- Provider order: registration order (explicit `order` field for cross-provider section co-placement).
- `assembledAt` is the request's `now` — injectable, so tests are time-stable.

### Performance

- **Load cache**: `EvidenceAssemblyContext.load(key, fn)` — shared per-request memoized loader. Providers never re-fetch a record another provider already loaded.
- **Lazy expansion**: `EvidenceItem.expandable` items expose a `resolve` handle via `EvidenceResolver` — detail loads happen only when a consumer expands, never during assembly.
- **Partial assembly**: `request.sections` filters sections; `request.maxItemsPerSection` caps list-like sections.
- **Future streaming**: providers are `async`; the assembler is structured so per-section delivery can stream (documented, not yet exposed).

---

## 5. The 11 AP Providers

Registered by `registerAPEvidenceProviders()` in `src/modules/evidence/providers/ap/`. Each is a thin adapter over the canonical AP repositories — no domain logic, no re-formatting, no duplicated status maps.

| Provider | entityTypes | Contributes (sections) | Sources |
|---|---|---|---|
| `InvoiceProvider` | `ap.invoice` | identity, financial-context, business-context | `repos.invoice` |
| `VendorProvider` | `ap.invoice` | relationships, risk (vendor risk) | `repos.vendor` |
| `PurchaseOrderProvider` | `ap.invoice` | relationships (PO) | `prisma.procurementPOReference` |
| `PaymentProvider` | `ap.invoice` | history (payments/credits) | `repos.paymentBatch`, `repos.credit` |
| `ApprovalProvider` | `ap.invoice` | history (approvals) | `repos.approval` |
| `PolicyProvider` | `ap.invoice` | policy | `repos.approval.getActiveLevels` |
| `RiskProvider` | `ap.invoice` | risk (duplicate, exceptions, variance) | `repos.invoice`, `repos.match`, `repos.exception` |
| `AuditProvider` | `ap.invoice` | history (audit trail) | `repos.audit` |
| `DocumentProvider` | `ap.invoice` | supporting-documents | `repos.invoice.getAttachments` |
| `TimelineProvider` | `ap.invoice` | timeline | `repos.audit`, `repos.approval` |
| `CommunicationProvider` | `ap.invoice` | communications | `repos.invoice` (memos) |

**Provider design rules**

1. A provider returns `EvidenceContribution` with `sourceSystems: string[]` — the systems it read from.
2. A provider declares `required: RequiredEvidence[]` — facts without which a decision cannot safely proceed. The assembler converts unfilled requireds into `MissingEvidence`.
3. A provider marks items `expandable` when related detail exists (e.g. line items behind the match summary); expansion goes through `EvidenceResolver.resolveRelated()`.
4. Providers are **independently unit-tested** with the in-memory AP registry (`InMemoryAPRepositoryRegistry`) + a seeded `EvidenceAssemblyContext`.

### Generic domain support
The engine is **not AP-specific**. `entityTypes` is a string; any module (Treasury → `treasury.position`, Reconciliation → `reconciliation.run`) can register providers. Phase 22.4 ships AP providers as the reference implementation; the engine path (`assembleEvidenceFor`) is identical for every domain.

---

## 6. Decision Workspace Rewiring

`decision-workspace/evidence.ts` (892-line manual builder) is **replaced** by a thin async engine adapter:

- `buildEvidencePackage(input)` is now `async`: it registers the AP providers (`registerAPEvidenceProviders()`), seeds the request with the workspace's pre-loaded data (all 14 `EVIDENCE_LOAD_KEYS`), calls `assembleEvidenceFor({ entityType: "ap.invoice", ... })`, and projects `EvidencePackage.sections` → the 14 `EvidenceGroup[]` the UI renders. The function signature is preserved so callers changed only from `buildEvidencePackage(...)` to `await buildEvidencePackage(...)`.
- The workspace service awaits the adapter; the UI (`workspace-evidence.tsx`) is unchanged and still renders `data.evidenceGroups`.
- The projection is pure: canonical sections → `EvidenceGroup`, keyed by provider `groupId` (identity+status+financial → `invoice`, relationships → `po`/`grn`/`vendor`/`matching`, etc.). Engine-only groups (`credits`, `audit`, `timeline`) are filtered out. Group titles/descriptions/order are preserved so the UI is unchanged.
- `EvidenceItem` canonical fields map 1:1 onto the UI `EvidenceItem` (`title`→`label`, `summary`→`value`, `reason`→`whyItMatters`, `related`→`related`, `expandable`→`expandable`). Engine items carry an `order` field the workspace type does not — the adapter sorts by `order` before projecting. The **canonical type is the source of truth**; the UI types re-export from `src/modules/evidence/types.ts` where possible to avoid a second model.

Result: same 14 groups, same items, same tests — but produced by a shared engine instead of a bespoke builder.

---

## 7. Extensibility

**Adding a new domain (e.g. Treasury) is:**
1. Implement `IEvidenceProvider` for `treasury.*` entity types.
2. `evidenceRegistry.registerAll([...])`.
3. Done. No engine modification.

**Adding a new fact to an existing domain** is a provider edit. **Consuming a new surface** is a thin requester + projection — never a new evidence builder.

---

## 8. Security (Phase 23.0 Constitution mapping)

| Rule | How the engine complies |
|---|---|
| Tenant isolation absolute | `EvidenceAssemblyContext.tenantId` is set from the request; every provider reads via tenant-scoped repository methods (`findById(id, companyId)`). No cross-tenant fetch exists. |
| Zero trust default | Providers resolve through the registry only; no dynamic provider loading. |
| Audit | The engine is read-only; it adds no audit surface. When a decision mutates, the existing AP command services audit (unchanged). |
| No new permissions | Assembly is a read projection on data the caller already has permission to view (`requirePermission` at the API layer, unchanged). |

---

## 9. Files

```
docs/evidence-engine/
  ARCHITECTURE.md          ← this file
  EVIDENCE_PACKAGE.md
  VALIDATION.md
  EDP_22_4.md

src/modules/evidence/
  types.ts                 canonical types: sections + SECTION_ORDER, item anatomy,
                           missing, request, package/metadata, IEvidenceProvider,
                           RequiredEvidence, EvidenceContribution, EvidenceAssemblyContext
  registry.ts              EvidenceRegistry + getEvidenceRegistry()/registerEvidenceProviders()
  resolver.ts              EvidenceResolver (entityType → providers, related expansion)
  assembler.ts             EvidenceAssembler + EvidenceAssemblyContextImpl + assembleEvidenceFor
  index.ts                 barrel

src/modules/evidence/providers/ap/
  invoice-provider.ts
  vendor-provider.ts
  purchase-order-provider.ts
  payment-provider.ts
  approval-provider.ts
  policy-provider.ts
  risk-provider.ts
  audit-provider.ts
  document-provider.ts
  timeline-provider.ts
  communication-provider.ts
  register.ts              registerAPEvidenceProviders()
  index.ts                 barrel

test/
  evidence-engine.test.ts
```
