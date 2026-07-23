import { GlobalRiskDashboard } from "@/components/treasury/risk/global-risk-dashboard";

export const metadata = {
  title: "Enterprise Treasury Risk & FX Management | Treasury | Perionyx",
  description: "Enterprise-wide treasury risk and FX management center — foreign exchange exposure, interest rate risk, counterparty risk, country risk, liquidity risk, concentration risk, hedging portfolio, stress testing, value at risk, policy management, and risk analytics",
};

export default function RiskPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <GlobalRiskDashboard />
    </div>
  );
}
