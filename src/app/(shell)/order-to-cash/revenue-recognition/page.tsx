import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { RevenueRecognitionBoard } from "../../../../components/order-to-cash/revenue-recognition-board";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { Calendar, DollarSign, Clock, TrendingUp } from "lucide-react";

export default function RevenueRecognitionPage() {
  const schedules = orderToCashService.revenueRecognition.getAllSchedules();
  const totalSchedules = orderToCashService.revenueRecognition.count();
  const totalAmount = schedules.reduce((s, r) => s + r.totalAmount, 0);
  const totalRecognized = schedules.filter(s => s.status === "recognized").reduce((s, r) => s + r.recognizedAmount, 0);
  const totalDeferred = schedules.filter(s => s.status === "deferred").reduce((s, r) => s + r.deferredAmount, 0);
  const scheduledCount = schedules.filter(s => s.status === "scheduled").length;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Revenue Recognition" description="ASC 606 revenue scheduling and deferral management" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Schedules" value={totalSchedules} icon={<Calendar className="h-4 w-4" />} />
        <FPAKPICard title="Total Value" value={`$${(totalAmount / 1e6).toFixed(1)}M`} icon={<DollarSign className="h-4 w-4" />} />
        <FPAKPICard title="Recognized" value={`$${(totalRecognized / 1e6).toFixed(1)}M`} icon={<TrendingUp className="h-4 w-4" />} status="good" />
        <FPAKPICard title="Deferred" value={`$${(totalDeferred / 1e6).toFixed(1)}M`} icon={<Clock className="h-4 w-4" />} status={totalDeferred > 0 ? "warning" : "good"} />
      </div>
      <div className="mt-6">
        <RevenueRecognitionBoard schedules={schedules} />
      </div>
    </PageContainer>
  );
}
