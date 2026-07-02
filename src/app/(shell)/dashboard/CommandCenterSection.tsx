"use client";

import {
  TreasuryAccountsWidget,
  PendingApprovalsWidget,
  RiskAlertsWidget,
  ReconciliationHealthWidget,
  ConnectorHealthWidget,
  PolicyViolationsWidget,
} from "@/components/dashboard/CommandCenterWidgets";

export function CommandCenterSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-3 w-3 rounded-full bg-perionyx-gold shadow-[0_0_16px_2px_rgba(212,175,55,0.18)]" />
        <h2 className="text-lg font-semibold tracking-tight text-perionyx-text-primary uppercase tracking-[0.18em]">
          Executive Command Center
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <TreasuryAccountsWidget />
        <PendingApprovalsWidget />
        <RiskAlertsWidget />
        <ReconciliationHealthWidget />
        <ConnectorHealthWidget />
        <PolicyViolationsWidget />
      </div>
    </div>
  );
}
