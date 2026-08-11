/**
 * Phase 22.4 — Evidence Engine: unit tests
 *
 * Tests the engine core directly (fresh registry + assembler, no global
 * state, no AP dependency): determinism, first-wins dedup, mandatory
 * missing-evidence, absence items, per-provider fallibility, decisionReady,
 * section filters, per-section caps, and seeded load context.
 */

import { describe, it, expect, vi } from "vitest";
import { EvidenceAssembler } from "@/modules/evidence/assembler";
import { EvidenceRegistry } from "@/modules/evidence/registry";
import { EVIDENCE_SECTION_TITLES } from "@/modules/evidence/types";
import type {
  EvidenceAssemblyContext,
  EvidenceContribution,
  EvidenceItem,
  EvidenceRequest,
  EvidenceSectionId,
  IEvidenceProvider,
  RequiredEvidence,
} from "@/modules/evidence/types";

const FIXED_NOW = "2026-01-15T12:00:00.000Z";

function makeItem(id: string, sectionId: EvidenceSectionId, overrides: Partial<EvidenceItem> = {}): EvidenceItem {
  return {
    id,
    sectionId,
    groupId: "test",
    title: id,
    summary: "summary",
    reason: "reason",
    source: { system: "test.system", type: "TestRecord", id, at: null },
    timestamp: null,
    importance: "medium",
    related: [],
    expandable: false,
    status: "neutral",
    confidence: "high",
    confidenceBasis: "recorded fact",
    evidence: [],
    order: 0,
    ...overrides,
  };
}

function makeContribution(providerId: string, items: EvidenceItem[]): EvidenceContribution {
  const bySection = new Map<EvidenceSectionId, EvidenceItem[]>();
  for (const it of items) {
    const bucket = bySection.get(it.sectionId) ?? [];
    bucket.push(it);
    bySection.set(it.sectionId, bucket);
  }
  return {
    providerId,
    sourceSystems: ["test.system"],
    sections: [...bySection.entries()].map(([id, its]) => ({
      id,
      title: EVIDENCE_SECTION_TITLES[id],
      description: null,
      items: its,
    })),
    missing: [],
    loadStats: { cacheHits: 0, cacheMisses: 0 },
  };
}

function makeProvider(
  id: string,
  opts: {
    entityType?: string;
    required?: RequiredEvidence[];
    provide: (context: EvidenceAssemblyContext) => Promise<EvidenceContribution>;
  },
): IEvidenceProvider {
  return {
    id,
    name: id,
    entityTypes: [opts.entityType ?? "test.entity"],
    sourceSystems: ["test.system"],
    required: opts.required ?? [],
    provide: opts.provide,
  };
}

const NO_REQUIRED: RequiredEvidence[] = [];

function request(overrides: Partial<EvidenceRequest> = {}): EvidenceRequest {
  return {
    entityType: "test.entity",
    entityId: "e_1",
    tenantId: "t_1",
    now: FIXED_NOW,
    ...overrides,
  };
}

function idsOf(pkg: { sections: { items: EvidenceItem[] }[] }): string[] {
  return pkg.sections.flatMap((s) => s.items.map((i) => i.id));
}

describe("Evidence Engine — determinism", () => {
  it("produces identical packages for the same pinned request", async () => {
    const providerA = makeProvider("test.a", {
      provide: async () =>
        makeContribution("test.a", [
          makeItem("a.identity", "identity", { order: 0 }),
          makeItem("a.financial", "financial-context", { order: 0 }),
        ]),
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA]));

    const first = await assembler.assemble(request());
    const second = await assembler.assemble(request());

    expect(idsOf(first)).toEqual(idsOf(second));
    expect(first.sections.map((s) => s.id)).toEqual(second.sections.map((s) => s.id));
    expect(first.metadata.contentHash).toBe(second.metadata.contentHash);
    expect(first.metadata.itemCount).toBe(second.metadata.itemCount);
  });

  it("orders items by contribution order and preserves provider registration order", async () => {
    const providerA = makeProvider("test.a", {
      provide: async () =>
        makeContribution("test.a", [
          makeItem("a.1", "identity", { order: 0 }),
          makeItem("a.2", "identity", { order: 1 }),
        ]),
    });
    const providerB = makeProvider("test.b", {
      provide: async () => makeContribution("test.b", [makeItem("b.1", "identity", { order: 0 })]),
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA, providerB]));

    const pkg = await assembler.assemble(request());
    const identity = pkg.sections.find((s) => s.id === "identity")!;
    expect(identity.items.map((i) => i.id)).toEqual(["a.1", "a.2", "b.1"]);
  });
});

describe("Evidence Engine — deduplication", () => {
  it("keeps the first emission of an item id and counts the skip", async () => {
    const providerA = makeProvider("test.a", {
      provide: async () => makeContribution("test.a", [makeItem("a.identity", "identity")]),
    });
    const providerB = makeProvider("test.b", {
      provide: async () =>
        makeContribution("test.b", [
          makeItem("a.identity", "identity"), // duplicate
          makeItem("b.risk", "risk"),
        ]),
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA, providerB]));

    const pkg = await assembler.assemble(request());
    const ids = idsOf(pkg);

    expect(ids.filter((id) => id === "a.identity")).toHaveLength(1);
    expect(pkg.metadata.duplicatesSkipped).toBe(1);
    expect(pkg.metadata.itemCount).toBe(2);
  });
});

describe("Evidence Engine — missing evidence", () => {
  it("always emits the missing-evidence section, with 'no missing' when clean", async () => {
    const providerA = makeProvider("test.a", {
      required: [
        {
          id: "req.identity",
          sectionId: "identity",
          label: "Identity record",
          reason: "Identity is required to decide.",
          blocking: true,
          satisfiedBy: ["a.identity"],
        },
      ],
      provide: async () => makeContribution("test.a", [makeItem("a.identity", "identity")]),
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA]));

    const pkg = await assembler.assemble(request());
    const missing = pkg.sections.find((s) => s.id === "missing-evidence")!;

    expect(missing).toBeTruthy();
    expect(missing.items[0].id).toBe("e_1:no-missing");
    expect(missing.items[0].status).toBe("positive");
    expect(pkg.missing).toEqual([]);
    expect(pkg.metadata.decisionReady).toBe(true);
  });

  it("reports blocking missing evidence and flips decisionReady off", async () => {
    const providerA = makeProvider("test.a", {
      required: [
        {
          id: "req.identity",
          sectionId: "identity",
          label: "Identity record",
          reason: "Identity is required to decide.",
          blocking: true,
          satisfiedBy: ["a.identity"],
        },
      ],
      provide: async () => makeContribution("test.a", []), // emits nothing → requirement unfilled
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA]));

    const pkg = await assembler.assemble(request());
    const missing = pkg.sections.find((s) => s.id === "missing-evidence")!;

    expect(missing.items[0].id).toBe("missing:req.identity");
    expect(missing.items[0].status).toBe("negative");
    expect(pkg.missing).toHaveLength(1);
    expect(pkg.missing[0].impact).toBe("blocking");
    expect(pkg.metadata.decisionReady).toBe(false);
  });

  it("emits explicit absence items for missing data rather than silence", async () => {
    const providerD = makeProvider("test.d", {
      provide: async (context) => {
        const record = await context.load<unknown>("missing-record", async () => null);
        return makeContribution("test.d", [
          makeItem("d.absence", "identity", {
            title: "Record not found",
            status: "negative",
            confidence: "none",
            confidenceBasis: "no record present",
            evidence: [String(record ?? "null")],
          }),
        ]);
      },
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerD]));

    const pkg = await assembler.assemble(request());
    expect(idsOf(pkg)).toContain("d.absence");
    const item = pkg.sections.flatMap((s) => s.items).find((i) => i.id === "d.absence")!;
    expect(item.status).toBe("negative");
    expect(item.confidence).toBe("none");
  });
});

describe("Evidence Engine — fallibility", () => {
  it("a failing provider degrades into a failure item and missing evidence, never rejects", async () => {
    const providerC = makeProvider("test.c", {
      required: [
        {
          id: "req.c.data",
          sectionId: "business-context",
          label: "C data",
          reason: "C data is required to decide.",
          blocking: true,
          satisfiedBy: ["c.data"],
        },
      ],
      provide: async () => {
        throw new Error("boom");
      },
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerC]));

    const pkg = await assembler.assemble(request());
    const failureIds = idsOf(pkg).filter((id) => id.includes("failure"));

    expect(pkg.sections.length).toBeGreaterThan(0);
    expect(failureIds).toContain("test.c:failure");
    expect(pkg.missing.some((m) => m.id === "req.c.data" && m.impact === "blocking")).toBe(true);
    expect(pkg.metadata.decisionReady).toBe(false);
    expect(pkg.metadata.providerIds).toContain("test.c");
  });
});

describe("Evidence Engine — request controls", () => {
  it("limits emitted sections when a filter is supplied", async () => {
    const providerA = makeProvider("test.a", {
      provide: async () =>
        makeContribution("test.a", [
          makeItem("a.identity", "identity"),
          makeItem("a.financial", "financial-context"),
          makeItem("a.risk", "risk"),
        ]),
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA]));

    const pkg = await assembler.assemble(request({ sections: ["identity"] }));
    expect(pkg.sections.map((s) => s.id)).toEqual(["identity", "missing-evidence"]);
    expect(idsOf(pkg)).not.toContain("a.financial");
  });

  it("caps list-like sections with maxItemsPerSection", async () => {
    const providerA = makeProvider("test.a", {
      provide: async () =>
        makeContribution(
          "test.a",
          [0, 1, 2, 3, 4].map((n) => makeItem(`a.list.${n}`, "history", { order: n })),
        ),
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA]));

    const pkg = await assembler.assemble(request({ maxItemsPerSection: 2 }));
    const history = pkg.sections.find((s) => s.id === "history")!;
    expect(history.items.map((i) => i.id)).toEqual(["a.list.0", "a.list.1"]);
  });

  it("seeded context values are returned without calling the loader fallback", async () => {
    const fallback = vi.fn(async () => ({ id: "fetched" }));
    const providerA = makeProvider("test.a", {
      provide: async (context) => {
        const record = await context.load<{ id: string }>("seeded-key", fallback);
        return makeContribution("test.a", [
          makeItem(record.id === "seeded" ? "a.seeded" : "a.fetched", "identity"),
        ]);
      },
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA]));

    const pkg = await assembler.assemble(request({ seed: { "seeded-key": { id: "seeded" } } }));

    expect(fallback).not.toHaveBeenCalled();
    expect(idsOf(pkg)).toContain("a.seeded");
  });
});

describe("Evidence Engine — provenance", () => {
  it("every item carries a source, section, and order", async () => {
    const providerA = makeProvider("test.a", {
      provide: async () =>
        makeContribution("test.a", [
          makeItem("a.identity", "identity", { order: 7 }),
        ]),
    });
    const assembler = new EvidenceAssembler(new EvidenceRegistry().registerAll([providerA]));

    const pkg = await assembler.assemble(request());
    const item = pkg.sections.flatMap((s) => s.items).find((i) => i.id === "a.identity")!;

    expect(item.sectionId).toBe("identity");
    expect(item.order).toBe(7);
    expect(item.source.system).toBe("test.system");
    expect(item.source.type).toBe("TestRecord");
    expect(item.source.id).toBe("a.identity");
    expect(pkg.metadata.evidenceVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.metadata.assembledAt).toBe(FIXED_NOW);
  });
});
