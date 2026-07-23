import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { MarketRiskDashboard } from "../../../../components/risk/market-risk-dashboard";

export default function MarketRiskPage() {
  const marketData = riskService.market.getAllMarketRiskData();
  const fxData = riskService.market.getAllFXRiskData();
  const interestData = riskService.market.getAllInterestRateData();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Market Risk" description="Market, FX, and interest rate risk metrics" />
      <div className="mt-6">
        <MarketRiskDashboard marketData={marketData} fxData={fxData} interestData={interestData} />
      </div>
    </PageContainer>
  );
}