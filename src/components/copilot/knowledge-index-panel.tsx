"use client";

import { Database, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ModuleStatus = {
  name: string;
  recordCount: number;
  summary: string;
  available: boolean;
};

const MODULES: ModuleStatus[] = [
  { name: "Dashboard", recordCount: 0, summary: "Real-time KPIs and metrics", available: true },
  { name: "Wallets", recordCount: 0, summary: "Multi-currency wallet balances", available: true },
  { name: "Transactions", recordCount: 0, summary: "Payment and transfer records", available: true },
  { name: "Approvals", recordCount: 0, summary: "Approval workflows and chains", available: true },
  { name: "Policies", recordCount: 0, summary: "Policy engine and rules", available: true },
  { name: "Ledger", recordCount: 0, summary: "Double-entry ledger entries", available: true },
  { name: "Audit", recordCount: 0, summary: "Immutable audit trail", available: true },
  { name: "Risk", recordCount: 0, summary: "Alerts and incidents", available: true },
  { name: "Reconciliation", recordCount: 0, summary: "Bank-to-ledger matching", available: true },
  { name: "Treasury", recordCount: 0, summary: "Accounts and controls", available: true },
  { name: "Exchange Rates", recordCount: 0, summary: "FX rate tables", available: true },
  { name: "Calendar", recordCount: 0, summary: "Events and holidays", available: true },
  { name: "Notifications", recordCount: 0, summary: "System notifications", available: true },
  { name: "Connectors", recordCount: 0, summary: "Integration connections", available: true },
  { name: "API Keys", recordCount: 0, summary: "Developer API keys", available: true },
  { name: "Webhooks", recordCount: 0, summary: "Webhook deliveries", available: true },
];

export function KnowledgeIndexPanel() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2 px-2">
        <Database className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold">Knowledge Index</span>
      </div>
      <p className="text-[10px] text-zinc-600 px-2 mb-2">Copilot has live access to all platform modules.</p>
      <div className="space-y-0.5">
        {MODULES.map((m) => (
          <div
            key={m.name}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-white/[0.02]"
          >
            {m.available
              ? <CheckCircle className="h-3 w-3 shrink-0 text-gold" />
              : <Clock className="h-3 w-3 shrink-0 text-zinc-600" />
            }
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-zinc-400 truncate">{m.name}</p>
              <p className="text-[9px] text-zinc-600 truncate">{m.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
