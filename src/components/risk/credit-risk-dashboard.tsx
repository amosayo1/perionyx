"use client";

import type { CreditRiskData, CounterpartyRiskData, CountryRiskData, ConcentrationRiskData } from "./risk-types";

interface CreditRiskDashboardProps {
  creditData: CreditRiskData[];
  counterpartyData: CounterpartyRiskData[];
  countryData: CountryRiskData[];
  concentrationData: ConcentrationRiskData[];
}

export function CreditRiskDashboard({ creditData, counterpartyData, countryData, concentrationData }: CreditRiskDashboardProps) {
  const totalExposure = creditData.reduce((s, d) => s + d.exposure, 0);
  const avgPd = creditData.length > 0 ? creditData.reduce((s, d) => s + d.probabilityOfDefault, 0) / creditData.length : 0;
  const totalEcl = creditData.reduce((s, d) => s + d.expectedCreditLoss, 0);
  const totalUtilization = creditData.reduce((s, d) => s + d.creditUtilization, 0);
  const totalLimit = creditData.reduce((s, d) => s + d.creditLimit, 0);
  const utilRate = totalLimit > 0 ? (totalUtilization / totalLimit) * 100 : 0;

  const cpExposure = counterpartyData.reduce((s, d) => s + d.currentExposure, 0);
  const countryExposure = countryData.reduce((s, d) => s + d.exposureAmount, 0);
  const concExposure = concentrationData.reduce((s, d) => s + d.exposureAmount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Total Credit Exposure</p>
          <p className="text-lg font-semibold text-white">${(totalExposure / 1e6).toFixed(0)}M</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Avg Probability of Default</p>
          <p className="text-lg font-semibold text-white">{(avgPd * 100).toFixed(2)}%</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Expected Credit Loss</p>
          <p className="text-lg font-semibold text-white">${(totalEcl / 1e6).toFixed(1)}M</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Credit Utilization</p>
          <p className="text-lg font-semibold text-white">{utilRate.toFixed(1)}%</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Counterparty Exposure</p>
          <p className="text-lg font-semibold text-white">${(cpExposure / 1e6).toFixed(0)}M</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Country Exposure</p>
          <p className="text-lg font-semibold text-white">${(countryExposure / 1e6).toFixed(0)}M</p>
        </div>
        <div className="rounded border border-gray-800 bg-[#1a1a24] p-3">
          <p className="text-xs text-gray-500">Concentration Exposure</p>
          <p className="text-lg font-semibold text-white">${(concExposure / 1e6).toFixed(0)}M</p>
        </div>
      </div>
    </div>
  );
}