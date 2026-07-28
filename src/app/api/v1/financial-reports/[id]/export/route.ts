import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const CONTENT_TYPES: Record<string, string> = {
  csv: "text/csv",
  excel: "application/vnd.ms-excel",
  pdf: "application/pdf",
};

const FILE_EXTENSIONS: Record<string, string> = {
  csv: ".csv",
  excel: ".xls",
  pdf: ".pdf",
};

function csvSerialize(sections: unknown[]): string {
  const rows: string[][] = [];
  for (const section of sections as Array<{ title?: string; rows?: Array<{ label?: string; values?: Record<string, unknown> }> }>) {
    if (section.title) {
      rows.push([section.title]);
    }
    if (section.rows) {
      for (const row of section.rows) {
        const values = row.values ?? {};
        const valueStr = Object.values(values).map((v) => String(v ?? "")).join(",");
        rows.push([row.label ?? "", valueStr]);
      }
    }
  }
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.export");
  
      const { id } = await params;
      const { searchParams } = new URL(request.url);
      const executionId = searchParams.get("executionId");
      const format = (searchParams.get("format") ?? "csv") as string;
  
      if (!executionId) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "executionId query parameter is required" } },
          { status: 400 },
        );
      }
  
      if (!["csv", "excel", "pdf"].includes(format)) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "format must be csv, excel, or pdf" } },
          { status: 400 },
        );
      }
  
      const execution = await prisma.financialReportExecution.findFirst({
        where: { id: executionId, companyId: ctx.tenant.companyId, definitionId: id },
      });
  
      if (!execution) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Execution not found" } },
          { status: 404 },
        );
      }
  
      if (execution.status !== "completed") {
        return NextResponse.json(
          { error: { code: "INVALID_STATE", message: "Execution has not completed" } },
          { status: 400 },
        );
      }
  
      const definition = await prisma.financialReportDefinition.findFirst({
        where: { id, companyId: ctx.tenant.companyId },
      });
  
      const definitionName = definition?.name ?? "report";
      const filename = `${definitionName.replace(/[^a-zA-Z0-9_-]/g, "_")}${FILE_EXTENSIONS[format] ?? ""}`;
  
      if (format === "csv") {
        const sections = execution.sections as unknown as unknown[];
        const data = csvSerialize(sections);
        const encoded = new TextEncoder().encode("\uFEFF" + data);
  
        return new NextResponse(encoded, {
          status: 200,
          headers: {
            "Content-Type": CONTENT_TYPES.csv,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": String(encoded.length),
          },
        });
      }
  
      const jsonData = JSON.stringify(execution.sections, null, 2);
      const encoded = new TextEncoder().encode(jsonData);
  
      return new NextResponse(encoded, {
        status: 200,
        headers: {
          "Content-Type": CONTENT_TYPES[format] ?? "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(encoded.length),
        },
      });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
