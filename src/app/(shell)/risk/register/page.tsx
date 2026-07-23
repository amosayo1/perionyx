import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { RiskRegisterTable } from "@/components/risk-v2/risk-register-table";
import { RiskResponsePanel } from "@/components/risk-v2/risk-response-panel";

export default function RiskRegisterPage() {
  const registers = riskService.riskRegister.getAll();
  const responses = riskService.riskResponse.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Register" description="Complete enterprise risk register with response strategies" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <RiskRegisterTable registers={registers} max={50} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Response Strategies</h3>
          <RiskResponsePanel responses={responses} max={10} />
        </div>
      </div>
    </PageContainer>
  );
}
