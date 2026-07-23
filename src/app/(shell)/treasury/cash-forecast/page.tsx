import { GlobalCashForecastDashboard } from "@/components/treasury/cash-forecast/global-cash-forecast-dashboard";

export const metadata = {
  title: "Enterprise Cash Forecasting & Scenario Planning | Treasury | Perionyx",
  description: "Enterprise-wide cash forecasting and scenario planning center — forecast models, scenario analysis, stress testing, rolling forecasts, variance analysis, liquidity projections, funding forecasts, sensitivity analysis, and executive treasury intelligence",
};

export default function CashForecastPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <GlobalCashForecastDashboard />
    </div>
  );
}
