import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { LiquidityRiskDashboard } from "../../../../components/risk/liquidity-risk-dashboard";

export default function LiquidityRiskPage() {
  const liquidityData = riskService.liquidity.getAllLiquidityData();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Liquidity Risk" description="Liquidity coverage, funding gap, and buffer analysis" />
      <div className="mt-6">
        <LiquidityRiskDashboard liquidityData={liquidityData} />
      </div>
    </PageContainer>
  );
}