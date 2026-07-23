"use client";

import type { Reconciliation } from "./accounting-types";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

interface BankReconciliationPanelProps {
  reconciliations: Reconciliation[];
}

export function BankReconciliationPanel({ reconciliations }: BankReconciliationPanelProps) {
  const bankRecs = reconciliations.filter((r) => r.type === "bank").slice(0, 10);
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <div className="border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-medium text-gray-200">Bank Reconciliation</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {bankRecs.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">No bank reconciliations</div>
        ) : (
          bankRecs.map((r) => {
            const isBalanced = Math.abs(r.difference) < 100;
            return (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30">
                <div className="flex items-center gap-3">
                  {isBalanced ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
                  <div>
                    <p className="text-sm font-medium text-gray-200">{r.accountId}</p>
                    <p className="text-xs text-gray-500">{r.statementDate.toLocaleDateString()} • {r.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs text-gray-500">Statement</p>
                    <p className="text-sm text-gray-200">${r.statementBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ledger</p>
                    <p className="text-sm text-gray-200">${r.ledgerBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Diff</p>
                    <p className={`text-sm font-medium ${isBalanced ? "text-emerald-400" : "text-red-400"}`}>${r.difference.toLocaleString()}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-600" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
