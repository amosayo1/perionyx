import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ValidationIssueData, Severity, ValidationCategory } from "./types";

export class ValidationEngineService {
  static async validateImport(ctx: TenantContext, data: { instanceId?: string; syncHistoryId?: string; rows: Record<string, unknown>[] }): Promise<ValidationIssueData[]> {
    const issues: ValidationIssueData[] = [];
    issues.push(...this.validateDebitCredit(data.rows));
    issues.push(...this.validateDuplicateInvoices(data.rows));
    issues.push(...this.validateMissingGLAccounts(data.rows));
    issues.push(...this.validateInactiveAccounts(data.rows, ctx));
    issues.push(...this.validateInvalidDepartments(data.rows, ctx));
    issues.push(...this.validateInvalidCostCenters(data.rows, ctx));
    issues.push(...this.validateInvalidCurrencies(data.rows));
    issues.push(...this.validateInvalidDates(data.rows));
    issues.push(...this.validateMissingRequiredFields(data.rows, ["account", "amount", "currency"]));
    issues.push(...this.validateOutOfBalanceJournals(data.rows));
    const enriched = issues.map(issue => ({ ...issue, instanceId: data.instanceId, syncHistoryId: data.syncHistoryId }));
    for (const issue of enriched) {
      await prisma.validationIssue.create({
        data: { companyId: ctx.companyId, instanceId: issue.instanceId, syncHistoryId: issue.syncHistoryId, severity: issue.severity, category: issue.category, code: issue.code, message: issue.message, affectedRecords: issue.affectedRecords ?? [], resolution: issue.resolution },
      });
    }
    return enriched;
  }

  static async recordIssues(ctx: TenantContext, issues: ValidationIssueData[]): Promise<void> {
    for (const issue of issues) {
      await prisma.validationIssue.create({
        data: { companyId: ctx.companyId, instanceId: issue.instanceId, syncHistoryId: issue.syncHistoryId, severity: issue.severity, category: issue.category, code: issue.code, message: issue.message, affectedRecords: issue.affectedRecords ?? [], resolution: issue.resolution },
      });
    }
  }

  static async listIssues(ctx: TenantContext, opts?: { severity?: string; category?: string; isResolved?: boolean; limit?: number; offset?: number }): Promise<{ issues: ValidationIssueData[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts?.severity) where.severity = opts.severity;
    if (opts?.category) where.category = opts.category;
    if (opts?.isResolved != null) where.isResolved = opts.isResolved;
    const [records, total] = await Promise.all([
      prisma.validationIssue.findMany({ where, orderBy: { createdAt: "desc" }, take: opts?.limit ?? 50, skip: opts?.offset ?? 0 }),
      prisma.validationIssue.count({ where }),
    ]);
    return { issues: records.map(r => ({ id: r.id, companyId: r.companyId, instanceId: r.instanceId ?? undefined, syncHistoryId: r.syncHistoryId ?? undefined, severity: r.severity as Severity, category: r.category as ValidationCategory, code: r.code, message: r.message, affectedRecords: r.affectedRecords as string[] | undefined, resolution: r.resolution ?? undefined, isResolved: r.isResolved, resolvedBy: r.resolvedBy ?? undefined, resolvedAt: r.resolvedAt?.toISOString() })), total };
  }

  static async resolveIssue(ctx: TenantContext, issueId: string, resolvedBy: string): Promise<void> {
    await prisma.validationIssue.update({ where: { id: issueId }, data: { isResolved: true, resolvedBy, resolvedAt: new Date() } });
  }

  static async getIssueSummary(ctx: TenantContext): Promise<{ total: number; errors: number; warnings: number; byCategory: Record<string, number> }> {
    const issues = await prisma.validationIssue.findMany({ where: { companyId: ctx.companyId, isResolved: false } });
    const total = issues.length;
    const errors = issues.filter(i => i.severity === "error").length;
    const warnings = issues.filter(i => i.severity === "warning").length;
    const byCategory: Record<string, number> = {};
    for (const issue of issues) {
      byCategory[issue.category] = (byCategory[issue.category] ?? 0) + 1;
    }
    return { total, errors, warnings, byCategory };
  }

  private static validateDebitCredit(rows: Record<string, unknown>[]): ValidationIssueData[] {
    const issues: ValidationIssueData[] = [];
    const journalGroups = new Map<string, { debits: number; credits: number }>();
    for (const row of rows) {
      const journal = String(row.journalId ?? row.journal ?? "");
      const debit = Math.abs(Number(row.debit ?? row.debitAmount ?? 0));
      const credit = Math.abs(Number(row.credit ?? row.creditAmount ?? 0));
      if (!journal) continue;
      if (!journalGroups.has(journal)) journalGroups.set(journal, { debits: 0, credits: 0 });
      const g = journalGroups.get(journal)!;
      g.debits += debit;
      g.credits += credit;
    }
    for (const [journal, { debits, credits }] of journalGroups) {
      if (Math.abs(debits - credits) > 0.01) {
        issues.push({ id: crypto.randomUUID(), companyId: "", severity: "error", category: "debit-credit", code: "DC-001", message: `Journal ${journal} is out of balance: debits ${debits.toFixed(2)} vs credits ${credits.toFixed(2)}`, affectedRecords: [journal], resolution: "Review journal entries and ensure debits equal credits", isResolved: false });
      }
    }
    return issues;
  }

  private static validateDuplicateInvoices(rows: Record<string, unknown>[]): ValidationIssueData[] {
    const issues: ValidationIssueData[] = [];
    const invoiceMap = new Map<string, number>();
    for (const row of rows) {
      const inv = String(row.invoiceNumber ?? row.invoice ?? "");
      if (!inv) continue;
      invoiceMap.set(inv, (invoiceMap.get(inv) ?? 0) + 1);
    }
    for (const [inv, count] of invoiceMap) {
      if (count > 1) {
        issues.push({ id: crypto.randomUUID(), companyId: "", severity: "warning", category: "duplicate-invoice", code: "DUP-INV-001", message: `Duplicate invoice number: ${inv} (${count} occurrences)`, affectedRecords: [inv], resolution: "Verify if these are legitimate duplicates or data entry errors", isResolved: false });
      }
    }
    return issues;
  }

  private static validateMissingGLAccounts(rows: Record<string, unknown>[]): ValidationIssueData[] {
    const issues: ValidationIssueData[] = [];
    for (const row of rows) {
      const acct = String(row.account ?? row.accountNumber ?? row.glAccount ?? "");
      if (!acct) {
        issues.push({ id: crypto.randomUUID(), companyId: "", severity: "error", category: "missing-gl-account", code: "GL-MISS-001", message: "Row missing GL account number", resolution: "Assign a valid GL account number", isResolved: false });
      }
    }
    return issues;
  }

  private static validateInactiveAccounts(rows: Record<string, unknown>[], ctx: TenantContext): ValidationIssueData[] {
    return [];
  }

  private static validateInvalidDepartments(rows: Record<string, unknown>[], ctx: TenantContext): ValidationIssueData[] {
    return [];
  }

  private static validateInvalidCostCenters(rows: Record<string, unknown>[], ctx: TenantContext): ValidationIssueData[] {
    return [];
  }

  private static validateInvalidCurrencies(rows: Record<string, unknown>[]): ValidationIssueData[] {
    const issues: ValidationIssueData[] = [];
    const valid = /^[A-Z]{3}$/;
    for (const row of rows) {
      const cur = String(row.currency ?? "");
      if (cur && !valid.test(cur)) {
        issues.push({ id: crypto.randomUUID(), companyId: "", severity: "warning", category: "invalid-currency", code: "CUR-001", message: `Invalid currency code: ${cur}`, resolution: "Use ISO 4217 three-letter currency codes", isResolved: false });
      }
    }
    return issues;
  }

  private static validateInvalidDates(rows: Record<string, unknown>[]): ValidationIssueData[] {
    const issues: ValidationIssueData[] = [];
    for (const row of rows) {
      const date = String(row.date ?? row.transactionDate ?? "");
      if (date && isNaN(Date.parse(date))) {
        issues.push({ id: crypto.randomUUID(), companyId: "", severity: "error", category: "invalid-date", code: "DATE-001", message: `Invalid date format: ${date}`, resolution: "Use ISO 8601 date format (YYYY-MM-DD)", isResolved: false });
      }
    }
    return issues;
  }

  private static validateMissingRequiredFields(rows: Record<string, unknown>[], required: string[]): ValidationIssueData[] {
    const issues: ValidationIssueData[] = [];
    for (let i = 0; i < rows.length; i++) {
      for (const field of required) {
        const val = rows[i][field];
        if (val === undefined || val === null || val === "") {
          issues.push({ id: crypto.randomUUID(), companyId: "", severity: "error", category: "missing-field", code: "REQ-001", message: `Row ${i + 1}: missing required field "${field}"`, resolution: `Provide a value for ${field}`, isResolved: false });
        }
      }
    }
    return issues;
  }

  private static validateOutOfBalanceJournals(rows: Record<string, unknown>[]): ValidationIssueData[] {
    return this.validateDebitCredit(rows);
  }
}
