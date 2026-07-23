import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { RiskAssessmentCard } from "@/components/risk-v2/risk-assessment-card";

export default function RiskAssessmentPage() {
  const assessments = riskService.riskAssessment.getAll();
  const registers = riskService.riskRegister.getAll();

  const openForAssessment = registers.filter(r => r.status === "identified" || r.status === "assessed").length;
  const avgInherentScore = assessments.length > 0 ? assessments.reduce((s, a) => s + a.inherentScore, 0) / assessments.length : 0;
  const avgResidualScore = assessments.length > 0 ? assessments.reduce((s, a) => s + a.residualScore, 0) / assessments.length : 0;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Assessments" description="Detailed risk assessment analysis and scoring" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Total Assessments</p>
            <p className="text-2xl font-bold text-white">{assessments.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Pending Assessment</p>
            <p className="text-2xl font-bold text-amber-400">{openForAssessment}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Avg Inherent Score</p>
            <p className="text-2xl font-bold text-red-400">{avgInherentScore.toFixed(1)}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Avg Residual Score</p>
            <p className="text-2xl font-bold text-emerald-400">{avgResidualScore.toFixed(1)}</p>
          </div>
        </div>
        <RiskAssessmentCard assessments={assessments} max={20} />
      </div>
    </PageContainer>
  );
}
