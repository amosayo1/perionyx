/**
 * Phase 22.3 — Decision Workspace: Composition service (server-only)
 *
 * Gathers all canonical AP repository data for one invoice and assembles the
 * Decision Workspace surface. Pure read projection — never called from client
 * components, never writes. PO/GRN reference objects are loaded directly from
 * Prisma (no PO/GRN repository exists in the AP registry).
 */

import { getAPRepositories } from "@/server/procurement/ap-repositories/registry";
import { loadPOReference, loadGRNReference } from "@/server/procurement/ap-repositories/po-grn-loader";
import type {
  APAuditRecord,
  ApprovalRecord,
  POReference,
  GRNReference,
} from "@/server/procurement/ap-repositories/types";
import type {
  ActionContext,
  AvailableAction,
  DecisionSummary,
  DecisionWorkspaceData,
  TimelineAction,
  TimelineEntry,
  WorkspaceEvidenceInput,
} from "./types";
import { assembleEvidencePackage, projectEvidenceGroups } from "./evidence";
import { deriveRecommendation } from "./recommendation";
import { formatCurrency, ageDays } from "./format";
import { toWorkQueueStatusLabel } from "@/modules/work-queue/status";
import { HIGH_VALUE_THRESHOLD } from "@/modules/work-queue/constants";
import { evaluateDecision, fromEvidencePackage } from "@/modules/decision-engine";
import type { FactValue } from "@/modules/decision-engine";

const TERMINAL_STATUSES = new Set(["REJECTED", "VOIDED", "PAID", "PARTIALLY_PAID"]);

const STATUS_EXPLANATIONS: Record<string, string> = {
  DRAFT: "Draft — not yet captured for processing.",
  CAPTURED: "Captured — available for validation.",
  VALIDATING: "Validation in progress.",
  VALIDATED: "Validated — ready for matching.",
  THREE_WAY_MATCHING: "Three-way match is being computed.",
  MATCHED: "Three-way match completed — ready for approval.",
  MATCH_FAILED: "Matching failed — needs review.",
  EXCEPTION: "An exception must be resolved before this can proceed.",
  PENDING_APPROVAL: "Awaiting approval.",
  APPROVED: "Approved — scheduled for payment.",
  REJECTED: "Rejected — no further processing.",
  PARTIALLY_PAID: "Partially paid.",
  PAID: "Paid in full.",
  VOIDED: "Voided — no financial impact.",
};

interface Loaded {
  invoice: WorkspaceEvidenceInput["invoice"];
  vendor: WorkspaceEvidenceInput["vendor"];
  lineItems: WorkspaceEvidenceInput["lineItems"];
  attachments: WorkspaceEvidenceInput["attachments"];
  exceptions: WorkspaceEvidenceInput["exceptions"];
  approvals: WorkspaceEvidenceInput["approvals"];
  match: WorkspaceEvidenceInput["match"];
  audit: WorkspaceEvidenceInput["audit"];
  payments: WorkspaceEvidenceInput["payments"];
  openCredits: WorkspaceEvidenceInput["openCredits"];
  recentInvoices: WorkspaceEvidenceInput["recentInvoices"];
  approvalLevels: WorkspaceEvidenceInput["approvalLevels"];
  po: POReference | null;
  grn: GRNReference | null;
}

export class DecisionWorkspaceService {
  async getDecisionWorkspace(invoiceId: string, companyId: string): Promise<DecisionWorkspaceData> {
    const repos = getAPRepositories();

    const invoice = await repos.invoice.findById(invoiceId, companyId);
    if (!invoice) {
      const err = new Error("Invoice not found") as Error & { code?: string };
      err.code = "NOT_FOUND";
      throw err;
    }

    const [
      vendorResult,
      lineItemsResult,
      attachmentsResult,
      exceptionsResult,
      approvalsResult,
      matchResult,
      auditResult,
      paymentResult,
      creditsResult,
      recentResult,
      levelsResult,
      poResult,
      grnResult,
    ] = await Promise.allSettled([
      repos.vendor.findById(invoice.vendorId, companyId),
      repos.invoice.getLineItems(invoiceId, companyId),
      repos.invoice.getAttachments(invoiceId, companyId),
      repos.exception.findByInvoiceId(invoiceId, companyId),
      repos.approval.findRecordsByInvoiceId(invoiceId, companyId),
      repos.match.findByInvoiceId(invoiceId, companyId),
      repos.audit.getEntityAuditTrail("PROCUREMENT_VENDOR_INVOICE", invoiceId, companyId),
      repos.paymentBatch.findByInvoiceId(invoiceId, companyId),
      invoice.vendorId ? repos.credit.findOpenByVendor(invoice.vendorId, companyId) : Promise.resolve([]),
      repos.invoice.findByVendorId(invoice.vendorId, companyId),
      repos.approval.getActiveLevels(companyId),
      invoice.poReferenceId ? loadPOReference(invoice.poReferenceId, companyId) : Promise.resolve(null),
      invoice.grnReferenceId ? loadGRNReference(invoice.grnReferenceId, companyId) : Promise.resolve(null),
    ]);

    const loaded: Loaded = {
      invoice,
      vendor: vendorResult.status === "fulfilled" ? vendorResult.value : null,
      lineItems: lineItemsResult.status === "fulfilled" ? lineItemsResult.value : [],
      attachments: attachmentsResult.status === "fulfilled" ? attachmentsResult.value : [],
      exceptions: exceptionsResult.status === "fulfilled" ? exceptionsResult.value : [],
      approvals: approvalsResult.status === "fulfilled" ? approvalsResult.value : [],
      match: matchResult.status === "fulfilled" ? matchResult.value : null,
      audit: auditResult.status === "fulfilled" ? auditResult.value : [],
      payments: paymentResult.status === "fulfilled" && paymentResult.value ? [paymentResult.value] : [],
      openCredits: creditsResult.status === "fulfilled" ? creditsResult.value : [],
      recentInvoices:
        recentResult.status === "fulfilled"
          ? recentResult.value.filter((i) => i.id !== invoiceId).slice(0, 6)
          : [],
      approvalLevels:
        levelsResult.status === "fulfilled"
          ? levelsResult.value.map((l) => ({
              levelNumber: l.levelNumber,
              levelName: l.levelName,
              minAmount: l.minAmount,
              maxAmount: l.maxAmount,
              requiredRoles: l.requiredRoles,
            }))
          : [],
      po: poResult.status === "fulfilled" ? poResult.value : null,
      grn: grnResult.status === "fulfilled" ? grnResult.value : null,
    };

    const input: WorkspaceEvidenceInput = {
      invoice: loaded.invoice,
      vendor: loaded.vendor,
      lineItems: loaded.lineItems,
      attachments: loaded.attachments,
      exceptions: loaded.exceptions,
      approvals: loaded.approvals,
      match: loaded.match,
      audit: loaded.audit,
      payments: loaded.payments,
      openCredits: loaded.openCredits,
      recentInvoices: loaded.recentInvoices,
      approvalLevels: loaded.approvalLevels,
      po: loaded.po,
      grn: loaded.grn,
    };

    const pkg = await assembleEvidencePackage(input);
    const evidenceGroups = projectEvidenceGroups(pkg, loaded.invoice);
    const recommendation = deriveRecommendation({
      invoice: loaded.invoice,
      match: loaded.match,
      exceptions: loaded.exceptions,
      hasPo: !!loaded.po,
      hasGrn: !!loaded.grn,
      payments: loaded.payments,
      recentInvoices: loaded.recentInvoices,
      hasCommunications: !!(loaded.invoice.vendorMemo || loaded.invoice.internalMemo),
      attachments: loaded.attachments,
      policyApplies: input.approvalLevels.length > 0,
    });

    const summary = this.buildSummary(loaded, recommendation);
    const timeline = this.buildTimeline(loaded);
    const actions = this.buildActions(loaded.invoice.status);
    const decision = evaluateDecision(
      fromEvidencePackage(pkg, {
        state: TERMINAL_STATUSES.has(loaded.invoice.status) ? "terminal" : "actionable",
        statusLabel: toWorkQueueStatusLabel(loaded.invoice.status),
        facts: this.buildDecisionFacts(loaded),
      }),
    );

    const currency = loaded.invoice.currency || loaded.vendor?.currency || "USD";

    return {
      invoiceId: loaded.invoice.id,
      invoiceNumber: loaded.invoice.invoiceNumber,
      currency,
      status: {
        label: toWorkQueueStatusLabel(loaded.invoice.status),
        explanation: STATUS_EXPLANATIONS[loaded.invoice.status] ?? "Review this invoice.",
      },
      summary,
      evidenceGroups,
      timeline,
      actions,
      decision,
      context: {
        status: loaded.invoice.status,
        totalWithTax: loaded.invoice.totalWithTax,
        vendorName: loaded.vendor?.name ?? "Unknown supplier",
        terminal: TERMINAL_STATUSES.has(loaded.invoice.status),
      },
    };
  }

  // ── Summary (left zone) ────────────────────────────────────────────────

  private buildSummary(loaded: Loaded, recommendation: DecisionSummary["recommendation"]): DecisionSummary {
    const { invoice, vendor } = loaded;
    const currency = invoice.currency || vendor?.currency || "USD";
    const amount = invoice.netBalance ?? invoice.totalWithTax;

    const level = this.applicableLevel(loaded.approvalLevels, amount);
    const overdueDays = invoice.dueDate ? ageDays(invoice.dueDate) : null;
    const isOverdue = overdueDays !== null && overdueDays < 0;

    return {
      status: {
        label: toWorkQueueStatusLabel(invoice.status),
        explanation: STATUS_EXPLANATIONS[invoice.status] ?? "Review this invoice.",
      },
      recommendation,
      risks: recommendation.riskFactors,
      requiredAction: recommendation.suggestedAction,
      businessImpact: {
        exposure: formatCurrency(invoice.totalWithTax, currency),
        overdueDays: isOverdue ? Math.abs(overdueDays) : null,
        aging: `${Math.max(0, ageDays(invoice.receivedDate ?? invoice.createdAt) ?? 0)} days`,
        highValue: amount >= HIGH_VALUE_THRESHOLD,
      },
      policy: level
        ? {
            label: level.levelName,
            threshold: `${formatCurrency(level.minAmount, currency)}${level.maxAmount != null ? ` – ${formatCurrency(level.maxAmount, currency)}` : "+"}`,
            applies: true,
          }
        : { label: "Approval matrix", threshold: "No matching entry", applies: false },
    };
  }

  // ── Timeline (06 §9) ───────────────────────────────────────────────────

  private buildTimeline(loaded: Loaded): TimelineEntry[] {
    const entries: TimelineEntry[] = [];

    for (const a of loaded.audit) {
      entries.push(this.fromAudit(a));
    }
    for (const a of loaded.approvals) {
      entries.push(this.fromApproval(a));
    }
    if (entries.length === 0) {
      entries.push({
        id: "timeline.none",
        at: loaded.invoice.createdAt,
        actor: loaded.invoice.createdBy ?? "system",
        actorRole: null,
        action: "CREATED",
        detail: `Invoice ${loaded.invoice.invoiceNumber} recorded`,
        evidence: [],
        outcome: null,
      });
    }

    return entries.sort((a, b) => (a.at < b.at ? 1 : -1));
  }

  private fromAudit(a: APAuditRecord): TimelineEntry {
    const change =
      a.field && a.oldValue != null && a.newValue != null
        ? `${a.field}: ${a.oldValue} → ${a.newValue}`
        : null;
    return {
      id: a.id,
      at: a.createdAt,
      actor: this.shortenActor(a.userId),
      actorRole: a.userRole,
      action: this.mapAuditAction(a.action),
      detail: [a.description, a.reason, change].filter(Boolean).join(" · "),
      evidence: a.amount != null ? [`amount ${a.amount}`] : [],
      outcome: a.newValue ?? null,
    };
  }

  private fromApproval(a: ApprovalRecord): TimelineEntry {
    const action: TimelineAction =
      a.decision === "APPROVE" ? "APPROVED" : a.decision === "REJECT" ? "REJECTED" : a.status === "DELEGATED" ? "DELEGATED" : "STATUS_CHANGED";
    return {
      id: a.id,
      at: a.decisionAt ?? a.createdAt,
      actor: this.shortenActor(a.decisionBy ?? a.createdBy),
      actorRole: a.requiredRole,
      action,
      detail: `${a.approvalLevelName} (level ${a.approvalLevel})${a.decisionComment ? ` · ${a.decisionComment}` : ""}${a.delegatedTo ? ` · delegated to ${this.shortenActor(a.delegatedTo)}` : ""}`,
      evidence: [a.status],
      outcome: a.status,
    };
  }

  private mapAuditAction(action: string): TimelineAction {
    switch (action) {
      case "CREATED":
        return "CREATED";
      case "STATUS_CHANGED":
        return "STATUS_CHANGED";
      case "APPROVED":
        return "APPROVED";
      case "REJECTED":
        return "REJECTED";
      case "DELEGATED":
        return "DELEGATED";
      case "ESCALATED":
        return "ESCALATED";
      case "EXCEPTION":
        return "EXCEPTION";
      case "RESOLVED":
        return "RESOLVED";
      case "PAID":
        return "PAID";
      case "VOIDED":
        return "VOIDED";
      default:
        return "UPDATED";
    }
  }

  private shortenActor(id: string): string {
    if (!id) return "system";
    return id.length > 10 ? `${id.slice(0, 8)}…` : id;
  }

  // ── Actions (right zone) — mirrors the command service status guards ───

  private buildActions(status: string): ActionContext {
    const can = (set: string[]): boolean => set.includes(status);
    const available: AvailableAction[] = [];
    if (can(["MATCHED", "PENDING_APPROVAL"])) available.push("approve");
    if (can(["MATCHED", "PENDING_APPROVAL", "APPROVED"])) available.push("reject");
    if (can(["MATCHED", "PENDING_APPROVAL"])) available.push("escalate");
    if (can(["CAPTURED", "VALIDATED"])) available.push("block");
    if (can(["CAPTURED", "VALIDATED", "MATCHED"])) available.push("dispute");
    if (can(["CAPTURED", "VALIDATED"])) available.push("void");

    return {
      available,
      requiresReason: available.filter((a) => a !== "approve"),
      terminal: TERMINAL_STATUSES.has(status),
      consequence: this.consequenceText(),
    };
  }

  private consequenceText(): Record<AvailableAction, string> {
    return {
      approve: "Moves the invoice to APPROVED and schedules it for payment. An audit entry records your identity, role, and timestamp.",
      reject: "Moves the invoice to REJECTED. This is irreversible on this surface — re-approval requires a new workflow. Your reason is recorded in the audit trail.",
      escalate: "Escalates the approval to the next authority with your reason. The approval record is marked ESCALATED.",
      block: "Blocks the invoice from processing and records the reason. It stays blocked until explicitly unblocked.",
      dispute: "Moves the invoice to EXCEPTION with a DISPUTED memo. It will not be paid while disputed.",
      void: "Voids the invoice and its financial impact. The void and your reason are recorded in the audit trail.",
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  /**
   * Measured facts for the Decision Intelligence engine (ap.invoice decision
   * type). Every value is a real field read from the loaded records — the
   * engine never receives formatted strings and never fabricates numbers.
   */
  private buildDecisionFacts(loaded: Loaded): Record<string, FactValue> {
    const { invoice, vendor, match } = loaded;
    const balance = invoice.netBalance ?? invoice.totalWithTax;
    const openExceptions = loaded.exceptions.filter(
      (e) => e.status === "OPEN" || e.status === "IN_REVIEW" || e.status === "ESCALATED",
    );
    const overdueDays = invoice.dueDate ? ageDays(invoice.dueDate) : null;
    const approved = loaded.approvals.some((a) => a.decision === "APPROVE");

    return {
      netBalance: balance,
      totalWithTax: invoice.totalWithTax,
      highValue: balance >= HIGH_VALUE_THRESHOLD,
      overdue: overdueDays !== null && overdueDays < 0,
      overdueDays: overdueDays !== null && overdueDays < 0 ? Math.abs(overdueDays) : 0,
      openExceptions: openExceptions.length > 0,
      exceptionCount: openExceptions.length,
      matchConfidence: match?.overallConfidence ?? 0,
      matchStatus: match?.matchResult ?? "NO_MATCH",
      vendorRiskLevel: vendor?.riskLevel ?? "UNKNOWN",
      vendorBlocked: vendor?.isBlocked ?? false,
      vendorIsNew: !!vendor && loaded.recentInvoices.length === 0,
      hasPo: !!loaded.po,
      hasGrn: !!loaded.grn,
      approved,
      policyApplies: loaded.approvalLevels.length > 0,
      terminal: TERMINAL_STATUSES.has(invoice.status),
    };
  }

  private applicableLevel(
    levels: WorkspaceEvidenceInput["approvalLevels"],
    amount: number,
  ): WorkspaceEvidenceInput["approvalLevels"][number] | null {
    const active = [...levels].sort((a, b) => a.minAmount - b.minAmount);
    for (const level of active) {
      if (amount >= level.minAmount && (level.maxAmount == null || amount <= level.maxAmount)) {
        return level;
      }
    }
    return active[active.length - 1] ?? null;
  }
}

export const decisionWorkspaceService = new DecisionWorkspaceService();
