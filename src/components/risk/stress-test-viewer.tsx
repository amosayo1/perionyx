"use client";

import type { StressTest } from "./risk-types";

interface StressTestViewerProps {
  tests: StressTest[];
  max?: number;
}

export function StressTestViewer({ tests, max = 8 }: StressTestViewerProps) {
  const completed = tests.filter((t) => t.status === "completed").slice(0, max);

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Completed Stress Tests</h3>
        <span className="text-xs text-gray-500">{tests.filter((t) => t.status === "completed").length} total</span>
      </div>
      {completed.length === 0 ? (
        <p className="text-sm text-gray-500">No completed stress tests</p>
      ) : (
        <div className="space-y-2">
          {completed.map((test) => (
            <div key={test.id} className="rounded border border-gray-800 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-200">{test.name}</p>
                <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] capitalize text-gray-400">{test.scenarioType.replace(/-/g, " ")}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{test.description}</p>
              {test.results && (
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {Object.entries(test.results).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="rounded bg-gray-800/50 p-1.5">
                      <p className="text-[10px] text-gray-500">{key.replace(/_/g, " ")}</p>
                      <p className="text-xs font-medium text-gray-200">
                        {typeof val === "number" ? (Math.abs(val) >= 1e9 ? `$${(val / 1e9).toFixed(1)}B` : Math.abs(val) >= 1e6 ? `$${(val / 1e6).toFixed(0)}M` : val.toFixed(0)) : val}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[10px] text-gray-600">By: {test.performedBy} • {test.performedAt?.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}