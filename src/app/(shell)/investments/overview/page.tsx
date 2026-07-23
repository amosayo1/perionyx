import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { InvestmentHeader } from "../../../../components/investments/investment-header";
import { PortfolioOverview } from "../../../../components/investments/portfolio-overview";
import { AllocationChart } from "../../../../components/investments/allocation-chart";
import { CreditQualityChart } from "../../../../components/investments/credit-quality-chart";
import { PerformanceCharts } from "../../../../components/investments/performance-charts";
import { RiskDashboard } from "../../../../components/investments/risk-dashboard";

export default async function InvestmentsOverviewPage() {
  const svc = new InvestmentService();
  const portfolios = svc.portfolios.getAll();
  const holdings = svc.holdings.getAll();
  const securities = svc.securities.getAllSecurities();
  const performance = svc.performance.getByPortfolio("port_002");
  const risks = ["port_002", "port_003", "port_004"].map((id) => svc.risk.getLatest(id)).filter((r): r is NonNullable<typeof r> => r != null);

  const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalBookValue = holdings.reduce((s, h) => s + h.bookValue, 0);
  const totalUnrealizedGain = holdings.reduce((s, h) => s + h.unrealizedGain, 0);
  const yearlyPerf = svc.performance.getByPeriod("port_002", "yearly");
  const yieldData = svc.yield_.getByPortfolio("port_002");
  const portfolioReturn = yearlyPerf?.returnValue ?? 0;
  const portfolioYield = yieldData.length > 0 ? yieldData.reduce((s, y) => s + (y.portfolioYield ?? 0), 0) / yieldData.length : 0;

  const sectorGroups: Record<string, number> = {};
  for (const h of holdings) {
    const sec = securities.find((s) => s.id === h.securityId);
    const sector = sec?.sector ?? "Other";
    sectorGroups[sector] = (sectorGroups[sector] ?? 0) + h.marketValue;
  }
  const totalMV = Object.values(sectorGroups).reduce((s, v) => s + v, 0);
  const sectorColors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#d4af37"];
  const allocationSegments = Object.entries(sectorGroups)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value], i) => ({
      label,
      value,
      percentage: totalMV > 0 ? (value / totalMV) * 100 : 0,
      color: sectorColors[i % sectorColors.length],
    }));

  const ratingGroups: Record<string, number> = {};
  for (const h of holdings) {
    const sec = securities.find((s) => s.id === h.securityId);
    const rating = sec?.creditRating ?? "NR";
    ratingGroups[rating] = (ratingGroups[rating] ?? 0) + h.marketValue;
  }
  const totalRV = Object.values(ratingGroups).reduce((s, v) => s + v, 0);
  const creditColors = ["#10b981", "#34d399", "#3b82f6", "#60a5fa", "#f59e0b", "#f97316", "#ef4444"];
  const creditSegments = Object.entries(ratingGroups)
    .sort(([, a], [, b]) => b - a)
    .map(([rating, value], i) => ({
      rating,
      value,
      percentage: totalRV > 0 ? (value / totalRV) * 100 : 0,
      color: creditColors[i % creditColors.length],
    }));

  return (
    <PageContainer>
      <EnterprisePageHeader title="Investment Overview" description="Full investment dashboard across all portfolios" />
      <InvestmentHeader
        marketValue={totalMarketValue}
        portfolioReturn={portfolioReturn}
        portfolioYield={portfolioYield}
        diversificationScore={72}
      />
      <div className="grid grid-cols-2 gap-4">
        <AllocationChart segments={allocationSegments} />
        <CreditQualityChart segments={creditSegments} />
      </div>
      <PortfolioOverview portfolios={portfolios} holdings={holdings} securities={securities} />
      <PerformanceCharts performances={performance} />
      <RiskDashboard risks={risks} />
    </PageContainer>
  );
}
