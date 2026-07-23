import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { AccountingKPICard } from "../../../../components/accounting/accounting-kpi-card";
import { IntercompanyDashboard } from "../../../../components/accounting/intercompany-dashboard";

export default function IntercompanyPage() {
  const journals = accountingService.intercompany.getAllJournals();
  const unsettled = accountingService.intercompany.getUnsettled();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Intercompany Accounting" description="Due to/due from and intercompany settlements" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <AccountingKPICard title="IC Journals" value={journals.length} />
          <AccountingKPICard title="Unsettled" value={unsettled.length} status={unsettled.length > 0 ? "warning" : "good"} />
          <AccountingKPICard title="Posted" value={journals.filter((j) => j.status === "posted").length} />
        </div>
        <IntercompanyDashboard journals={journals} />
      </div>
    </PageContainer>
  );
}
