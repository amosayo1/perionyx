import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { DeprecationBanner } from "../../../../components/enterprise/deprecation-banner";
import { AccountingKPICard } from "../../../../components/accounting/accounting-kpi-card";
import { ConsolidationCenter } from "../../../../components/accounting/consolidation-center";

export default function ConsolidationPage() {
  const consolidations = accountingService.consolidation.getAllConsolidations();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Consolidation" description="Multi-company and multi-entity consolidation" />
      <DeprecationBanner redirectTo="/general-ledger" redirectLabel="Use General Ledger instead" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <AccountingKPICard title="Total Consolidations" value={consolidations.length} />
          <AccountingKPICard title="Posted" value={consolidations.filter((c) => c.status === "posted").length} />
          <AccountingKPICard title="Calculated" value={consolidations.filter((c) => c.status === "calculated" || c.status === "reviewed").length} />
          <AccountingKPICard title="Draft" value={consolidations.filter((c) => c.status === "draft").length} />
        </div>
        <ConsolidationCenter consolidations={consolidations} />
      </div>
    </PageContainer>
  );
}
