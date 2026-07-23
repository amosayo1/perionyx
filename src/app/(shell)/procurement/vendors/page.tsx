import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { VendorRegistry } from "../../../../components/procurement/vendor-registry";
import { ProcurementFilters } from "../../../../components/procurement/procurement-filters";

export default function VendorsPage() {
  const vendors = procurementService.vendors.getAllVendors();
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === "active").length;
  const blockedVendors = vendors.filter((v) => v.isBlocked).length;
  const preferredVendors = vendors.filter((v) => v.preferred).length;

  const statusOptions = [...new Set(vendors.map((v) => v.status))];
  const vendorOptions = vendors.slice(0, 20).map((v) => v.name);
  const categoryOptions = [...new Set(vendors.map((v) => v.category))];
  const periodOptions = ["2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2"];

  return (
    <PageContainer>
      <EnterprisePageHeader title="Vendor Registry" description="Manage vendor relationships and performance" />
      <div className="mt-6 grid grid-cols-4 gap-4">
        <FPAKPICard title="Total Vendors" value={totalVendors} status="good" />
        <FPAKPICard title="Active" value={activeVendors} status="good" />
        <FPAKPICard title="Blocked" value={blockedVendors} status={blockedVendors > 0 ? "warning" : "good"} />
        <FPAKPICard title="Preferred" value={preferredVendors} status="good" />
      </div>
      <div className="mt-6">
        <ProcurementFilters statusOptions={statusOptions} vendorOptions={vendorOptions} departmentOptions={[]} categoryOptions={categoryOptions} periodOptions={periodOptions} />
        <div className="mt-4">
          <VendorRegistry vendors={vendors} />
        </div>
      </div>
    </PageContainer>
  );
}
