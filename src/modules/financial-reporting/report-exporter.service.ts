import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportExecution, ReportSection, ReportRow, ExportFormat } from "./types";

export class ReportExporterService {
  static async export(
    ctx: TenantContext,
    executionId: string,
    format: ExportFormat,
  ): Promise<{ data: string; mimeType: string; filename: string }> {
    const record = await prisma.financialReportExecution.findUnique({
      where: { id: executionId },
    });

    if (!record || record.companyId !== ctx.companyId) {
      throw new Error(`Report execution "${executionId}" not found`);
    }

    const execution: ReportExecution = {
      id: record.id,
      definitionId: record.definitionId,
      companyId: record.companyId,
      status: record.status as ReportExecution["status"],
      reportType: record.reportType as ReportExecution["reportType"],
      config: record.config as unknown as ReportExecution["config"],
      sections: record.sections as unknown as ReportSection[],
      totalRows: record.totalRows,
      executionTimeMs: record.executionTimeMs,
      error: record.error ?? undefined,
      requestedBy: record.requestedBy,
      completedAt: record.completedAt?.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };

    const reportDate = execution.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

    switch (format) {
      case "csv":
        return this.toCsv(execution, reportDate);
      case "excel":
        return this.toExcel(execution, reportDate);
      case "pdf":
        return this.toPdf(execution, reportDate);
      default:
        throw new Error(`Unsupported export format: "${format}"`);
    }
  }

  private static toCsv(
    execution: ReportExecution,
    reportDate: string,
  ): { data: string; mimeType: string; filename: string } {
    const rows: string[] = [];
    const config = execution.config;
    const rounding = config.rounding ?? 2;

    rows.push(`\ufeff${execution.reportType.replace(/-/g, " ").toUpperCase()} - ${reportDate}`);
    rows.push(`Currency: ${config.currency}, Comparison: ${config.comparison}`);
    rows.push("");

    for (const section of execution.sections) {
      rows.push(`"${section.title}"`);
      if (section.subtitle) rows.push(`"${section.subtitle}"`);

      const headers = section.columns ?? ["Account", "Value"];
      rows.push(headers.map((h) => `"${h}"`).join(","));

      for (const row of this.flattenRows(section.rows)) {
        const label = `"${row.label}"`;
        const values = headers.slice(1).map((col) => {
          const val = row.values[col];
          if (typeof val === "number") {
            return this.formatNumber(val, rounding);
          }
          return val !== undefined ? `"${String(val).replace(/"/g, '""')}"` : "";
        });
        rows.push([label, ...values].join(","));
      }

      if (section.totals) {
        const totalLabel = `"Total"`;
        const totalValues = headers.slice(1).map((col) => {
          const val = section.totals![col];
          return val !== undefined ? this.formatNumber(val, rounding) : "";
        });
        rows.push([totalLabel, ...totalValues].join(","));
      }

      rows.push("");
    }

    return {
      data: rows.join("\n"),
      mimeType: "text/csv; charset=utf-8",
      filename: `report-${execution.reportType}-${reportDate}.csv`,
    };
  }

  private static toExcel(
    execution: ReportExecution,
    reportDate: string,
  ): { data: string; mimeType: string; filename: string } {
    const config = execution.config;
    const rounding = config.rounding ?? 2;
    const sheets: string[] = [];

    for (const section of execution.sections) {
      const safeTitle = section.title.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 31);
      const headers = section.columns ?? ["Account", "Value"];
      const colLetters = headers.map((_, i) => String.fromCharCode(65 + i));

      let xml = `<Worksheet ss:Name="${safeTitle}">
        <Table>`;

      xml += `<Row>`;
      for (const header of headers) {
        xml += `<Cell><Data ss:Type="String">${this.escapeXml(header)}</Data></Cell>`;
      }
      xml += `</Row>`;

      for (const row of this.flattenRows(section.rows)) {
        xml += `<Row>`;
        xml += `<Cell><Data ss:Type="String">${this.escapeXml(row.label)}</Data></Cell>`;
        for (let i = 1; i < headers.length; i++) {
          const val = row.values[headers[i]];
          if (typeof val === "number") {
            xml += `<Cell><Data ss:Type="Number">${val.toFixed(rounding)}</Data></Cell>`;
          } else if (val !== undefined) {
            xml += `<Cell><Data ss:Type="String">${this.escapeXml(String(val))}</Data></Cell>`;
          } else {
            xml += `<Cell/>`;
          }
        }
        xml += `</Row>`;
      }

      if (section.totals) {
        xml += `<Row>`;
        xml += `<Cell><Data ss:Type="String">Total</Data></Cell>`;
        for (let i = 1; i < headers.length; i++) {
          const val = section.totals[headers[i]];
          if (val !== undefined) {
            xml += `<Cell><Data ss:Type="Number">${val.toFixed(rounding)}</Data></Cell>`;
          } else {
            xml += `<Cell/>`;
          }
        }
        xml += `</Row>`;
      }

      xml += `</Table></Worksheet>`;
      sheets.push(xml);
    }

    const data = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <DocumentProperties>
    <Title>${this.escapeXml(execution.reportType.replace(/-/g, " ").toUpperCase())}</Title>
    <Created>${reportDate}</Created>
  </DocumentProperties>
  ${sheets.join("\n")}
</Workbook>`;

    return {
      data,
      mimeType: "application/vnd.ms-excel",
      filename: `report-${execution.reportType}-${reportDate}.xls`,
    };
  }

  private static toPdf(
    execution: ReportExecution,
    reportDate: string,
  ): { data: string; mimeType: string; filename: string } {
    const config = execution.config;
    const rounding = config.rounding ?? 2;
    const sectionsHtml = execution.sections.map((section) => {
      const headers = section.columns ?? ["Account", "Value"];
      const rows = this.flattenRows(section.rows);
      const rowHtml = rows.map((row) => {
        const depthPadding = row.depth * 16;
        const values = headers.slice(1).map((col) => {
          const val = row.values[col];
          if (typeof val === "number") {
            return this.formatAccounting(val, rounding);
          }
          return val !== undefined ? this.escapeHtml(String(val)) : "";
        });
        const isTotal = row.type === "total";
        const isSubtotal = row.type === "subtotal";
        const style = [
          `padding-left: ${20 + depthPadding}px`,
          isTotal ? "font-weight: bold; border-top: 1px solid #000;" : "",
          isSubtotal ? "font-weight: 600; border-top: 1px solid #ccc;" : "",
          row.type === "note" ? "font-style: italic; color: #666;" : "",
        ].filter(Boolean).join("; ");
        return `<tr><td style="${style}">${this.escapeHtml(row.label)}</td>${values.map((v) => `<td style="text-align: right; ${isTotal ? "font-weight: bold; border-top: 1px solid #000;" : isSubtotal ? "font-weight: 600;" : ""}">${v}</td>`).join("")}</tr>`;
      }).join("");

      const totalHtml = section.totals ? (() => {
        const tVals = headers.slice(1).map((col) => {
          const val = section.totals![col];
          return val !== undefined ? this.formatAccounting(val, rounding) : "";
        });
        return `<tr style="font-weight: bold; border-top: 2px double #000;"><td style="padding-left: 20px;">Total</td>${tVals.map((v) => `<td style="text-align: right;">${v}</td>`).join("")}</tr>`;
      })() : "";

      return `
        <div style="page-break-inside: avoid; margin-bottom: 24px;">
          <h2 style="font-size: 14pt; margin: 0 0 4px; color: #1a1a2e;">${this.escapeHtml(section.title)}</h2>
          ${section.subtitle ? `<p style="font-size: 10pt; color: #666; margin: 0 0 8px;">${this.escapeHtml(section.subtitle)}</p>` : ""}
          <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="text-align: left; padding: 6px 10px; border-bottom: 2px solid #000;">${this.escapeHtml(headers[0])}</th>
                ${headers.slice(1).map((h) => `<th style="text-align: right; padding: 6px 10px; border-bottom: 2px solid #000;">${this.escapeHtml(h)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rowHtml}
              ${totalHtml}
            </tbody>
          </table>
          ${section.notes ? `<div style="margin-top: 8px; font-size: 9pt; color: #888;"><ul>${section.notes.map((n) => `<li>${this.escapeHtml(n)}</li>`).join("")}</ul></div>` : ""}
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${this.escapeHtml(execution.reportType.replace(/-/g, " ").toUpperCase())}</title>
  <style>
    @page { margin: 20mm 15mm; size: A4 portrait; }
    body { font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10pt; color: #222; line-height: 1.5; }
    .report-header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1a1a2e; padding-bottom: 12px; }
    .report-header h1 { font-size: 18pt; margin: 0; color: #1a1a2e; }
    .report-header .meta { font-size: 9pt; color: #666; margin-top: 4px; }
    .report-footer { text-align: center; font-size: 8pt; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 4px 10px; vertical-align: top; }
    td:first-child { white-space: nowrap; }
    .neg { color: #c0392b; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>${this.escapeHtml(execution.reportType.replace(/-/g, " ").toUpperCase())}</h1>
    <div class="meta">
      Currency: ${this.escapeHtml(config.currency)} | Comparison: ${config.comparison} |
      Period: ${this.escapeHtml(String(config.dateRange.start))} — ${this.escapeHtml(String(config.dateRange.end))} |
      Generated: ${reportDate}
    </div>
  </div>
  ${sectionsHtml}
  <div class="report-footer">
    Generated by Perionyx Financial Reporting Engine v1.0 | Execution: ${(execution.executionTimeMs / 1000).toFixed(1)}s | Rows: ${execution.totalRows}
  </div>
</body>
</html>`;

    return {
      data: html,
      mimeType: "text/html",
      filename: `report-${execution.reportType}-${reportDate}.html`,
    };
  }

  private static flattenRows(rows: ReportRow[]): ReportRow[] {
    const result: ReportRow[] = [];
    for (const row of rows) {
      result.push(row);
      if (row.children) {
        result.push(...this.flattenRows(row.children));
      }
    }
    return result;
  }

  private static formatNumber(val: number, decimals: number): string {
    return val.toFixed(decimals);
  }

  private static formatAccounting(val: number, decimals: number): string {
    const formatted = Math.abs(val).toFixed(decimals);
    return val < 0 ? `<span class="neg">(${formatted})</span>` : formatted;
  }

  private static escapeXml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }

  private static escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}
