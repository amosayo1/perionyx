import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { CustomerRegistry } from "../../../../components/order-to-cash/customer-registry";
import { CustomerHierarchy } from "../../../../components/order-to-cash/customer-hierarchy";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { Users, UserCheck, Ban, Shield } from "lucide-react";

export default function CustomersPage() {
  const customers = orderToCashService.customers.getAllCustomers();
  const totalCustomers = orderToCashService.customers.count();
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const blockedCustomers = customers.filter(c => c.isBlocked).length;
  const onCreditHold = customers.filter(c => c.creditOnHold).length;

  const groupMap = new Map<string, { count: number; revenue: number }>();
  for (const c of customers) {
    const entry = groupMap.get(c.group) ?? { count: 0, revenue: 0 };
    entry.count++;
    entry.revenue += c.totalRevenue;
    groupMap.set(c.group, entry);
  }
  const hierarchyGroups = Array.from(groupMap.entries()).map(([name, data]) => ({
    id: name,
    name: name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    customerCount: data.count,
    totalRevenue: data.revenue,
  }));

  return (
    <PageContainer>
      <EnterprisePageHeader title="Customers" description="Customer registry, hierarchy, and credit management" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Total Customers" value={totalCustomers} icon={<Users className="h-4 w-4" />} />
        <FPAKPICard title="Active" value={activeCustomers} icon={<UserCheck className="h-4 w-4" />} status={activeCustomers > 0 ? "good" : "warning"} />
        <FPAKPICard title="Blocked" value={blockedCustomers} icon={<Ban className="h-4 w-4" />} status={blockedCustomers > 0 ? "critical" : "good"} />
        <FPAKPICard title="On Credit Hold" value={onCreditHold} icon={<Shield className="h-4 w-4" />} status={onCreditHold > 0 ? "warning" : "good"} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerRegistry customers={customers} />
        </div>
        <div>
          <CustomerHierarchy groups={hierarchyGroups} />
        </div>
      </div>
    </PageContainer>
  );
}
