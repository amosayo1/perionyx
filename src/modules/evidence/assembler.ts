import { createHash } from "node:crypto";
import {
  EVIDENCE_SECTION_ORDER,
  EVIDENCE_SECTION_TITLES,
} from "./types";
import type {
  EvidenceAssemblyContext,
  EvidenceConfidence,
  EvidenceContribution,
  EvidenceItem,
  EvidencePackage,
  EvidencePackageMetadata,
  EvidenceRequest,
  EvidenceSection,
  EvidenceSectionId,
  EvidenceStatus,
  EvidenceSource,
  IEvidenceProvider,
  MissingEvidence,
  RequiredEvidence,
} from "./types";
import { EvidenceRegistry, getEvidenceRegistry } from "./registry";
import { EvidenceResolver } from "./resolver";

export const EVIDENCE_VERSION = "22.4.0";

/** Items older than this count as stale in package freshness. */
export const STALE_AFTER_DAYS = 30;

const MISSING_SECTION_ID: EvidenceSectionId = "missing-evidence";
const METADATA_SECTION_ID: EvidenceSectionId = "metadata";

// ──────────────────────────────────────────────────────────────────────────────
// Assembly context
// ──────────────────────────────────────────────────────────────────────────────

export class EvidenceAssemblyContextImpl implements EvidenceAssemblyContext {
  readonly request: EvidenceRequest;

  private readonly values = new Map<string, unknown>();
  private readonly inflight = new Map<string, Promise<unknown>>();
  private hits = 0;
  private misses = 0;

  constructor(request: EvidenceRequest) {
    this.request = request;
  }

  async load<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.values.has(key)) {
      this.hits++;
      return this.values.get(key) as T;
    }
    const inFlight = this.inflight.get(key);
    if (inFlight) {
      this.hits++;
      return inFlight as Promise<T>;
    }
    this.misses++;
    const promise = Promise.resolve().then(fn);
    this.inflight.set(key, promise);
    void promise.then(
      (value) => {
        this.values.set(key, value);
        this.inflight.delete(key);
      },
      () => {
        this.inflight.delete(key);
      },
    );
    return promise;
  }

  seed<T>(key: string, value: T): void {
    this.values.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.values.get(key) as T | undefined;
  }

  /** Delta accounting since the last call — per-provider load stats. */
  takeLoadStats(): { cacheHits: number; cacheMisses: number } {
    const stats = { cacheHits: this.hits, cacheMisses: this.misses };
    this.hits = 0;
    this.misses = 0;
    return stats;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Assembler
// ──────────────────────────────────────────────────────────────────────────────

interface SectionAccumulator {
  items: EvidenceItem[];
}

interface ProviderOutcome {
  provider: IEvidenceProvider;
  contribution?: EvidenceContribution;
  error?: unknown;
}

/**
 * Phase 22.4 — Evidence Engine: assembler (orchestrator).
 *
 * Resolves providers → runs them in parallel (fallible) → merges into canonical
 * section order → dedupes → computes missing evidence → metadata + integrity.
 * Never rejects the package: a failing provider contributes a failure item and
 * its requireds as missing evidence.
 */
export class EvidenceAssembler {
  private readonly resolver: EvidenceResolver;

  constructor(private readonly registry: EvidenceRegistry) {
    this.resolver = new EvidenceResolver(registry);
  }

  async assemble(request: EvidenceRequest): Promise<EvidencePackage> {
    const now = request.now ?? new Date().toISOString();
    const providers = this.resolver.providersFor(request.entityType);
    const allowed = allowedSections(request.sections);

    const context = new EvidenceAssemblyContextImpl(request);
    if (request.seed) {
      for (const [key, value] of Object.entries(request.seed)) {
        context.seed(key, value);
      }
    }

    const outcomes = await Promise.all(
      providers.map(
        async (provider): Promise<ProviderOutcome> => {
          try {
            const contribution = await provider.provide(context);
            contribution.loadStats = context.takeLoadStats();
            return { provider, contribution };
          } catch (error) {
            const failure = failureContribution(provider, error, now);
            failure.loadStats = context.takeLoadStats();
            return { provider, contribution: failure, error };
          }
        },
      ),
    );

    const { sections, emittedIds, duplicatesSkipped } = this.merge(outcomes, allowed, request.maxItemsPerSection);

    const missing = this.computeMissing(outcomes, emittedIds, allowed, now);
    const missingItems = missingItemsFor(missing, request, now);
    const sectionsWithMissing = finalizeSections(sections, allowed, missing, missingItems, now);

    const metadata = this.buildMetadata(request, outcomes, sectionsWithMissing, emittedIds, missing, duplicatesSkipped, now);

    return {
      request,
      sections: sectionsWithMissing,
      missing,
      metadata,
    };
  }

  private merge(
    outcomes: ProviderOutcome[],
    allowed: Set<EvidenceSectionId>,
    maxItemsPerSection: number | undefined,
  ): { sections: EvidenceSection[]; emittedIds: Set<string>; duplicatesSkipped: number } {
    const acc = new Map<EvidenceSectionId, SectionAccumulator>();
    const emittedIds = new Set<string>();
    let duplicatesSkipped = 0;

    const push = (sectionId: EvidenceSectionId, item: EvidenceItem): void => {
      if (emittedIds.has(item.id)) {
        duplicatesSkipped++;
        return;
      }
      emittedIds.add(item.id);
      let bucket = acc.get(sectionId);
      if (!bucket) {
        bucket = { items: [] };
        acc.set(sectionId, bucket);
      }
      bucket.items.push(item);
    };

    for (const outcome of outcomes) {
      const contribution = outcome.contribution;
      if (!contribution) continue;
      for (const section of contribution.sections) {
        if (!allowed.has(section.id) && section.id !== MISSING_SECTION_ID) continue;
        for (const item of section.items) push(section.id, item);
      }
    }

    const sections: EvidenceSection[] = [];
    for (const sectionId of EVIDENCE_SECTION_ORDER) {
      const bucket = acc.get(sectionId);
      if (!bucket || bucket.items.length === 0) continue;
      if (maxItemsPerSection && maxItemsPerSection > 0 && bucket.items.length > maxItemsPerSection) {
        bucket.items = bucket.items.slice(0, maxItemsPerSection);
      }
      sections.push({
        id: sectionId,
        title: EVIDENCE_SECTION_TITLES[sectionId],
        description: null,
        items: bucket.items,
      });
    }

    return { sections, emittedIds, duplicatesSkipped };
  }

  private computeMissing(
    outcomes: ProviderOutcome[],
    emittedIds: Set<string>,
    allowed: Set<EvidenceSectionId>,
    now: string,
  ): MissingEvidence[] {
    const missing: MissingEvidence[] = [];
    for (const outcome of outcomes) {
      for (const required of outcome.provider.required) {
        if (!allowed.has(required.sectionId)) continue;
        if (required.satisfiedBy.some((candidate) => isSatisfied(emittedIds, candidate))) continue;
        missing.push({
          id: required.id,
          sectionId: required.sectionId,
          label: required.label,
          reason: required.reason,
          impact: required.blocking ? "blocking" : "advisory",
          canProceed: !required.blocking,
          sourceSystem: outcome.provider.sourceSystems[0] ?? outcome.provider.id,
        });
      }
    }
    // Blocking gaps first; stable within groups (provider/required order kept).
    missing.sort((a, b) => (a.impact === b.impact ? 0 : a.impact === "blocking" ? -1 : 1));
    return missing;
  }

  private buildMetadata(
    request: EvidenceRequest,
    outcomes: ProviderOutcome[],
    sections: EvidenceSection[],
    emittedIds: Set<string>,
    missing: MissingEvidence[],
    duplicatesSkipped: number,
    now: string,
  ): EvidencePackageMetadata {
    const providerIds = outcomes.map((o) => o.provider.id);
    const sourceSystems: string[] = [];
    for (const outcome of outcomes) {
      for (const system of outcome.contribution?.sourceSystems ?? []) {
        if (!sourceSystems.includes(system)) sourceSystems.push(system);
      }
    }

    const timestamps: string[] = [];
    for (const section of sections) {
      for (const item of section.items) {
        if (item.timestamp) timestamps.push(item.timestamp);
      }
    }
    const sorted = [...timestamps].sort();
    const oldestTimestamp = sorted[0] ?? null;
    const newestTimestamp = sorted[sorted.length - 1] ?? null;
    const stale =
      oldestTimestamp !== null &&
      ageDays(oldestTimestamp, now) > STALE_AFTER_DAYS;

    return {
      assembledAt: now,
      evidenceVersion: EVIDENCE_VERSION,
      entityType: request.entityType,
      entityId: request.entityId,
      tenantId: request.tenantId,
      providerIds,
      sourceSystems,
      itemCount: emittedIds.size,
      duplicatesSkipped,
      sections: sections.map((s) => s.id),
      decisionReady: !missing.some((m) => m.impact === "blocking"),
      freshness: { oldestTimestamp, newestTimestamp, stale },
      contentHash: computeContentHash(sections, missing),
    };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function allowedSections(sections: EvidenceSectionId[] | undefined): Set<EvidenceSectionId> {
  if (!sections || sections.length === 0) return new Set(EVIDENCE_SECTION_ORDER);
  return new Set([...sections, MISSING_SECTION_ID, METADATA_SECTION_ID]);
}

function failureContribution(
  provider: IEvidenceProvider,
  error: unknown,
  now: string,
): EvidenceContribution {
  const message = error instanceof Error ? error.message : String(error);
  const item: EvidenceItem = {
    id: `${provider.id}:failure`,
    sectionId: METADATA_SECTION_ID,
    groupId: "provider-failures",
    title: "Provider failed",
    summary: `Evidence could not be assembled from ${provider.name}.`,
    reason: message,
    source: { system: "evidence.engine", type: "ProviderFailure", id: provider.id, at: now },
    timestamp: now,
    importance: "high",
    related: [],
    expandable: false,
    status: "negative",
    confidence: "none",
    confidenceBasis: "no data produced",
    evidence: [],
    order: 0,
  };
  return {
    providerId: provider.id,
    sourceSystems: [],
    sections: [
      {
        id: METADATA_SECTION_ID,
        title: EVIDENCE_SECTION_TITLES[METADATA_SECTION_ID],
        description: "System-level facts about this assembly.",
        items: [item],
      },
    ],
    missing: [],
    loadStats: { cacheHits: 0, cacheMisses: 0 },
  };
}

function missingItemsFor(
  missing: MissingEvidence[],
  request: EvidenceRequest,
  now: string,
): EvidenceItem[] {
  if (missing.length === 0) {
    return [
      {
        id: `${request.entityId}:no-missing`,
        sectionId: MISSING_SECTION_ID,
        groupId: "missing-evidence",
        title: "No missing evidence",
        summary: "All required evidence was found.",
        reason: "Every declared requirement was satisfied by the assembled evidence.",
        source: { system: "evidence.engine", type: "MissingEvidence", id: "none", at: now },
        timestamp: now,
        importance: "medium",
        related: [],
        expandable: false,
        status: "positive",
        confidence: "high",
        confidenceBasis: "all declared requirements satisfied",
        evidence: [],
        order: 0,
      },
    ];
  }
  return missing.map((m, index): EvidenceItem => {
    const status: EvidenceStatus = m.impact === "blocking" ? "negative" : "pending";
    const confidence: EvidenceConfidence = "none";
    const source: EvidenceSource = {
      system: m.sourceSystem,
      type: "MissingEvidence",
      id: m.id,
      at: now,
    };
    return {
      id: `missing:${m.id}`,
      sectionId: MISSING_SECTION_ID,
      groupId: "missing-evidence",
      title: m.label,
      summary: m.reason,
      reason: m.impact === "blocking" ? "This gap prevents the decision from proceeding." : "This gap should be resolved but does not block the decision.",
      source,
      timestamp: now,
      importance: m.impact === "blocking" ? "high" : "medium",
      related: [],
      expandable: false,
      status,
      confidence,
      confidenceBasis: "absence is itself the fact",
      evidence: [],
      order: index,
    };
  });
}

function finalizeSections(
  sections: EvidenceSection[],
  allowed: Set<EvidenceSectionId>,
  missing: MissingEvidence[],
  missingItems: EvidenceItem[],
  now: string,
): EvidenceSection[] {
  const byId = new Map(sections.map((s) => [s.id, s]));

  const missingSection: EvidenceSection = {
    id: MISSING_SECTION_ID,
    title: EVIDENCE_SECTION_TITLES[MISSING_SECTION_ID],
    description:
      missing.length === 0
        ? "No required evidence is missing."
        : "Required evidence that could not be satisfied — blocking gaps prevent the decision from proceeding.",
    items: missingItems,
  };

  const ordered: EvidenceSection[] = [];
  for (const sectionId of EVIDENCE_SECTION_ORDER) {
    if (sectionId === MISSING_SECTION_ID) {
      ordered.push(missingSection);
      continue;
    }
    if (!allowed.has(sectionId)) continue;
    const section = byId.get(sectionId);
    if (section) ordered.push(section);
  }
  return ordered;
}

function computeContentHash(sections: EvidenceSection[], missing: MissingEvidence[]): string {
  const parts: string[] = [];
  for (const section of sections) {
    parts.push(`${section.id}:${section.items.map((i) => i.id).join(",")}`);
  }
  parts.push(`missing:${missing.map((m) => m.id).join(",")}`);
  const decisionReady = !missing.some((m) => m.impact === "blocking");
  parts.push(`decisionReady:${decisionReady}`);
  return createHash("sha256").update(parts.join(";")).digest("hex");
}

function isSatisfied(emittedIds: Set<string>, candidate: string): boolean {
  if (emittedIds.has(candidate)) return true;
  if (candidate.endsWith("*")) {
    const prefix = candidate.slice(0, -1);
    for (const id of emittedIds) {
      if (id.startsWith(prefix)) return true;
    }
  }
  return false;
}

function ageDays(timestamp: string, now: string): number {
  const ts = new Date(timestamp).getTime();
  const n = new Date(now).getTime();
  if (Number.isNaN(ts) || Number.isNaN(n)) return 0;
  return Math.max(0, (n - ts) / 86_400_000);
}

// ──────────────────────────────────────────────────────────────────────────────
// Canonical entry point
// ──────────────────────────────────────────────────────────────────────────────

let assembler: EvidenceAssembler | undefined;

function getAssembler(): EvidenceAssembler {
  if (!assembler) assembler = new EvidenceAssembler(getEvidenceRegistry());
  return assembler;
}

/**
 * Phase 22.4 — Canonical evidence-assembly entry point.
 *
 * Assembles an `EvidencePackage` for the given request through the registered
 * provider set. The assembler is lazy and idempotent — first call drives
 * provider registration. Never rejects; provider failures degrade into typed
 * failure items and missing evidence.
 */
export async function assembleEvidenceFor(request: EvidenceRequest): Promise<EvidencePackage> {
  return getAssembler().assemble(request);
}

/** Test-only: reset the cached assembler so a fresh registry takes effect. */
export function resetEvidenceAssembler(): void {
  assembler = undefined;
}
