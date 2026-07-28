"use client";

import type { MarketRiskData, FXRiskData, InterestRateRiskData } from "./risk-types";

interface MarketRiskDashboardProps {
  marketData: MarketRiskData[];
  fxData: FXRiskData[];
  interestData: InterestRateRiskData[];
}

function StatBox({ label, value, format = "number" }: { label: string; value: number; format?: string }) {
  const fmt = (v: number) => {
    if (format === "currency") {
      const abs = Math.abs(v);
      if (abs >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
      if (abs >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
      if (abs >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
      return `$${v.toFixed(0)}`;
    }
    if (format === "percent") return `${(v * 100).toFixed(1)}%`;
    if (format === "years") return `${v.toFixed(1)}y`;
    return v.toFixed(2);
  };

  return (
    <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-white">{fmt(value)}</p>
    </div>
  );
}

export function MarketRiskDashboard({ marketData, fxData, interestData }: MarketRiskDashboardProps) {
  const totalExposure = marketData.reduce((s, d) => s + d.portfolioExposure, 0);
  const avgVar95 = marketData.length > 0 ? marketData.reduce((s, d) => s + d.var95, 0) / marketData.length : 0;
  const avgVol = marketData.length > 0 ? marketData.reduce((s, d) => s + d.volatility, 0) / marketData.length : 0;
  const netFx = fxData.reduce((s, d) => s + d.netExposure, 0);
  const totalDuration = interestData.reduce((s, d) => s + d.duration, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-300">Market Risk Summary</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatBox label="Portfolio Exposure" value={totalExposure} format="currency" />
          <StatBox label="Avg VaR (95%)" value={avgVar95} format="currency" />
          <StatBox label="Avg Volatility" value={avgVol} format="percent" />
          <StatBox label="Avg Duration" value={totalDuration / Math.max(interestData.length, 1)} format="years" />
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-300">FX Risk Summary</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatBox label="Gross Exposure" value={fxData.reduce((s, d) => s + d.grossExposure, 0)} format="currency" />
          <StatBox label="Net Exposure" value={netFx} format="currency" />
          <StatBox label="Natural Hedge" value={fxData.reduce((s, d) => s + d.naturalHedge, 0)} format="currency" />
          <StatBox label="FX Gain/Loss" value={fxData.reduce((s, d) => s + d.fxGainLoss, 0)} format="currency" />
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-300">Interest Rate Risk Summary</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatBox label="Yield Curve Exposure" value={interestData.reduce((s, d) => s + d.yieldCurveExposure, 0)} format="currency" />
          <StatBox label="Avg Modified Duration" value={interestData.reduce((s, d) => s + d.modifiedDuration, 0) / Math.max(interestData.length, 1)} format="years" />
          <StatBox label="Rate Shock 100bp" value={interestData.reduce((s, d) => s + d.rateShock100bp, 0)} format="currency" />
          <StatBox label="Rate Shock 200bp" value={interestData.reduce((s, d) => s + d.rateShock200bp, 0)} format="currency" />
        </div>
      </div>
    </div>
  );
}