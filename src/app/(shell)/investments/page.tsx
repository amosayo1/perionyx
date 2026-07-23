import { InvestmentService } from "../../../server/investments";
import { PageContainer } from "../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../components/enterprise/enterprise-page-header";
import { InvestmentHeader } from "../../../components/investments/investment-header";
import { PortfolioOverview } from "../../../components/investments/portfolio-overview";
import { AlertsPanel } from "../../../components/investments/alerts-panel";
import type { InvestmentOverviewMetrics } from "../../../components/investments/investment-types";

export default async function InvestmentsPage() {
  const svc = new InvestmentService();
  const portfolios = svc.portfolios.getAll();
  const holdings = svc.holdings.getAll();
  const securities = svc.securities.getAllSecurities();
  const performance = svc.performance.getByPeriod("port_002", "yearly");
  const yieldData = svc.yield_.getByPortfolio("port_002");

  const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalBookValue = holdings.reduce((s, h) => s + h.bookValue, 0);
  const totalUnrealizedGain = holdings.reduce((s, h) => s + h.unrealizedGain, 0);
  const portfolioReturn = performance?.returnValue ?? 0;
  const portfolioYield = yieldData.length > 0 ? yieldData.reduce((s, y) => s + (y.portfolioYield ?? 0), 0) / yieldData.length : 0;
  const totalSecurities = securities.length;

  const alerts = [
    {
      id: "alert_001",
      severity: "warning" as const,
      title: "Concentration Limit Approaching",
      message: "US Treasury exposure is at 38%, approaching the 40% sector limit.",
      type: "concentration-limit",
      createdAt: new Date(),
    },
    {
      id: "alert_002",
      severity: "info" as const,
      title: "Upcoming Maturity",
      message: "US Treasury 3-Month Bill matures in 15 days.",
      type: "maturity",
      createdAt: new Date(),
    },
    {
      id: "alert_003",
      severity: "critical" as const,
      title: "EUR Deposit Rate Drop",
      message: "EUR 6-Month Fixed Deposit rate dropped to 2.5% at renewal.",
      type: "rate-change",
      actionRequired: true,
      createdAt: new Date(),
    },
  ];

  return (
    <PageContainer>
      <EnterprisePageHeader title="Investments" description="Enterprise portfolio management and investment intelligence" />
      <InvestmentHeader
        marketValue={totalMarketValue}
        portfolioReturn={portfolioReturn}
        portfolioYield={portfolioYield}
        diversificationScore={72}
      />
      <PortfolioOverview portfolios={portfolios} holdings={holdings} securities={securities} />
      <AlertsPanel alerts={alerts} />
    </PageContainer>
  );
}
