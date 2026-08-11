import { notFound } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { decisionWorkspaceService } from "@/modules/decision-workspace";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { DecisionWorkspace } from "@/components/decision-workspace";

type PageProps = {
  params: Promise<{ invoiceId: string }>;
};

export default async function DecisionWorkspacePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) return notFound();

  const companyId = session.user.activeCompanyId ?? session.user.id;
  const { invoiceId } = await params;

  let data;
  try {
    data = await decisionWorkspaceService.getDecisionWorkspace(invoiceId, companyId);
  } catch (err) {
    if (err instanceof Error && (err as Error & { code?: string }).code === "NOT_FOUND") return notFound();
    throw err;
  }

  return (
    <PageContainer>
      <EnterprisePageHeader
        title={`Invoice ${data.invoiceNumber}`}
        description={`Decision workspace for ${data.invoiceNumber} · ${data.summary.businessImpact?.exposure ?? ""} ${data.currency} · ${data.status.label}`}
      />
      <DecisionWorkspace data={data} />
    </PageContainer>
  );
}
