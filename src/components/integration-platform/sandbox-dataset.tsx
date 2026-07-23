"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, Play, Download } from "lucide-react";
import type { SandboxDatasetData } from "./types";

interface SandboxDatasetProps {
  datasets: SandboxDatasetData[];
  onCreate: (datasetId: string) => Promise<void>;
}

const DATASET_LABELS: Record<string, { label: string; icon: string }> = {
  "quickbooks-online": { label: "QuickBooks Online", icon: "🏢" },
  "xero-gbp": { label: "Xero GBP", icon: "🏦" },
  "sap-erp": { label: "SAP ERP", icon: "🏭" },
  "stripe-us": { label: "Stripe US", icon: "💳" },
  "open-banking-uk": { label: "Open Banking UK", icon: "🇬🇧" },
  "oracle-netsuite": { label: "Oracle NetSuite", icon: "☁️" },
  "dynamics-365": { label: "Dynamics 365", icon: "📊" },
  "sage-intacct": { label: "Sage Intacct", icon: "📋" },
};

export function SandboxDatasets({ datasets, onCreate }: SandboxDatasetProps) {
  const [creating, setCreating] = useState<string | null>(null);

  const handleCreate = async (id: string) => {
    setCreating(id);
    try { await onCreate(id); }
    finally { setCreating(null); }
  };

  if (datasets.length === 0) {
    return <p className="py-4 text-center text-sm text-zinc-500">No sandbox datasets available</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {datasets.map(d => {
        const meta = DATASET_LABELS[d.id] ?? { label: d.id, icon: "📦" };
        return (
          <motion.div
            key={d.id} layout
            className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-lg">{meta.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{meta.label}</p>
                <p className="text-xs text-zinc-500">{d.connectorDefId ?? d.name} · {d.description ?? "No description"}</p>
              </div>
            </div>
            <button
              onClick={() => handleCreate(d.id)}
              disabled={creating === d.id}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50"
            >
              {creating === d.id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" /> : <Play className="h-3 w-3" />}
              {creating === d.id ? "Creating..." : "Create Sandbox"}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
