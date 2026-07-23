import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { CashApplicationCenter } from "../../../../components/order-to-cash/cash-application-center";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function CashApplicationPage() {
  const receipts = orderToCashService.cashApplication.getAllReceipts();
  const totalReceipts = orderToCashService.cashApplication.count();
  const totalAmount = receipts.reduce((s, r) => s + r.amount, 0);
  const appliedAmount = receipts.filter(r => r.status === "applied").reduce((s, r) => s + r.amount, 0);
  const unappliedAmount = receipts.filter(r => r.unappliedAmount > 0).reduce((s, r) => s + r.unappliedAmount, 0);
  const unappliedCount = receipts.filter(r => r.status === "unapplied" || r.unappliedAmount > 0).length;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Cash Application" description="Receipt matching and cash application management" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Total Receipts" value={totalReceipts} icon={<DollarSign className="h-4 w-4" />} />
        <FPAKPICard title="Total Amount" value={`$${(totalAmount / 1e6).toFixed(1)}M`} icon={<DollarSign className="h-4 w-4" />} />
        <FPAKPICard title="Applied" value={`$${(appliedAmount / 1e6).toFixed(1)}M`} icon={<CheckCircle className="h-4 w-4" />} status="good" />
        <FPAKPICard title="Unapplied" value={`${unappliedCount} ($${(unappliedAmount / 1e3).toFixed(0)}K)`} icon={<Clock className="h-4 w-4" />} status={unappliedCount > 0 ? "warning" : "good"} />
      </div>
      <div className="mt-6">
        <CashApplicationCenter receipts={receipts} />
      </div>
    </PageContainer>
  );
}
