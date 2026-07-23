import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { CollectionsDashboard } from "../../../../components/order-to-cash/collections-dashboard";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { Phone, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

export default function CollectionsPage() {
  const cases = orderToCashService.collections.getAllCases();
  const totalCases = orderToCashService.collections.count();
  const activeCases = cases.filter(c => c.status === "active").length;
  const resolvedCases = cases.filter(c => c.status === "resolved").length;
  const escalatedCases = cases.filter(c => c.status === "escalated").length;
  const totalAmount = cases.reduce((s, c) => s + c.amount, 0);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Collections" description="Collection case management and escalation tracking" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Total Cases" value={totalCases} icon={<Phone className="h-4 w-4" />} />
        <FPAKPICard title="Active" value={activeCases} icon={<AlertTriangle className="h-4 w-4" />} status={activeCases > 0 ? "warning" : "good"} />
        <FPAKPICard title="Resolved" value={resolvedCases} icon={<CheckCircle className="h-4 w-4" />} status="good" />
        <FPAKPICard title="Escalated" value={escalatedCases} icon={<TrendingUp className="h-4 w-4" />} status={escalatedCases > 0 ? "critical" : "good"} />
      </div>
      <div className="mt-6">
        <CollectionsDashboard cases={cases} />
      </div>
    </PageContainer>
  );
}
