"use client";

import { useState } from "react";

interface ServiceOption {
  id: string;
  name: string;
  module: string;
  actions: string[];
}

const AVAILABLE_SERVICES: ServiceOption[] = [
  { id: "treasury", name: "Treasury", module: "treasury", actions: ["get_cash_position", "get_fx_rates", "get_receivables", "get_payables", "annual_cash_summary", "update_forecast"] },
  { id: "ledger", name: "Ledger", module: "ledger", actions: ["verify_trial_balance", "run_reconciliation", "match_transactions", "export_all_ledger"] },
  { id: "reporting", name: "Reporting", module: "reporting", actions: ["generate_financial_statements", "generate_income_statement", "generate_balance_sheet", "generate_cash_flow", "generate_trial_balance", "generate_general_ledger", "get_budget_data", "get_actuals", "generate_variance_report"] },
  { id: "intelligence", name: "Intelligence", module: "intelligence", actions: ["compute_kpis", "compute_variances", "compute_scorecard", "check_liquidity", "get_recommendations", "forecast_cash"] },
  { id: "integration", name: "Integration", module: "integration", actions: ["sync_bank_transactions", "sync_all", "export_audit_logs"] },
  { id: "approval", name: "Approval", module: "approval", actions: ["request_close_approval", "request_review"] },
  { id: "notification", name: "Notification", module: "notification", actions: [] },
];

interface OrchestrationServiceSelectorProps {
  onSelect: (service: string, action: string) => void;
}

export function OrchestrationServiceSelector({ onSelect }: OrchestrationServiceSelectorProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const service = AVAILABLE_SERVICES.find((s) => s.id === selectedService);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedService(s.id)}
            className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
              selectedService === s.id
                ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                : "border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {service && (
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
          <p className="mb-2 text-xs font-medium text-zinc-400">Select Action</p>
          <div className="flex flex-wrap gap-2">
            {service.actions.map((action) => (
              <button
                key={action}
                onClick={() => onSelect(service.module, action)}
                className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white"
              >
                {action.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
