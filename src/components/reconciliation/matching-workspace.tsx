"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Play,
  Pause,
} from "lucide-react";

interface MatchingRule {
  id: string;
  name: string;
  ruleType: string;
  priority: number;
  isActive: boolean;
  maxConfidenceThreshold: number;
  autoMatchEnabled: boolean;
}

interface MatchingSuggestion {
  id: string;
  suggestionType: string;
  confidence: number;
  sourceTotal: number;
  targetTotal: number;
  variance: number;
  status: string;
}

export function MatchingWorkspace() {
  const [rules, setRules] = useState<MatchingRule[]>([]);
  const [suggestions, setSuggestions] = useState<MatchingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningMatch, setRunningMatch] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/reconciliation/rules").then((r) => r.json()),
      fetch("/api/reconciliation/suggestions").then((r) => r.json()),
    ])
      .then(([rulesData, suggestionsData]) => {
        setRules(rulesData);
        setSuggestions(suggestionsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRunMatch = async () => {
    setRunningMatch(true);
    // In production, this would open a modal to select transactions
    setTimeout(() => setRunningMatch(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/5" />
        <div className="h-64 animate-pulse rounded-lg bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Matching Center</h1>
          <p className="mt-1 text-sm text-white/60">
            Run matching engines and review suggestions
          </p>
        </div>
        <button
          onClick={handleRunMatch}
          disabled={runningMatch}
          className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black hover:bg-gold-400 disabled:opacity-50"
        >
          {runningMatch ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {runningMatch ? "Running..." : "Run Matching"}
        </button>
      </div>

      {/* Active Rules */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Active Rules</h2>
        <div className="space-y-2">
          {rules
            .filter((r) => r.isActive)
            .map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div>
                    <span className="text-sm font-medium text-white">{rule.name}</span>
                    <span className="ml-2 text-xs text-white/40">{rule.ruleType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40">
                    Confidence: {(rule.maxConfidenceThreshold * 100).toFixed(0)}%
                  </span>
                  {rule.autoMatchEnabled && (
                    <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                      Auto
                    </span>
                  )}
                </div>
              </div>
            ))}
          {rules.filter((r) => r.isActive).length === 0 && (
            <p className="text-sm text-white/40">No active rules</p>
          )}
        </div>
      </div>

      {/* Pending Suggestions */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Pending Suggestions</h2>
        <div className="space-y-2">
          {suggestions
            .filter((s) => s.status === "PENDING")
            .map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded bg-blue-500/10 p-1.5">
                    <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">
                      {suggestion.suggestionType.replace(/_/g, " ")}
                    </span>
                    <span className="ml-2 text-xs text-white/40">
                      Confidence: {(suggestion.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded p-1.5 text-green-400 hover:bg-green-500/10" aria-label="Approve">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1.5 text-red-400 hover:bg-red-500/10" aria-label="Reject">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          {suggestions.filter((s) => s.status === "PENDING").length === 0 && (
            <p className="text-sm text-white/40">No pending suggestions</p>
          )}
        </div>
      </div>
    </div>
  );
}
