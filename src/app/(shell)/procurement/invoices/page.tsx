import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { FPAKPICard } from "../../../../components/fpa/fpa-kpi-card";
import { InvoiceMatchingCenter } from "../../../../components/procurement/invoice-matching-center";

export default function InvoicesPage() {
  const allInvoices = procurementService.invoiceMatching.getAllInvoices();
  const total = allInvoices.length;
  const matched = allInvoices.filter((inv) => inv.matchStatus === "matched").length;
  const exceptions = allInvoices.filter((inv) => inv.matchStatus === "exception").length;
  const pending = allInvoices.filter((inv) => inv.matchStatus === "pending").length;
  const approved = allInvoices.filter((inv) => inv.status === "approved" || inv.status === "paid").length;
  const totalAmount = allInvoices.reduce((s, inv) => s + inv.totalWithTax, 0);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Invoice Matching Center" description="2-way and 3-way invoice matching with exception resolution" />
      <div className="mt-6 grid grid-cols-5 gap-4">
        <FPAKPICard title="Total Invoices" value={total} status="good" />
        <FPAKPICard title="Matched" value={matched} status="good" />
        <FPAKPICard title="Exceptions" value={exceptions} status={exceptions > 0 ? "critical" : "good"} />
        <FPAKPICard title="Pending Match" value={pending} status={pending > 0 ? "warning" : "good"} />
        <FPAKPICard title="Total Value" value={`$${(totalAmount / 1000000).toFixed(1)}M`} status="good" />
      </div>
      <div className="mt-6">
        <InvoiceMatchingCenter invoices={allInvoices} />
      </div>
    </PageContainer>
  );
}
