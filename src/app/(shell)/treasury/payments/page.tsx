import { GlobalPaymentsDashboard } from "@/components/treasury/payments/global-payments-dashboard";

export const metadata = {
  title: "Enterprise Payments & Cash Movement Center | Treasury | Perionyx",
  description: "Enterprise-wide payments and cash movement operations center — payment planning, approval workflows, execution tracking, settlement reconciliation, cash movement waterfall, payment rail optimization, intercompany funding, and operational treasury analytics",
};

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <GlobalPaymentsDashboard />
    </div>
  );
}
