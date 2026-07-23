import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { IncomeDashboard } from "../../../../components/investments/income-dashboard";

export default async function IncomePage() {
  const svc = new InvestmentService();
  const holdings = svc.holdings.getAll();
  const holdingIds = holdings.map((h) => h.id);
  const income = svc.income.getByPortfolio(holdingIds);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Income" description="Investment income by type and status" />
      <IncomeDashboard income={income} />
    </PageContainer>
  );
}
