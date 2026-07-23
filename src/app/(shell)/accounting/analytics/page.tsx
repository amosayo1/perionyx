import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { AccountingAnalytics } from "../../../../components/accounting/accounting-analytics";

export default function AccountingAnalyticsPage() {
  const kpis = accountingService.analytics.getAllKPIs();
  const forecasts = accountingService.analytics.getAllForecasts();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Accounting Analytics" description="KPIs, trends, and financial intelligence" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6">
        <AccountingAnalytics kpis={kpis} forecasts={forecasts} />
      </div>
    </PageContainer>
  );
}
