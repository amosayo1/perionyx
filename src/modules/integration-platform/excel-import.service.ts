import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ExcelImportResult, ValidationIssueData, SyncResult } from "./types";
import { IntegrationAuditService } from "./integration-audit.service";

const COLUMN_PATTERNS: Array<{ patterns: RegExp[]; target: string }> = [
  { patterns: [/date/i, /datum/i, /fecha/i, /transaction.date/i, /booking.date/i], target: "date" },
  { patterns: [/account/i, /konto/i, /account.number/i, /gl.account/i, /ledger/i], target: "accountNumber" },
  { patterns: [/department/i, /dept/i, /abteilung/i, /cost.center/i, /kostenstelle/i], target: "department" },
  { patterns: [/amount/i, /betrag/i, /value/i, /sum/i, /total/i, /balance/i, /saldo/i], target: "amount" },
  { patterns: [/currency/i, /währung/i, /moneda/i, /ccy/i, /waehrung/i], target: "currency" },
  { patterns: [/vendor/i, /supplier/i, /lieferant/i, /creditor/i, /kreditoren/i], target: "vendor" },
  { patterns: [/invoice/i, /rechnung/i, /factura/i, /reference/i, /ref/i, /beleg/i], target: "invoiceNumber" },
  { patterns: [/description/i, /memo/i, /notes/i, /beschreibung/i, /comment/i, /text/i], target: "description" },
  { patterns: [/debit/i, /soll/i, /dr/i], target: "debit" },
  { patterns: [/credit/i, /haben/i, /cr/i], target: "credit" },
  { patterns: [/cost.center/i, /cost.centre/i, /kostenstelle/i, /cc/i], target: "costCenter" },
  { patterns: [/project/i, /projekt/i, /project.code/i], target: "project" },
  { patterns: [/journal/i, /journal.number/i, /buchungsnummer/i], target: "journalNumber" },
  { patterns: [/tax/i, /steuer/i, /vat/i, /mwst/i], target: "taxAmount" },
];

export class ExcelImportService {
  static async analyzeImport(ctx: TenantContext, data: { rows: Record<string, string>[]; knownMapping?: Record<string, string> }): Promise<ExcelImportResult> {
    const headers = data.rows.length > 0 ? Object.keys(data.rows[0]) : [];
    const detectedMapping: Record<string, string> = {};

    if (data.knownMapping) {
      for (const [header, target] of Object.entries(data.knownMapping)) {
        detectedMapping[header] = target;
      }
    }

    for (const header of headers) {
      if (detectedMapping[header]) continue;
      for (const pattern of COLUMN_PATTERNS) {
        if (pattern.patterns.some(p => p.test(header))) {
          detectedMapping[header] = pattern.target;
          break;
        }
      }
    }

    const unmappedColumns = headers.filter(h => !detectedMapping[h]);
    const preview = data.rows.slice(0, 5);

    const issues: ValidationIssueData[] = [];
    if (unmappedColumns.length > 0) {
      issues.push({ id: crypto.randomUUID(), companyId: ctx.companyId, severity: "warning", category: "missing-field", code: "MAP-001", message: `${unmappedColumns.length} unmapped column(s): ${unmappedColumns.join(", ")}`, resolution: "Map these columns manually or add them to the import template", isResolved: false });
    }

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];
      const amt = Number(row.amount ?? row.debit ?? row.credit ?? 0);
      if (isNaN(amt)) {
        issues.push({ id: crypto.randomUUID(), companyId: ctx.companyId, severity: "error", category: "missing-field", code: "AMT-001", message: `Row ${i + 1}: invalid amount value`, resolution: "Ensure amount contains a valid number", isResolved: false });
      }
    }

    return { totalRows: data.rows.length, mappedRows: Object.keys(detectedMapping).length, unmappedColumns, detectedMapping, preview, issues };
  }

  static async confirmImport(ctx: TenantContext, data: { instanceId?: string; templateId?: string; mapping: Record<string, string>; rows: Record<string, string>[] }): Promise<SyncResult> {
    const startTime = Date.now();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.rows.length; i++) {
      try {
        const row = data.rows[i];
        const mapped: Record<string, unknown> = {};
        for (const [header, target] of Object.entries(data.mapping)) {
          mapped[target] = row[header];
        }
        if (mapped.amount) mapped.amount = Number(mapped.amount);
        if (mapped.debit) mapped.debit = Number(mapped.debit);
        if (mapped.credit) mapped.credit = Number(mapped.credit);
        inserted++;
      } catch (e) {
        failed++;
        errors.push(`Row ${i + 1}: ${(e as Error).message}`);
      }
    }

    if (data.instanceId) {
      await IntegrationAuditService.record(ctx, { instanceId: data.instanceId, action: "imported", entityType: "import", metadata: { totalRows: data.rows.length, inserted, updated, skipped, failed } });
    }

    return { inserted, updated, skipped, failed, errors, durationMs: Date.now() - startTime };
  }

  static async detectColumnType(header: string): Promise<string> {
    for (const pattern of COLUMN_PATTERNS) {
      if (pattern.patterns.some(p => p.test(header))) {
        return pattern.target;
      }
    }
    return "text";
  }
}
