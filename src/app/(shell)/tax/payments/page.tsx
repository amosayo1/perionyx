import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { TaxPaymentCenter } from "../../../../components/tax/tax-payment-center";

export default async function TaxPaymentsPage() {
  const payments = taxService.payments.getAllPayments();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Tax Payments" description="Payment scheduling, execution, and reconciliation" />
      <TaxPaymentCenter payments={payments} />
    </PageContainer>
  );
}
