"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FileText, BookOpen, ClipboardList, ArrowRight, Search,
  FileSpreadsheet, Database, UserCheck, Shield, ExternalLink,
} from "lucide-react";
import type { ExplainSourceData } from "@/modules/intelligence-platform/types";

interface ExplainPanelProps {
  targetType: string;
  targetLabel: string;
  sources: ExplainSourceData[];
  onNavigate: (url: string) => void;
}

const SOURCE_ICONS: Record<string, typeof FileText> = {
  report: FileText,
  ledger: BookOpen,
  journal: ClipboardList,
  transaction: Search,
  document: FileSpreadsheet,
  import: Database,
  integration: Database,
  approval: UserCheck,
  audit: Shield,
};

const SOURCE_LABELS: Record<string, string> = {
  report: "Report",
  ledger: "Ledger Entry",
  journal: "Journal Entry",
  transaction: "Transaction",
  document: "Document",
  import: "Data Import",
  integration: "Integration",
  approval: "Approval",
  audit: "Audit Trail",
};

export function ExplainPanel({ targetType, targetLabel, sources, onNavigate }: ExplainPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          Why this number?
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Provenance for <span className="font-medium text-zinc-300 capitalize">{targetType}</span>: <span className="font-medium text-zinc-300">{targetLabel}</span>
        </p>
      </div>

      {sources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Database className="mb-2 h-6 w-6 text-zinc-700" />
          <p className="text-xs text-zinc-600">No source data available for this {targetType}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sources.map((source, i) => {
            const Icon = SOURCE_ICONS[source.sourceType] ?? FileText;
            const label = SOURCE_LABELS[source.sourceType] ?? source.sourceType;

            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative"
              >
                {i > 0 && (
                  <div className="absolute -top-2 left-5 flex items-center text-zinc-700">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{source.sourceLabel ?? label}</span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">{label}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      {new Date(source.createdAt).toLocaleString()}
                    </p>
                    {source.metadata?.description != null && (
                      <p className="mt-1 text-[11px] text-zinc-500">{String(source.metadata.description)}</p>
                    )}
                  </div>
                  {source.sourceUrl && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate(source.sourceUrl!)}
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          <Shield className="h-3 w-3" />
          <span>Audit trail • {sources.length} source{sources.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {sources.map((s, i) => (
            <span key={s.id} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
              {i + 1}. {SOURCE_LABELS[s.sourceType] ?? s.sourceType}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
