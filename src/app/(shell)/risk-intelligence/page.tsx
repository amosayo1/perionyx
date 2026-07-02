import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { fetchRiskRecommendations } from "@/modules/risk-intelligence";
import { RiskLayout } from "@/components/risk-intelligence/risk-layout";
import { RiskHeader } from "@/components/risk-intelligence/risk-header";
import { RiskOverview } from "@/components/risk-intelligence/risk-overview";
import { RiskHeatmap } from "@/components/risk-intelligence/risk-heatmap";
import { PolicyAnalytics } from "@/components/risk-intelligence/policy-analytics";
import { VendorRisk } from "@/components/risk-intelligence/vendor-risk";
import { GeographicExposure } from "@/components/risk-intelligence/geographic-exposure";
import { RiskTrends } from "@/components/risk-intelligence/risk-trends";
import { ExceptionAnalysis } from "@/components/risk-intelligence/exception-analysis";
import { StrategicRecommendations } from "@/components/risk-intelligence/strategic-recommendations";
import { QuickNavigation } from "@/components/risk-intelligence/quick-navigation";

export default async function RiskIntelligencePage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) {
    redirect("/onboarding");
  }

  const recommendations = await fetchRiskRecommendations(session.user.activeCompanyId);

  return (
    <RiskLayout>
      <RiskHeader />
      <RiskOverview />
      <RiskHeatmap />
      <PolicyAnalytics />
      <VendorRisk />
      <GeographicExposure />
      <RiskTrends />
      <ExceptionAnalysis />
      <StrategicRecommendations recommendations={recommendations} />
      <QuickNavigation />
    </RiskLayout>
  );
}
