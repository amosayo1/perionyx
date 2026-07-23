import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { CreditManagementPanel } from "../../../../components/order-to-cash/credit-management-panel";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { Shield, ShieldCheck, AlertTriangle, DollarSign } from "lucide-react";

export default function CreditPage() {
  const profiles = orderToCashService.credit.getAllProfiles();
  const totalProfiles = orderToCashService.credit.count();
  const onHoldCount = profiles.filter(p => p.onHold).length;
  const highRiskCount = profiles.filter(p => p.riskRating === "high" || p.riskRating === "critical").length;
  const totalCreditLimit = profiles.reduce((s, p) => s + p.creditLimit, 0);
  const totalUtilization = profiles.reduce((s, p) => s + p.creditUtilization, 0);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Credit Management" description="Credit limits, risk scoring, and approval workflows" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Credit Profiles" value={totalProfiles} icon={<Shield className="h-4 w-4" />} />
        <FPAKPICard title="Total Limits" value={`$${(totalCreditLimit / 1e6).toFixed(1)}M`} icon={<DollarSign className="h-4 w-4" />} />
        <FPAKPICard title="On Hold" value={onHoldCount} icon={<AlertTriangle className="h-4 w-4" />} status={onHoldCount > 0 ? "critical" : "good"} />
        <FPAKPICard title="High Risk" value={highRiskCount} icon={<ShieldCheck className="h-4 w-4" />} status={highRiskCount > 0 ? "warning" : "good"} />
      </div>
      <div className="mt-6">
        <CreditManagementPanel profiles={profiles} />
      </div>
    </PageContainer>
  );
}
