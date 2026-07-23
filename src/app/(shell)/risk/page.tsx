import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { RiskDashboard } from "@/components/risk-v2/risk-dashboard";
import { RiskRegisterTable } from "@/components/risk-v2/risk-register-table";
import { AlertsPanel } from "@/components/risk-v2/alerts-panel";
import { KRIDashboard } from "@/components/risk-v2/kri-dashboard";
import type { RiskOverviewMetrics } from "@/components/risk-v2/risk-types";

export default function RiskManagementPage() {
  const registers = riskService.riskRegister.getAll();
  const assessments = riskService.riskAssessment.getAll();
  const controls = riskService.riskControl.getAll();
  const incidents = riskService.riskIncident.getAll();
  const indicators = riskService.riskIndicator.getAll();
  const alerts = riskService.riskAnalytics.getAllAlerts();

  const metrics: RiskOverviewMetrics = {
    totalRisks: registers.length,
    openRisks: riskService.riskRegister.getOpenRisks().length,
    criticalRisks: riskService.riskRegister.getCriticalRisks().length,
    highRisks: riskService.riskRegister.getByLevel("high").length,
    totalControls: controls.length,
    ineffectiveControls: riskService.riskControl.getIneffective().length,
    totalIncidents: incidents.length,
    openIncidents: riskService.riskIncident.getOpen().length,
    totalAssessments: assessments.length,
    totalScenarios: riskService.riskScenario.count(),
    kriBreaches: riskService.riskIndicator.getBreaches().length,
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="Enterprise Risk Management" description="Comprehensive risk register, assessments, controls, and intelligence" />
      <div className="mt-6 space-y-6">
        <RiskDashboard metrics={metrics} registers={registers} assessments={assessments} indicators={indicators} alerts={alerts} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Risk Register</h3>
            <RiskRegisterTable registers={registers} max={10} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Active Alerts</h3>
            <AlertsPanel alerts={alerts} max={5} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Key Risk Indicators</h3>
            <KRIDashboard indicators={indicators} max={8} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Summary</h3>
            <p className="text-sm text-zinc-500">Total risks: {registers.length} | Open: {metrics.openRisks} | Critical: {metrics.criticalRisks} | KRI Breaches: {metrics.kriBreaches}</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
