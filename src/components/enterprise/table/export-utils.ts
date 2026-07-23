import type { Column } from "./types";

function sanitizeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportToCsv<T>(
  data: T[],
  columns: Column<T>[],
  hiddenColumns: Set<string>,
  filename: string,
) {
  const visible = columns.filter((c) => !hiddenColumns.has(c.id));
  const headers = visible.map((c) => sanitizeCsvValue(c.header)).join(",");
  const rows = data.map((row) =>
    visible
      .map((col) => {
        const val = col.accessor(row);
        return sanitizeCsvValue(val);
      })
      .join(","),
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToXls<T>(
  data: T[],
  columns: Column<T>[],
  hiddenColumns: Set<string>,
  filename: string,
) {
  const visible = columns.filter((c) => !hiddenColumns.has(c.id));
  const headers = visible.map((c) => c.header);
  const rows = data.map((row) =>
    visible.map((col) => {
      const val = col.accessor(row);
      if (val === null || val === undefined) return "";
      const s = String(val);
      return s.replace(/<[^>]*>/g, "").trim();
    }),
  );

  const xlsContent = buildXlsXml(headers, rows);
  const blob = new Blob([xlsContent], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildXlsXml(headers: string[], rows: string[][]): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const headerRow = headers.map((h) => `<th>${esc(h)}</th>`).join("");
  const dataRows = rows
    .map(
      (row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:x="urn:schemas-microsoft-com:office:excel">
<Worksheet ss:Name="Sheet1">
<Table>
<Row>${headerRow}</Row>
${dataRows}
</Table>
</Worksheet>
</Workbook>`;
}

export function exportTable<T>(
  data: T[],
  columns: Column<T>[],
  hiddenColumns: Set<string>,
  format: "csv" | "xls",
  filename: string,
) {
  if (format === "csv") {
    exportToCsv(data, columns, hiddenColumns, filename);
  } else {
    exportToXls(data, columns, hiddenColumns, filename);
  }
}
