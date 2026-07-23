import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { AccountingKPICard } from "../../../../components/accounting/accounting-kpi-card";
import { AllocationManager } from "../../../../components/accounting/allocation-manager";

export default function AllocationsPage() {
  const rules = accountingService.allocations.getAllRules();
  const runs = accountingService.allocations.getAllRuns();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Allocations" description="Cost and revenue allocation rules" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <AccountingKPICard title="Allocation Rules" value={rules.length} />
          <AccountingKPICard title="Active Rules" value={rules.filter((r) => r.isActive).length} />
          <AccountingKPICard title="Executed Runs" value={runs.length} />
        </div>
        <AllocationManager rules={rules} runs={runs} />
      </div>
    </PageContainer>
  );
}
