import { GlobalTreasuryCommandCenter } from "@/components/treasury/command-center/global-treasury-command-center";

export const metadata = {
  title: "Treasury Executive Command Center | Treasury | Perionyx",
  description: "Enterprise Treasury Command Center — mission control for cash position, liquidity, payments, bank accounts, forecasting, risk, and treasury intelligence across all entities, currencies, and regions",
};

export default function TreasuryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <GlobalTreasuryCommandCenter />
    </div>
  );
}
