import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { InvestmentFilters } from "../../../../components/investments/investment-filters";
import { SecurityDetail } from "../../../../components/investments/security-detail";

export default async function SecuritiesPage() {
  const svc = new InvestmentService();
  const securities = svc.securities.getAllSecurities();
  const portfolios = svc.portfolios.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Securities" description="Security master and detail view" />
      <InvestmentFilters portfolios={portfolios} />
      <div className="grid grid-cols-2 gap-4">
        {securities.map((security) => (
          <SecurityDetail key={security.id} security={security} />
        ))}
      </div>
    </PageContainer>
  );
}
