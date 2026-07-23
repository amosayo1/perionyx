import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { GeneralLedgerGrid } from "../../../../components/accounting/general-ledger-grid";
import { AccountingFilters } from "../../../../components/accounting/accounting-filters";

export default function GeneralLedgerPage() {
  const balances = accountingService.ledger.getAllBalances();
  const periods = accountingService.periods.getAllPeriods();
  const periodOptions = periods.map((p) => p.name);
  return (
    <PageContainer>
      <EnterprisePageHeader title="General Ledger" description="Account balances by period" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-4">
        <AccountingFilters periodOptions={periodOptions} companyOptions={["co_001", "co_002", "co_003", "co_004", "co_005"]} statusOptions={["active", "inactive"]} />
      </div>
      <div className="mt-4">
        <GeneralLedgerGrid balances={balances} max={100} />
      </div>
    </PageContainer>
  );
}
