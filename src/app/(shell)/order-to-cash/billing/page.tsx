import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { BillingCenter } from "../../../../components/order-to-cash/billing-center";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { FileText, DollarSign, Clock, AlertTriangle } from "lucide-react";

export default function BillingPage() {
  const invoices = orderToCashService.billing.getAllInvoices();
  const totalInvoices = orderToCashService.billing.count();
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.amountOutstanding, 0);
  const overdueCount = invoices.filter(i => i.arStatus === "overdue").length;
  const overdueAmount = invoices.filter(i => i.arStatus === "overdue").reduce((s, i) => s + i.amountOutstanding, 0);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Billing" description="Invoice management and billing operations" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Total Invoices" value={totalInvoices} icon={<FileText className="h-4 w-4" />} />
        <FPAKPICard title="Total Billed" value={`$${(totalBilled / 1e6).toFixed(1)}M`} icon={<DollarSign className="h-4 w-4" />} />
        <FPAKPICard title="Outstanding" value={`$${(totalOutstanding / 1e6).toFixed(1)}M`} icon={<Clock className="h-4 w-4" />} status={totalOutstanding > 0 ? "warning" : "good"} />
        <FPAKPICard title="Overdue" value={`${overdueCount} ($${(overdueAmount / 1e6).toFixed(1)}M)`} icon={<AlertTriangle className="h-4 w-4" />} status={overdueCount > 0 ? "critical" : "good"} />
      </div>
      <div className="mt-6">
        <BillingCenter invoices={invoices} />
      </div>
    </PageContainer>
  );
}
