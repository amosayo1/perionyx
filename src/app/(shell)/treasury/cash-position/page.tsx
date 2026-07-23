import { GlobalCashDashboard } from "@/components/treasury/cash-position/global-cash-dashboard";

export const metadata = {
  title: "Global Cash Position | Treasury | Perionyx",
  description: "Enterprise-wide treasury cash position dashboard — total cash, available cash, restricted cash, liquidity, and regional breakdowns",
};

export default function CashPositionPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <GlobalCashDashboard />
    </div>
  );
}
