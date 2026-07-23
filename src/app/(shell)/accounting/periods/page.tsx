import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { AccountingKPICard } from "../../../../components/accounting/accounting-kpi-card";
import { PeriodManagement } from "../../../../components/accounting/period-management";

export default function PeriodsPage() {
  const periods = accountingService.periods.getAllPeriods();
  const fys = accountingService.periods.getAllFiscalYears();
  const open = accountingService.periods.getOpenPeriods();
  const closeProcesses = accountingService.periods.getAllCloseProcesses();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Accounting Periods" description="Fiscal calendar and period management" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <AccountingKPICard title="Fiscal Years" value={fys.length} />
          <AccountingKPICard title="Total Periods" value={periods.length} />
          <AccountingKPICard title="Open Periods" value={open.length} />
          <AccountingKPICard title="Locked Periods" value={periods.filter((p) => p.status === "locked").length} status="good" />
        </div>
        <PeriodManagement periods={periods} closeProcesses={closeProcesses} />
      </div>
    </PageContainer>
  );
}
