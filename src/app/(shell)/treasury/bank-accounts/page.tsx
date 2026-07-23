import { GlobalBankAccountDashboard } from "@/components/treasury/ebam/global-bank-account-dashboard";

export const metadata = {
  title: "Enterprise Bank Account Management (eBAM) | Treasury | Perionyx",
  description: "Enterprise-wide bank account governance platform — account registry, bank relationships, signatory management, mandate oversight, KYC compliance, ownership hierarchy, lifecycle tracking, dormant account management, compliance monitoring, and operational analytics",
};

export default function BankAccountsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <GlobalBankAccountDashboard />
    </div>
  );
}
