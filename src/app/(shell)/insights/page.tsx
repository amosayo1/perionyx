import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { fetchInsightsData } from "@/modules/insights";
import { InsightsLayout } from "@/components/insights/insights-layout";
import { ExecutiveHeader } from "@/components/insights/executive-header";
import { ExecutiveSummary } from "@/components/insights/executive-summary";
import { FinancialHealth } from "@/components/insights/financial-health";
import { TreasuryPerformance } from "@/components/insights/treasury-performance";
import { OperationalPerformance } from "@/components/insights/operational-performance";
import { ComplianceOverview } from "@/components/insights/compliance-overview";
import { StrategicHighlights } from "@/components/insights/strategic-highlights";
import { QuickNavigation } from "@/components/insights/quick-navigation";

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) {
    redirect("/onboarding");
  }

  const data = await fetchInsightsData(session.user.activeCompanyId);

  return (
    <InsightsLayout>
      <ExecutiveHeader />
      <ExecutiveSummary metrics={data.kpiMetrics} />
      <FinancialHealth data={data.financialHealth} />
      <TreasuryPerformance data={data.treasuryPerformance} />
      <OperationalPerformance data={data.operationalPerformance} />
      <ComplianceOverview data={data.complianceOverview} />
      <StrategicHighlights highlights={data.strategicHighlights} />
      <QuickNavigation />
    </InsightsLayout>
  );
}
