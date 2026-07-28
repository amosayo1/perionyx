"use client";

import type { O2CRecommendation } from "./o2c-types";
import { Lightbulb, TrendingUp, TrendingDown, Shield, DollarSign, Users, Zap, Target, ArrowRight } from "lucide-react";

interface RecommendationsPanelProps {
  recommendations: O2CRecommendation[];
  max?: number;
  onApply?: (id: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  collection: <DollarSign className="h-4 w-4" />,
  credit: <Shield className="h-4 w-4" />,
  pricing: <TrendingUp className="h-4 w-4" />,
  customer: <Users className="h-4 w-4" />,
  process: <Zap className="h-4 w-4" />,
  dso: <Target className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  collection: "text-emerald-400",
  credit: "text-amber-400",
  pricing: "text-blue-400",
  customer: "text-violet-400",
  process: "text-cyan-400",
  dso: "text-orange-400",
};

export function RecommendationsPanel({ recommendations, max = 10, onApply }: RecommendationsPanelProps) {
  const displayed = recommendations.slice(0, max);
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-medium text-gray-200">Recommendations</h3>
      </div>
      <div className="space-y-2">
        {displayed.map((r) => (
          <div key={r.id} className="flex items-start gap-3 rounded-lg border border-gray-800 p-3">
            <div className={`mt-0.5 ${typeColors[r.type] || "text-gray-500"}`}>
              {typeIcons[r.type] || <Lightbulb className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">{r.title}</p>
              <p className="text-xs text-gray-400">{r.description}</p>
              <div className="mt-1 flex items-center gap-3 text-[10px]">
                <span className="text-gray-500">Impact: <span className="text-gray-400">{r.impact}</span></span>
                <span className="text-gray-500">Confidence: <span className={`${r.confidence >= 80 ? "text-emerald-400" : r.confidence >= 50 ? "text-amber-400" : "text-gray-400"}`}>{r.confidence}%</span></span>
              </div>
            </div>
            {onApply && (
              <button onClick={() => onApply(r.id)} className="flex items-center gap-1 rounded border border-gray-700 px-2 py-1 text-[10px] text-gray-400 hover:border-gray-600 hover:text-gray-300">
                Apply <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
