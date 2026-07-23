import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { RiskResponsePanel } from "@/components/risk-v2/risk-response-panel";
import type { RiskResponseStrategy } from "@/server/risk/types";

export default function RiskResponsePage() {
  const responses = riskService.riskResponse.getAll();
  const overdue = riskService.riskResponse.getOverdue();

  const byStrategy = {} as Record<RiskResponseStrategy, number>;
  for (const r of responses) {
    byStrategy[r.strategy] = (byStrategy[r.strategy] ?? 0) + 1;
  }

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Response Strategies" description="Mitigation, transfer, acceptance, and escalation plans" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-5 gap-3">
          {(["avoid", "reduce", "transfer", "accept", "escalate"] as const).map((s) => (
            <div key={s} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 text-center">
              <p className="text-lg font-bold text-white">{byStrategy[s] ?? 0}</p>
              <p className="text-xs capitalize text-zinc-500">{s}</p>
            </div>
          ))}
        </div>
        {overdue.length > 0 && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm font-medium text-red-400">{overdue.length} overdue response{overdue.length > 1 ? "s" : ""}</p>
          </div>
        )}
        <RiskResponsePanel responses={responses} max={50} />
      </div>
    </PageContainer>
  );
}
