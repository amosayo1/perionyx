"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

interface InvestigationSummary {
  caseId: string;
  title: string;
  timelineEntries: number;
  evidenceCount: number;
  exceptionCount: number;
  openExceptions: number;
  resolvedExceptions: number;
  journalSuggestionCount: number;
  openEscalations: number;
  currentAssignee: string | null;
  lastActivity: string | null;
  totalVariance: number;
}

export function InvestigationWorkspace() {
  const [summaries, setSummaries] = useState<InvestigationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reconciliation/cases")
      .then((r) => r.json())
      .then((data) => {
        // Transform cases into investigation summaries
        const cases = data.cases ?? [];
        const transformed = cases.map((c: Record<string, unknown>) => ({
          caseId: c.id,
          title: c.title,
          timelineEntries: 0,
          evidenceCount: 0,
          exceptionCount: c.exceptionCount ?? 0,
          openExceptions: c.exceptionCount ?? 0,
          resolvedExceptions: 0,
          journalSuggestionCount: 0,
          openEscalations: 0,
          currentAssignee: c.assignedTo,
          lastActivity: c.updatedAt,
          totalVariance: 0,
        }));
        setSummaries(transformed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/5" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Investigation Hub</h1>
        <p className="mt-1 text-sm text-white/60">
          Track and resolve reconciliation exceptions
        </p>
      </div>

      <div className="space-y-3">
        {summaries.map((summary, i) => (
          <motion.div
            key={summary.caseId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{summary.title}</h3>
                  <div className="mt-1 flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {summary.openExceptions} open
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {summary.resolvedExceptions} resolved
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {summary.evidenceCount} evidence
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {summary.journalSuggestionCount} journals
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {summary.currentAssignee && (
                  <span className="text-xs text-white/40">
                    Assigned: {summary.currentAssignee}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-white/40" />
              </div>
            </div>
          </motion.div>
        ))}
        {summaries.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-white/40">No cases to investigate</p>
          </div>
        )}
      </div>
    </div>
  );
}
