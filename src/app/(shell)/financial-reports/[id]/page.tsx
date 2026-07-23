import { notFound } from "next/navigation";
import { PageContainer } from "@/components/enterprise/page-container";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import { ReportViewer } from "@/components/financial-reports/report-viewer";

export const dynamic = "force-dynamic";

export default async function ReportViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const companyId = session?.user?.activeCompanyId;

  const definition = companyId ? await prisma.financialReportDefinition.findFirst({
    where: { id, companyId, isActive: true },
  }) : null;

  if (!definition) notFound();

  const latestExecution = companyId ? await prisma.financialReportExecution.findFirst({
    where: { definitionId: id, companyId },
    orderBy: { createdAt: "desc" },
  }) : null;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{definition.name}</h1>
          <p className="mt-1 text-sm text-zinc-400">{definition.description}</p>
        </div>
        <ReportViewer
          execution={JSON.parse(JSON.stringify(latestExecution))}
          loading={!latestExecution}
        />
      </div>
    </PageContainer>
  );
}
