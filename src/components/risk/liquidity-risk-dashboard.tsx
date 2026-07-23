"use client";

import type { LiquidityRiskData } from "./risk-types";

interface LiquidityRiskDashboardProps {
  liquidityData: LiquidityRiskData[];
}

export function LiquidityRiskDashboard({ liquidityData }: LiquidityRiskDashboardProps) {
  const avgLcr = liquidityData.length > 0 ? liquidityData.reduce((s, d) => s + d.liquidityCoverageRatio, 0) / liquidityData.length : 0;
  const totalGap = liquidityData.reduce((s, d) => s + d.fundingGap, 0);
  const totalBuffer = liquidityData.reduce((s, d) => s + d.liquidityBuffer, 0);
  const totalEmergency = liquidityData.reduce((s, d) => s + d.emergencyLiquidity, 0);
  const totalReserve = liquidityData.reduce((s, d) => s + d.cashReserve, 0);
  const avgRefi = liquidityData.length > 0 ? liquidityData.reduce((s, d) => s + d.refinancingRisk, 0) / liquidityData.length : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Avg LCR</p>
          <p className={`text-lg font-semibold ${avgLcr >= 100 ? "text-emerald-400" : "text-red-400"}`}>{avgLcr.toFixed(0)}%</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Total Funding Gap</p>
          <p className={`text-lg font-semibold ${totalGap >= 0 ? "text-emerald-400" : "text-red-400"}`}>${(totalGap / 1e6).toFixed(0)}M</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Liquidity Buffer</p>
          <p className="text-lg font-semibold text-white">${(totalBuffer / 1e6).toFixed(0)}M</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Refinancing Risk</p>
          <p className="text-lg font-semibold text-white">{(avgRefi * 100).toFixed(1)}%</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Emergency Liquidity</p>
          <p className="text-lg font-semibold text-white">${(totalEmergency / 1e6).toFixed(0)}M</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a1a] p-3">
          <p className="text-xs text-gray-500">Cash Reserve</p>
          <p className="text-lg font-semibold text-white">${(totalReserve / 1e6).toFixed(0)}M</p>
        </div>
      </div>
    </div>
  );
}