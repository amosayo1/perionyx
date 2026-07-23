import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { CreditRiskDashboard } from "../../../../components/risk/credit-risk-dashboard";

export default function CreditRiskPage() {
  const creditData = riskService.credit.getAllCreditData();
  const counterpartyData = riskService.credit.getAllCounterpartyRiskData();
  const countryData = riskService.credit.getAllCountryRiskData();
  const concentrationData = riskService.credit.getAllConcentrationRiskData();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Credit Risk" description="Credit, counterparty, country, and concentration risk" />
      <div className="mt-6">
        <CreditRiskDashboard
          creditData={creditData}
          counterpartyData={counterpartyData}
          countryData={countryData}
          concentrationData={concentrationData}
        />
      </div>
    </PageContainer>
  );
}