"use client";

import type { Scenario } from "./risk-types";

interface ScenarioSimulatorProps {
  scenarios: Scenario[];
  max?: number;
}

export function ScenarioSimulator({ scenarios, max = 6 }: ScenarioSimulatorProps) {
  const active = scenarios.filter((s) => s.status === "active").slice(0, max);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Active Scenarios</h3>
        <span className="text-xs text-gray-500">{scenarios.filter((s) => s.status === "active").length} active</span>
      </div>
      {active.length === 0 ? (
        <p className="text-sm text-gray-500">No active scenarios</p>
      ) : (
        <div className="space-y-2">
          {active.map((scenario) => (
            <div key={scenario.id} className="rounded border border-gray-800 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-200">{scenario.name}</p>
                <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] capitalize text-gray-400">{scenario.category.replace(/-/g, " ")}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{scenario.description}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500">
                <span>Impact: ${(scenario.financialImpact / 1e6).toFixed(1)}M</span>
                <span>Probability: {(scenario.probability * 100).toFixed(0)}%</span>
                <span>Horizon: {scenario.timeHorizon}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}