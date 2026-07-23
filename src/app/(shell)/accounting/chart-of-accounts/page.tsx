import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { ChartOfAccountsTree } from "../../../../components/accounting/chart-of-accounts-tree";
import { AccountingKPICard } from "../../../../components/accounting/accounting-kpi-card";

export default function ChartOfAccountsPage() {
  const accounts = accountingService.coa.getAllAccounts();
  const tree = accountingService.coa.getTree();
  const types = [...new Set(accounts.map((a) => a.type))];
  return (
    <PageContainer>
      <EnterprisePageHeader title="Chart of Accounts" description={`${accounts.length} accounts across ${types.length} types`} />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-2">
            {types.slice(0, 6).map((type) => {
              const accts = accounts.filter((a) => a.type === type);
              return (
                <AccountingKPICard key={type} title={type.replace(/-/g, " ")} value={accts.length} subtitle={`${accts.filter((a) => a.status === "active").length} active`} />
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-3">
          <ChartOfAccountsTree tree={tree} />
        </div>
      </div>
    </PageContainer>
  );
}
