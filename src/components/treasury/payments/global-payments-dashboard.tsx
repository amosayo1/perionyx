"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ExecutivePaymentsHeader } from "./executive-payments-header";
import { TreasuryPaymentFilters } from "./treasury-payment-filters";
import { PaymentsOverview } from "./payments-overview";

interface GlobalPaymentsDashboardProps {
  className?: string;
}

const TABS = [
  "overview",
  "outgoing",
  "incoming",
  "approvals",
  "intercompany",
  "cash-movement",
  "calendar",
  "analytics",
  "recommendations",
  "alerts",
  "rails",
] as const;

type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  outgoing: "Outgoing",
  incoming: "Incoming",
  approvals: "Approvals",
  intercompany: "Intercompany",
  "cash-movement": "Cash Movement",
  calendar: "Calendar",
  analytics: "Analytics",
  recommendations: "Recommendations",
  alerts: "Alerts",
  rails: "Rails",
};

function TabPanel({ children, active, id }: { children: React.ReactNode; active: boolean; id: string }) {
  if (!active) return null;
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>
      {children}
    </div>
  );
}

export function GlobalPaymentsDashboard({ className }: GlobalPaymentsDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className={cn("space-y-6", className)}>
      <ExecutivePaymentsHeader />

      <TreasuryPaymentFilters />

      <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto" role="tablist" aria-label="Payments dashboard sections">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            className={cn(
              "px-4 py-2.5 text-[13px] font-medium capitalize whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab
                ? "border-gold text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200",
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <TabPanel active={activeTab === "overview"} id="overview">
        <PaymentsOverview />
      </TabPanel>

      <TabPanel active={activeTab === "outgoing"} id="outgoing">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Outgoing tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "incoming"} id="incoming">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Incoming tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "approvals"} id="approvals">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Approvals tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "intercompany"} id="intercompany">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Intercompany tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "cash-movement"} id="cash-movement">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Cash Movement tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "calendar"} id="calendar">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Calendar tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "analytics"} id="analytics">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Analytics tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "recommendations"} id="recommendations">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Recommendations tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "alerts"} id="alerts">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Alerts tab content</p>
        </div>
      </TabPanel>

      <TabPanel active={activeTab === "rails"} id="rails">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-400">Rails tab content</p>
        </div>
      </TabPanel>
    </div>
  );
}
