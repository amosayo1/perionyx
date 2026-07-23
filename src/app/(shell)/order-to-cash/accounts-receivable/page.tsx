import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { AccountsReceivableGrid } from "../../../../components/order-to-cash/accounts-receivable-grid";
import { AgingAnalysisChart } from "../../../../components/order-to-cash/aging-analysis-chart";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function AccountsReceivablePage() {
  const ar = orderToCashService.ar.getAllARRecords();
  const totalAR = ar.reduce((s, r) => s + r.totalAmount, 0);
  const totalOutstanding = ar.reduce((s, r) => s + r.amountOutstanding, 0);
  const overdueCount = ar.filter(r => r.status === "overdue").length;
  const disputedCount = ar.filter(r => r.dispute).length;

  const buckets = ["current", "1-30", "31-60", "61-90", "91+"];
  const agingData = buckets.map(bucket => {
    const records = ar.filter(r => r.agingBucket === bucket);
    const total = records.reduce((s, r) => s + r.amountOutstanding, 0);
    return {
      bucket,
      count: records.length,
      totalAmount: total,
      percentOfTotal: totalAR > 0 ? (total / totalAR) * 100 : 0,
    };
  });

  return (
    <PageContainer>
      <EnterprisePageHeader title="Accounts Receivable" description="AR aging, disputes, and collection status" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Total AR" value={`$${(totalAR / 1e6).toFixed(1)}M`} icon={<DollarSign className="h-4 w-4" />} />
        <FPAKPICard title="Outstanding" value={`$${(totalOutstanding / 1e6).toFixed(1)}M`} icon={<Clock className="h-4 w-4" />} status={totalOutstanding > 0 ? "warning" : "good"} />
        <FPAKPICard title="Overdue" value={overdueCount} icon={<AlertTriangle className="h-4 w-4" />} status={overdueCount > 0 ? "critical" : "good"} />
        <FPAKPICard title="Disputed" value={disputedCount} icon={<AlertTriangle className="h-4 w-4" />} status={disputedCount > 0 ? "warning" : "good"} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AccountsReceivableGrid records={ar} />
        </div>
        <div>
          <AgingAnalysisChart data={agingData} />
        </div>
      </div>
    </PageContainer>
  );
}
