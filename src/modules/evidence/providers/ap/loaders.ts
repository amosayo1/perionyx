/**
 * Phase 22.4 — AP Evidence Providers: shared loaders
 *
 * Canonical load keys + seeded/fallback loaders for the AP evidence providers.
 *
 * Every provider reads through `EvidenceAssemblyContext.load(key, fn)`. When a
 * consumer (e.g. the Decision Workspace) has already fetched the record for its
 * own zones, it seeds the context under the same key and `fn` is never called —
 * the engine never re-fetches what the caller already has. When no seed exists,
 * `fn` falls back to the canonical AP repository so a direct
 * `assembleEvidenceFor()` call still works.
 */

import type { EvidenceAssemblyContext } from "../../types";
import { getAPRepositories } from "@/server/procurement/ap-repositories/registry";
import { loadPOReference, loadGRNReference } from "@/server/procurement/ap-repositories/po-grn-loader";
import type {
  APAuditRecord,
  ApprovalRecord,
  GRNReference,
  InvoiceAttachment,
  InvoiceException,
  InvoiceLineItem,
  PaymentRecord,
  POReference,
  ThreeWayMatch,
  Vendor,
  VendorCredit,
  VendorInvoice,
} from "@/server/procurement/ap-repositories/types";
import type { ApprovalLevelLike } from "./helpers";

/**
 * Canonical load keys. Consumers seed the context with these keys so the
 * providers skip the repository fallback. Shared by the AP providers and the
 * Decision Workspace adapter — one source of truth for key names.
 */
export const EVIDENCE_LOAD_KEYS = {
  invoice: "invoice",
  vendor: "vendor",
  lineItems: "line-items",
  attachments: "attachments",
  exceptions: "exceptions",
  approvals: "approvals",
  match: "match",
  audit: "audit",
  payments: "payments",
  openCredits: "open-credits",
  recentInvoices: "recent-invoices",
  approvalLevels: "approval-levels",
  po: "po",
  grn: "grn",
} as const;

const INVOICE_ENTITY_TYPE = "PROCUREMENT_VENDOR_INVOICE";

export function loadInvoice(context: EvidenceAssemblyContext): Promise<VendorInvoice | null> {
  return context.load<VendorInvoice | null>(EVIDENCE_LOAD_KEYS.invoice, async () => {
    const repos = getAPRepositories();
    return repos.invoice.findById(context.request.entityId, context.request.tenantId);
  });
}

export function loadVendor(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<Vendor | null> {
  return context.load<Vendor | null>(EVIDENCE_LOAD_KEYS.vendor, async () => {
    if (!invoice) return null;
    return getAPRepositories().vendor.findById(invoice.vendorId, context.request.tenantId);
  });
}

export function loadLineItems(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<InvoiceLineItem[]> {
  return context.load<InvoiceLineItem[]>(EVIDENCE_LOAD_KEYS.lineItems, async () => {
    if (!invoice) return [];
    return getAPRepositories().invoice.getLineItems(invoice.id, context.request.tenantId);
  });
}

export function loadAttachments(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<InvoiceAttachment[]> {
  return context.load<InvoiceAttachment[]>(EVIDENCE_LOAD_KEYS.attachments, async () => {
    if (!invoice) return [];
    return getAPRepositories().invoice.getAttachments(invoice.id, context.request.tenantId);
  });
}

export function loadExceptions(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<InvoiceException[]> {
  return context.load<InvoiceException[]>(EVIDENCE_LOAD_KEYS.exceptions, async () => {
    if (!invoice) return [];
    return getAPRepositories().exception.findByInvoiceId(invoice.id, context.request.tenantId);
  });
}

export function loadApprovals(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<ApprovalRecord[]> {
  return context.load<ApprovalRecord[]>(EVIDENCE_LOAD_KEYS.approvals, async () => {
    if (!invoice) return [];
    return getAPRepositories().approval.findRecordsByInvoiceId(invoice.id, context.request.tenantId);
  });
}

export function loadMatch(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<ThreeWayMatch | null> {
  return context.load<ThreeWayMatch | null>(EVIDENCE_LOAD_KEYS.match, async () => {
    if (!invoice) return null;
    return getAPRepositories().match.findByInvoiceId(invoice.id, context.request.tenantId);
  });
}

export function loadAudit(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<APAuditRecord[]> {
  return context.load<APAuditRecord[]>(EVIDENCE_LOAD_KEYS.audit, async () => {
    if (!invoice) return [];
    return getAPRepositories().audit.getEntityAuditTrail(
      INVOICE_ENTITY_TYPE,
      invoice.id,
      context.request.tenantId,
    );
  });
}

export function loadPayments(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<PaymentRecord[]> {
  return context.load<PaymentRecord[]>(EVIDENCE_LOAD_KEYS.payments, async () => {
    if (!invoice) return [];
    const record = await getAPRepositories().paymentBatch.findByInvoiceId(
      invoice.id,
      context.request.tenantId,
    );
    return record ? [record] : [];
  });
}

export function loadOpenCredits(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<VendorCredit[]> {
  return context.load<VendorCredit[]>(EVIDENCE_LOAD_KEYS.openCredits, async () => {
    if (!invoice?.vendorId) return [];
    return getAPRepositories().credit.findOpenByVendor(invoice.vendorId, context.request.tenantId);
  });
}

export function loadRecentInvoices(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<VendorInvoice[]> {
  return context.load<VendorInvoice[]>(EVIDENCE_LOAD_KEYS.recentInvoices, async () => {
    if (!invoice) return [];
    const invoices = await getAPRepositories().invoice.findByVendorId(
      invoice.vendorId,
      context.request.tenantId,
    );
    return invoices.filter((i) => i.id !== invoice.id).slice(0, 6);
  });
}

export function loadApprovalLevels(context: EvidenceAssemblyContext): Promise<ApprovalLevelLike[]> {
  return context.load<ApprovalLevelLike[]>(EVIDENCE_LOAD_KEYS.approvalLevels, async () => {
    const levels = await getAPRepositories().approval.getActiveLevels(context.request.tenantId);
    return levels.map((l) => ({
      levelNumber: l.levelNumber,
      levelName: l.levelName,
      minAmount: l.minAmount,
      maxAmount: l.maxAmount,
      requiredRoles: l.requiredRoles,
    }));
  });
}

export function loadPO(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<POReference | null> {
  return context.load<POReference | null>(EVIDENCE_LOAD_KEYS.po, async () => {
    if (!invoice?.poReferenceId) return null;
    return loadPOReference(invoice.poReferenceId, context.request.tenantId);
  });
}

export function loadGRN(
  context: EvidenceAssemblyContext,
  invoice: VendorInvoice | null,
): Promise<GRNReference | null> {
  return context.load<GRNReference | null>(EVIDENCE_LOAD_KEYS.grn, async () => {
    if (!invoice?.grnReferenceId) return null;
    return loadGRNReference(invoice.grnReferenceId, context.request.tenantId);
  });
}
