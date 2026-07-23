import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { KRIDashboard } from "@/components/risk-v2/kri-dashboard";
import { RiskControlsDashboard } from "@/components/risk-v2/risk-controls-dashboard";

export default function RiskMonitoringPage() {
  const indicators = riskService.riskIndicator.getAll();
  const controls = riskService.riskControl.getAll();

  const effectiveControls = controls.filter(c => c.effectiveness === "strong" || c.effectiveness === "satisfactory").length;
  const ineffectiveControls = controls.filter(c => c.effectiveness === "weak" || c.effectiveness === "ineffective" || c.effectiveness === "not-tested").length;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Monitoring" description="Key risk indicators, controls, and ongoing surveillance" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Total KRIs</p>
            <p className="text-2xl font-bold text-white">{indicators.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">KRI Breaches</p>
            <p className="text-2xl font-bold text-red-400">{riskService.riskIndicator.getBreaches().length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Total Controls</p>
            <p className="text-2xl font-bold text-white">{controls.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Effective / Ineffective</p>
            <p className="text-2xl font-bold text-white">{effectiveControls} / {ineffectiveControls}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Key Risk Indicators</h3>
            <KRIDashboard indicators={indicators} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Controls Overview</h3>
            <RiskControlsDashboard controls={controls} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
