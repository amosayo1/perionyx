import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { AccountingKPICard } from "../../../../components/accounting/accounting-kpi-card";
import { BankReconciliationPanel } from "../../../../components/accounting/bank-reconciliation-panel";

export default function ReconciliationPage() {
  const reconciliations = accountingService.reconciliation.getAllReconciliations();
  const exceptions = accountingService.reconciliation.getExceptions();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Reconciliation" description="Account reconciliation and exception management" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <AccountingKPICard title="Total Reconciliations" value={reconciliations.length} />
          <AccountingKPICard title="Completed" value={reconciliations.filter((r) => r.status === "completed" || r.status === "approved").length} />
          <AccountingKPICard title="Exceptions" value={exceptions.length} status={exceptions.length > 0 ? "critical" : "good"} />
          <AccountingKPICard title="In Progress" value={reconciliations.filter((r) => r.status === "in-progress").length} />
        </div>
        <BankReconciliationPanel reconciliations={reconciliations} />
      </div>
    </PageContainer>
  );
}
