/**
 * Phase 22.4 — Decision Workspace: Evidence Package adapter
 *
 * Thin engine-delegating projection. Builds an `EvidenceRequest` (seeding the
 * pre-loaded records the workspace already gathered) and projects the
 * canonical Evidence Package into the workspace's 14-group layout. One source
 * of truth — the engine assembles, this file only re-groups and re-labels.
 *
 * Every projected item keeps the engine's explainability surface: status,
 * confidence band + basis, timestamp, related records, and why it matters.
 */

import type {
  EvidenceGroup,
  EvidenceItem,
  EvidenceStatus,
  WorkspaceEvidenceInput,
} from "./types";
import { assembleEvidenceFor } from "@/modules/evidence";
import type { EvidenceItem as EngineEvidenceItem, EvidencePackage } from "@/modules/evidence";
import { EVIDENCE_LOAD_KEYS, registerAPEvidenceProviders } from "@/modules/evidence/providers/ap";
import type { VendorInvoice } from "@/server/procurement/ap-repositories/types";

const GROUP_LAYOUT: ReadonlyArray<{ id: string; title: string; description: string; order: number }> = [
  { id: "invoice", title: "Invoice", description: "", order: 1 },
  { id: "line-items", title: "Line items", description: "The line-level detail behind the match", order: 2 },
  { id: "matching", title: "Matching", description: "Invoice ↔ PO ↔ GRN reconciliation", order: 3 },
  { id: "exceptions", title: "Exceptions", description: "Open and resolved exception work", order: 4 },
  { id: "duplicate-detection", title: "Duplicate detection", description: "Same-vendor and cross-vendor duplicate signals", order: 5 },
  { id: "po", title: "Purchase order", description: "The PO this invoice references", order: 6 },
  { id: "grn", title: "Goods receipt", description: "The GRN this invoice references", order: 7 },
  { id: "vendor", title: "Supplier", description: "Who is being paid", order: 8 },
  { id: "policy-checks", title: "Policy checks", description: "Governing rules for this decision", order: 9 },
  { id: "transaction-history", title: "Transaction history", description: "Payments and credits applied to this invoice", order: 10 },
  { id: "previous-decisions", title: "Previous decisions", description: "Approval chain on this invoice", order: 11 },
  { id: "similar-cases", title: "Similar cases", description: "Recent invoices from the same supplier", order: 12 },
  { id: "communications", title: "Communications", description: "Notes and memos attached to the invoice", order: 13 },
  { id: "supporting-documents", title: "Supporting documents", description: "Source evidence attached to the invoice", order: 14 },
];

const KNOWN_GROUP_IDS = new Set(GROUP_LAYOUT.map((g) => g.id));

export async function assembleEvidencePackage(input: WorkspaceEvidenceInput): Promise<EvidencePackage> {
  registerAPEvidenceProviders();

  return assembleEvidenceFor({
    entityType: "ap.invoice",
    entityId: input.invoice.id,
    tenantId: input.invoice.companyId,
    seed: {
      [EVIDENCE_LOAD_KEYS.invoice]: input.invoice,
      [EVIDENCE_LOAD_KEYS.vendor]: input.vendor,
      [EVIDENCE_LOAD_KEYS.lineItems]: input.lineItems,
      [EVIDENCE_LOAD_KEYS.attachments]: input.attachments,
      [EVIDENCE_LOAD_KEYS.exceptions]: input.exceptions,
      [EVIDENCE_LOAD_KEYS.approvals]: input.approvals,
      [EVIDENCE_LOAD_KEYS.match]: input.match,
      [EVIDENCE_LOAD_KEYS.audit]: input.audit,
      [EVIDENCE_LOAD_KEYS.payments]: input.payments,
      [EVIDENCE_LOAD_KEYS.openCredits]: input.openCredits,
      [EVIDENCE_LOAD_KEYS.recentInvoices]: input.recentInvoices,
      [EVIDENCE_LOAD_KEYS.approvalLevels]: input.approvalLevels,
      [EVIDENCE_LOAD_KEYS.po]: input.po,
      [EVIDENCE_LOAD_KEYS.grn]: input.grn,
    },
  });
}

export async function buildEvidencePackage(input: WorkspaceEvidenceInput): Promise<EvidenceGroup[]> {
  const pkg = await assembleEvidencePackage(input);
  return projectEvidenceGroups(pkg, input.invoice);
}

export function projectEvidenceGroups(pkg: EvidencePackage, invoice: VendorInvoice): EvidenceGroup[] {
  return project(pkg, invoice);
}

function project(pkg: EvidencePackage, invoice: VendorInvoice): EvidenceGroup[] {
  const byGroup = new Map<string, EngineEvidenceItem[]>();

  for (const section of pkg.sections) {
    for (const item of section.items) {
      if (!KNOWN_GROUP_IDS.has(item.groupId)) continue;
      const bucket = byGroup.get(item.groupId) ?? [];
      bucket.push(item);
      byGroup.set(item.groupId, bucket);
    }
  }

  return GROUP_LAYOUT.map((layout) => {
    const items = (byGroup.get(layout.id) ?? [])
      .sort((a, b) => a.order - b.order)
      .map(projectItem);
    const description =
      layout.id === "invoice" ? `What is being decided — ${invoice.invoiceNumber}` : layout.description;
    return { id: layout.id, title: layout.title, description, order: layout.order, items };
  });
}

function projectItem(item: EngineEvidenceItem): EvidenceItem {
  return {
    id: item.id,
    groupId: item.groupId,
    label: item.title,
    value: item.summary,
    status: item.status as EvidenceStatus,
    confidence: item.confidence,
    confidenceBasis: item.confidenceBasis,
    evidence: item.evidence,
    timestamp: item.timestamp,
    related: item.related,
    whyItMatters: item.reason,
    expandable: item.expandable,
  };
}

