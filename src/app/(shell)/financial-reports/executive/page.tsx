import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ExecutiveReportBuilder } from "@/components/financial-reports/executive-report-builder";

export default function ExecutiveReportsPage() {
  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Executive Report Builder"
        description="Generate tailored financial reports for any stakeholder — CEO, CFO, Board, Auditors, and more"
      />
      <ExecutiveReportBuilder onGenerate={async (audience, types, config) => {
        "use server";
      }} />
    </PageContainer>
  );
}
