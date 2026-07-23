import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { InvestmentHeader } from "../../../../components/investments/investment-header";
import { AllocationChart } from "../../../../components/investments/allocation-chart";
import { CreditQualityChart } from "../../../../components/investments/credit-quality-chart";
import { ExecutiveInsights } from "../../../../components/investments/executive-insights";
import { PerformanceCharts } from "../../../../components/investments/performance-charts";

export default async function ExecutivePage() {
  const svc = new InvestmentService();
  const portfolios = svc.portfolios.getAll();
  const holdings = svc.holdings.getAll();
  const securities = svc.securities.getAllSecurities();
  const yearlyPerf = svc.performance.getByPeriod("port_002", "yearly");
  const yieldData = svc.yield_.getByPortfolio("port_002");
  const risk = svc.risk.getLatest("port_002");

  const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const portfolioReturn = yearlyPerf?.returnValue ?? 0;
  const portfolioYield = yieldData.length > 0 ? yieldData.reduce((s, y) => s + (y.portfolioYield ?? 0), 0) / yieldData.length : 0;
  const diversificationScore = risk?.diversificationScore ?? 0;

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

  const performances = svc.performance.getByPortfolio("port_002");

  const riskMetrics = [
    { label: "Market Risk", value: risk?.marketRisk ?? 0, variant: (risk?.marketRisk ?? 0) > 4 ? "high" as const : (risk?.marketRisk ?? 0) > 2 ? "medium" as const : "low" as const },
    { label: "Credit Risk", value: risk?.creditRisk ?? 0, variant: (risk?.creditRisk ?? 0) > 3 ? "high" as const : (risk?.creditRisk ?? 0) > 1.5 ? "medium" as const : "low" as const },
    { label: "Liquidity Risk", value: risk?.liquidityRisk ?? 0, variant: (risk?.liquidityRisk ?? 0) > 1 ? "high" as const : (risk?.liquidityRisk ?? 0) > 0.5 ? "medium" as const : "low" as const },
    { label: "Concentration", value: risk?.concentrationRisk ?? 0, variant: (risk?.concentrationRisk ?? 0) > 15 ? "high" as const : (risk?.concentrationRisk ?? 0) > 8 ? "medium" as const : "low" as const },
    { label: "Interest Rate Risk", value: risk?.interestRateRisk ?? 0, variant: (risk?.interestRateRisk ?? 0) > 5 ? "high" as const : (risk?.interestRateRisk ?? 0) > 3 ? "medium" as const : "low" as const },
  ];

  const recommendations = [
    { title: "Rebalance Sector Exposure", detail: "Government sector exposure at 42% exceeds recommended 40% limit.", impact: "high" as const },
    { title: "Increase Duration", detail: "Current duration of 4.2y is below target of 5.0y for income portfolio.", impact: "medium" as const },
    { title: "Diversify Issuer Risk", detail: "US Treasury represents 38% of total portfolio market value.", impact: "high" as const },
  ];

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive View" description="Executive summary of investment portfolio performance" />
      <InvestmentHeader
        marketValue={totalMarketValue}
        portfolioReturn={portfolioReturn}
        portfolioYield={portfolioYield}
        diversificationScore={diversificationScore}
      />
      <ExecutiveInsights
        totalMarketValue={totalMarketValue}
        portfolioReturn={portfolioReturn}
        portfolioYield={portfolioYield}
        diversificationScore={diversificationScore}
        riskMetrics={riskMetrics}
        recommendations={recommendations}
      />
      <div className="grid grid-cols-2 gap-4">
        <AllocationChart segments={allocationSegments} />
        <CreditQualityChart segments={creditSegments} />
      </div>
      <PerformanceCharts performances={performances} />
    </PageContainer>
  );
}
