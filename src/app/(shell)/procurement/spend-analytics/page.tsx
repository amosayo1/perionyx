import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { SpendAnalyticsDashboard } from "../../../../components/procurement/spend-analytics-dashboard";
import { SpendTrendChart } from "../../../../components/procurement/spend-trend-chart";
import { VendorSpendChart } from "../../../../components/procurement/vendor-spend-chart";
import { DepartmentSpendChart } from "../../../../components/procurement/department-spend-chart";
import { BudgetConsumptionChart } from "../../../../components/procurement/budget-consumption-chart";

export default function SpendAnalyticsPage() {
  const allAnalytics = procurementService.expenses.getAllAnalytics();
  const vendorAnalytics = allAnalytics.filter((a) => a.dimension === "vendor");
  const departmentAnalytics = allAnalytics.filter((a) => a.dimension === "department");
  const totalSpend = allAnalytics.reduce((s, a) => s + a.totalSpend, 0);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Spend Analytics" description="Procurement spend intelligence and budget tracking" />
      <div className="mt-6 space-y-6">
        <SpendAnalyticsDashboard analytics={allAnalytics} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SpendTrendChart analytics={allAnalytics} />
          <VendorSpendChart analytics={vendorAnalytics} totalSpend={totalSpend} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DepartmentSpendChart analytics={departmentAnalytics} />
          <BudgetConsumptionChart analytics={allAnalytics} />
        </div>
      </div>
    </PageContainer>
  );
}
