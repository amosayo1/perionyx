"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MatchingRule {
  id: string;
  name: string;
  description: string;
  ruleType: string;
  priority: number;
  isActive: boolean;
  version: number;
  maxConfidenceThreshold: number;
  autoMatchEnabled: boolean;
  matchingCriteria: Record<string, unknown>;
  scoringWeights: Record<string, unknown>;
}

export function RuleBuilder() {
  const [rules, setRules] = useState<MatchingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reconciliation/rules")
      .then((r) => r.json())
      .then(setRules)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/5" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Rule Builder</h1>
          <p className="mt-1 text-sm text-white/60">
            Configure matching rules and scoring weights
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black hover:bg-gold-400">
          <Plus className="h-4 w-4" />
          New Rule
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-white/10 bg-white/5"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`h-2 w-2 rounded-full ${rule.isActive ? "bg-green-500" : "bg-white/20"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{rule.name}</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/60">
                      {rule.ruleType}
                    </span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/60">
                      v{rule.version}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/40">{rule.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/40">
                  Priority: {rule.priority}
                </span>
                <span className="text-xs text-white/40">
                  Threshold: {(rule.maxConfidenceThreshold * 100).toFixed(0)}%
                </span>
                {rule.autoMatchEnabled && (
                  <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                    Auto
                  </span>
                )}
                {expandedRule === rule.id ? (
                  <ChevronUp className="h-4 w-4 text-white/40" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-white/40" />
                )}
              </div>
            </div>

            {expandedRule === rule.id && (
              <div className="border-t border-white/10 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-white/60">
                      Matching Criteria
                    </h4>
                    <pre className="rounded-lg bg-white/5 p-3 text-xs text-white/80 overflow-auto">
                      {JSON.stringify(rule.matchingCriteria, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-white/60">
                      Scoring Weights
                    </h4>
                    <pre className="rounded-lg bg-white/5 p-3 text-xs text-white/80 overflow-auto">
                      {JSON.stringify(rule.scoringWeights, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10">
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10">
                    <Play className="h-3 w-3" />
                    Test
                  </button>
                  <button className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20">
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        {rules.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-white/40">No rules configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
