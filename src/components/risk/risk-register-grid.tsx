"use client";

import type { EnterpriseRisk } from "./risk-types";
import { HeatBadge, PriorityBadge, StatusBadge } from "./risk-badge";

interface RiskRegisterGridProps {
  risks: EnterpriseRisk[];
  max?: number;
}

export function RiskRegisterGrid({ risks, max = 20 }: RiskRegisterGridProps) {
  const sorted = [...risks].sort((a, b) => b.score.weightedScore - a.score.weightedScore);
  const displayed = sorted.slice(0, max);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a24]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500">Title</th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500">Category</th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500">Heat</th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500">Priority</th>
            <th className="whitespace-nowrap px-3 py-2 text-right text-xs font-medium text-gray-500">Score</th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500">Owner</th>
            <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500">Review</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((risk) => (
            <tr key={risk.id} className="hover:bg-gray-800/30">
              <td className="max-w-[200px] truncate px-3 py-2 text-sm text-gray-200">
                {risk.title}
              </td>
              <td className="px-3 py-2 text-xs capitalize text-gray-400">
                {risk.category.replace(/-/g, " ")}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={risk.status} />
              </td>
              <td className="px-3 py-2">
                <HeatBadge level={risk.score.heatLevel} />
              </td>
              <td className="px-3 py-2">
                <PriorityBadge priority={risk.priority} />
              </td>
              <td className="px-3 py-2 text-right text-sm font-medium text-white">
                {risk.score.weightedScore.toFixed(1)}
              </td>
              <td className="px-3 py-2 text-xs text-gray-400">
                {risk.owner}
              </td>
              <td className="px-3 py-2 text-xs text-gray-500">
                {risk.nextReviewDate.toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {risks.length > max && (
        <div className="border-t border-gray-800 px-3 py-2 text-center text-xs text-gray-500">
          Showing {max} of {risks.length} risks
        </div>
      )}
    </div>
  );
}