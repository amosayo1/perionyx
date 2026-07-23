import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { ContractCenter } from "../../../../components/procurement/contract-center";

export default function ContractsPage() {
  const allContracts = procurementService.contracts.getAllContracts();
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 86400000);
  const total = allContracts.length;
  const active = allContracts.filter((c) => c.status === "active").length;
  const expiring = allContracts.filter((c) => c.status === "active" && c.endDate <= thirtyDays && c.endDate >= now).length;
  const expired = allContracts.filter((c) => c.status === "expired").length;
  const totalValue = allContracts.reduce((s, c) => s + c.value, 0);
  const autoRenew = allContracts.filter((c) => c.autoRenew).length;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Contract Center" description="Manage vendor contracts and renewals" />
      <div className="mt-6 grid grid-cols-6 gap-4">
        <FPAKPICard title="Total Contracts" value={total} status="good" />
        <FPAKPICard title="Active" value={active} status="good" />
        <FPAKPICard title="Expiring (30d)" value={expiring} status={expiring > 0 ? "critical" : "good"} />
        <FPAKPICard title="Expired" value={expired} status={expired > 0 ? "warning" : "good"} />
        <FPAKPICard title="Auto-Renew" value={autoRenew} status="good" />
        <FPAKPICard title="Total Value" value={`$${(totalValue / 1000000).toFixed(1)}M`} status="good" />
      </div>
      <div className="mt-6">
        <ContractCenter contracts={allContracts} />
      </div>
    </PageContainer>
  );
}
