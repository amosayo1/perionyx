import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { ExportService } from "@/modules/export";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const EXPORTERS: Record<string, (companyId: string) => Promise<string>> = {
  accounts: (cid) => ExportService.accountsCSV(cid),
  transactions: (cid) => ExportService.transactionsCSV(cid),
  reconciliation: (cid) => ExportService.reconciliationCSV(cid),
  "risk-alerts": (cid) => ExportService.riskAlertsCSV(cid),
  calendar: (cid) => ExportService.calendarCSV(cid),
};

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.export');
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type");
  
      if (!type || !EXPORTERS[type]) {
        return NextResponse.json({ error: `Invalid export type. Valid: ${Object.keys(EXPORTERS).join(", ")}` }, { status: 400 });
      }
  
      const csv = await EXPORTERS[type](ctx.tenant.companyId);
      const filename = `perionyx-${type}-${new Date().toISOString().split("T")[0]}.csv`;
  
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
