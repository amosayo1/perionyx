"use client";

import { Lightbulb, TrendingUp, DollarSign, RefreshCw, FileText, Zap, CheckCircle } from "lucide-react";
import type { ProcurementRecommendation } from "./procurement-types";

interface RecommendationsPanelProps {
  recommendations: ProcurementRecommendation[];
}

const typeIcons: Record<string, React.ReactNode> = {
  "vendor-consolidation": <Building2Icon />,
  "early-payment": <DollarSign className="h-4 w-4" />,
  "bulk-purchase": <TrendingUp className="h-4 w-4" />,
  "contract-negotiation": <FileText className="h-4 w-4" />,
  "category-optimization": <RefreshCw className="h-4 w-4" />,
  "process-automation": <Zap className="h-4 w-4" />,
};

function Building2Icon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
  );
}

const impactColors: Record<string, string> = {
  high: "text-emerald-400", medium: "text-amber-400", low: "text-gray-400",
};

const impactStyles: Record<string, string> = {
  high: "bg-emerald-950/50 border-emerald-900/50", medium: "bg-amber-950/50 border-amber-900/50", low: "bg-gray-800 border-gray-700",
};

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-[#1a1a24] p-6">
        <p className="text-xs text-gray-500">No recommendations available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recommendations.map((rec) => (
        <div key={rec.id} className={`rounded-lg border p-3 ${rec.implemented ? "border-emerald-900/30 bg-emerald-950/10" : "border-gray-800 bg-[#1a1a24]"}`}>
          <div className="flex items-start gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700 bg-gray-900 text-gray-400`}>
              {typeIcons[rec.type] || <Lightbulb className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-200">{rec.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{rec.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${impactStyles[rec.impact] || impactStyles.low}`}>
                    {rec.impact}
                  </span>
                  {rec.implemented && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs font-medium ${impactColors[rec.impact] || "text-gray-400"}`}>{rec.impact} impact</span>
                <span className="text-gray-600">·</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-12 rounded-full bg-gray-800">
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${rec.confidence}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{rec.confidence}% confidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
