/**
 * Export service — generates CSV from query results.
 */

function escapeCSV(val: any): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: Record<string, any>[]): string {
  const lines: string[] = [];
  lines.push(headers.map((h) => escapeCSV(h)).join(","));
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCSV(row[h])).join(","));
  }
  return lines.join("\n");
}

export class ExportService {
  /**
   * Export accounts to CSV.
   */
  static async accountsCSV(companyId: string) {
    const { prisma } = await import("@/server/db/prisma");
    const accounts = await prisma.treasuryAccount.findMany({
      where: { companyId },
      include: { controls: { where: { enabled: true } } },
      orderBy: { name: "asc" },
    });
    return toCSV(
      ["Name", "Currency", "Balance", "Account Number", "Active", "Controls", "Linked Bank"],
      accounts.map((a) => ({
        Name: a.name,
        Currency: a.currency,
        Balance: a.balance.toString(),
        "Account Number": a.accountNumber ?? "",
        Active: a.isActive ? "Yes" : "No",
        Controls: a.controls.map((c) => c.type).join("; "),
        "Linked Bank": a.plaidAccountId ? "Yes" : "No",
      })),
    );
  }

  /**
   * Export transactions to CSV.
   */
  static async transactionsCSV(companyId: string) {
    const { prisma } = await import("@/server/db/prisma");
    const txs = await prisma.transaction.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    return toCSV(
      ["ID", "Type", "Status", "Amount", "Currency", "Reference", "Created"],
      txs.map((tx) => ({
        ID: tx.id,
        Type: tx.type,
        Status: tx.status,
        Amount: tx.primaryAmount.toString(),
        Currency: tx.currency,
        Reference: tx.reference ?? "",
        Created: tx.createdAt.toISOString(),
      })),
    );
  }

  /**
   * Export reconciliation runs to CSV.
   */
  static async reconciliationCSV(companyId: string) {
    const { prisma } = await import("@/server/db/prisma");
    const runs = await prisma.reconciliationRun.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return toCSV(
      ["ID", "Type", "Status", "Wallets Checked", "Issues Found", "Healthy", "Started", "Completed"],
      runs.map((r) => ({
        ID: r.id,
        Type: r.type,
        Status: r.status,
        "Wallets Checked": (r.summary as any)?.walletsChecked ?? "",
        "Issues Found": (r.summary as any)?.issuesFound ?? "",
        Healthy: (r.summary as any)?.isHealthy ? "Yes" : "No",
        Started: r.startedAt?.toISOString() ?? "",
        Completed: r.completedAt?.toISOString() ?? "",
      })),
    );
  }

  /**
   * Export risk alerts to CSV.
   */
  static async riskAlertsCSV(companyId: string) {
    const { prisma } = await import("@/server/db/prisma");
    const alerts = await prisma.riskAlert.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return toCSV(
      ["ID", "Title", "Category", "Severity", "Status", "Source", "Created", "Resolved"],
      alerts.map((a) => ({
        ID: a.id,
        Title: a.title,
        Category: a.category,
        Severity: a.severity,
        Status: a.status,
        Source: a.source ?? "",
        Created: a.createdAt.toISOString(),
        Resolved: a.resolvedAt?.toISOString() ?? "",
      })),
    );
  }

  /**
   * Export calendar events to CSV.
   */
  static async calendarCSV(companyId: string) {
    const { prisma } = await import("@/server/db/prisma");
    const events = await prisma.calendarEvent.findMany({
      where: { companyId },
      orderBy: { startDate: "asc" },
      take: 500,
    });
    return toCSV(
      ["ID", "Title", "Type", "Start", "End", "All Day", "Reference"],
      events.map((e) => ({
        ID: e.id,
        Title: e.title,
        Type: e.type,
        Start: e.startDate.toISOString(),
        End: e.endDate?.toISOString() ?? "",
        "All Day": e.allDay ? "Yes" : "No",
        Reference: e.referenceId ?? "",
      })),
    );
  }
}
