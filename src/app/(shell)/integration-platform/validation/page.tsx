import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ValidationCenter } from "@/components/integration-platform/validation-center";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function ValidationPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const issues = await prisma.validationIssue.findMany({
      where: { companyId: ctx.tenant.companyId },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
      take: 200,
    });
  
    const serialized = issues.map((i) => ({
      id: i.id,
      companyId: i.companyId,
      instanceId: i.instanceId ?? "",
      syncHistoryId: i.syncHistoryId,
      severity: i.severity,
      category: i.category,
      code: i.code,
      message: i.message,
      affectedRecords: i.affectedRecords as string[] | undefined,
      resolution: i.resolution,
      isResolved: i.isResolved,
      resolvedBy: i.resolvedBy,
      resolvedAt: i.resolvedAt?.toISOString() ?? null,
    }));
  
    const summary = {
      total: issues.length,
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      info: issues.filter((i) => i.severity === "info").length,
    };
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Validation Center"
          description={`${summary.errors} errors, ${summary.warnings} warnings`}
        />
        <ValidationCenter issues={serialized} onResolve={() => {}} summary={summary} />
      </PageContainer>
    );
  });
}
