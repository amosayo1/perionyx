"use client";

import type { EnterpriseRisk, Likelihood, Impact } from "./risk-types";

interface RiskMatrixProps {
  risks: EnterpriseRisk[];
}

const likelihoodOrder: Likelihood[] = ["rare", "unlikely", "possible", "likely", "almost-certain"];
const impactOrder: Impact[] = ["negligible", "minor", "moderate", "major", "severe"];

const matrixColors: Record<string, string> = {
  "0,0": "bg-emerald-600", "0,1": "bg-emerald-600", "0,2": "bg-yellow-500", "0,3": "bg-orange-500", "0,4": "bg-red-600",
  "1,0": "bg-emerald-600", "1,1": "bg-yellow-500", "1,2": "bg-yellow-500", "1,3": "bg-orange-500", "1,4": "bg-red-600",
  "2,0": "bg-yellow-500", "2,1": "bg-yellow-500", "2,2": "bg-orange-500", "2,3": "bg-red-600", "2,4": "bg-red-600",
  "3,0": "bg-orange-500", "3,1": "bg-orange-500", "3,2": "bg-red-600", "3,3": "bg-red-600", "3,4": "bg-red-700",
  "4,0": "bg-orange-500", "4,1": "bg-red-600", "4,2": "bg-red-600", "4,3": "bg-red-700", "4,4": "bg-red-700",
};

export function RiskMatrix({ risks }: RiskMatrixProps) {
  const getCount = (lIdx: number, iIdx: number): number =>
    risks.filter((r) => likelihoodOrder.indexOf(r.score.likelihood) === lIdx && impactOrder.indexOf(r.score.impact) === iIdx).length;

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-300">Risk Matrix (5×5)</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-xs">
          <thead>
            <tr>
              <th className="p-1 text-xs text-gray-500" />
              {impactOrder.map((imp) => (
                <th key={imp} className="rotate-180 p-1 text-center text-[10px] capitalize text-gray-500" style={{ writingMode: "vertical-lr" }}>
                  {imp}
                </th>
              ))}
            </tr>
            <tr><th colSpan={6} className="pb-1 text-center text-[10px] text-gray-600">Impact →</th></tr>
          </thead>
          <tbody>
            {likelihoodOrder.map((lik, lIdx) => (
              <tr key={lik}>
                <td className="pr-1 text-right text-[10px] capitalize text-gray-500">{lik}</td>
                {impactOrder.map((_, iIdx) => {
                  const count = getCount(lIdx, iIdx);
                  return (
                    <td key={iIdx} className="p-0.5">
                      <div className={`flex aspect-square items-center justify-center rounded text-[10px] font-medium ${matrixColors[`${lIdx},${iIdx}`]} ${count > 0 ? "text-white" : "text-gray-400"}`}>
                        {count || "-"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}