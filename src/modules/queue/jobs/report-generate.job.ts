import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

interface ReportGenerateData {
  companyId: string;
  userId: string;
  format: "csv" | "json";
  dataset: string;
  columns: string[];
  filters?: Record<string, string>;
}

interface ReportResult {
  csv?: string;
  data?: Record<string, any>[];
  total: number;
}

const DATASET_QUERIES: Record<string, (companyId: string) => Promise<Record<string, any>[]>> = {
  transactions: async (companyId) =>
    prisma.transaction.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 10000 }) as unknown as Record<string, any>[],
  ledger: async (companyId) =>
    prisma.ledgerEntry.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 10000 }) as unknown as Record<string, any>[],
  approvals: async (companyId) =>
    prisma.transactionApproval.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 10000 }) as unknown as Record<string, any>[],
  risk: async (companyId) =>
    prisma.riskIncident.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 10000 }) as unknown as Record<string, any>[],
  audit: async (companyId) =>
    prisma.auditLog.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 10000 }) as unknown as Record<string, any>[],
};

export async function generateReport(data: ReportGenerateData): Promise<ReportResult> {
  const { companyId, format, dataset, columns, filters } = data;
  const queryFn = DATASET_QUERIES[dataset];
  if (!queryFn) throw new Error(`Unknown dataset: ${dataset}`);

  let rows = await queryFn(companyId);

  if (filters?.status) {
    rows = rows.filter((r: any) => String(r.status ?? "").toLowerCase() === filters.status!.toLowerCase());
  }

  const selectedColumns = columns.length > 0 ? columns : Object.keys(rows[0] ?? {});
  const result = rows.map((row) => {
    const out: Record<string, any> = {};
    for (const col of selectedColumns) {
      const val = row[col] ?? row[col.toLowerCase()] ?? row[col.replace(/([A-Z])/g, "_$1").toLowerCase()];
      out[col] = val instanceof Date ? val.toISOString() : val;
    }
    return out;
  });

  if (format === "json") {
    return { data: result, total: result.length };
  }

  const headers = selectedColumns;
  const csvLines = [headers.join(",")];
  for (const row of result) {
    csvLines.push(headers.map((h) => {
      const v = row[h];
      if (v == null) return "";
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","));
  }

  return { csv: csvLines.join("\n"), total: result.length };
}

export async function handleReportGenerate(job: { id: string; data: ReportGenerateData }): Promise<void> {
  const { companyId, dataset, format } = job.data;
  logger.info({ dataset, format, companyId }, "[ReportGenerate] Starting");
  await generateReport(job.data);
  logger.info({ dataset, format, companyId }, "[ReportGenerate] Complete");
}
