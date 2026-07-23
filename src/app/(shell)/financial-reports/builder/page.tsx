import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { PageContainer } from "@/components/enterprise/page-container";
import { ReportBuilder } from "@/components/financial-reports/report-builder";

export default function ReportBuilderPage() {
  return (
    <PageContainer size="narrow">
      <EnterprisePageHeader
        title="Report Builder"
        description="Design custom financial reports with full control over filters, columns, and formatting"
      />
      <ReportBuilder />
    </PageContainer>
  );
}
