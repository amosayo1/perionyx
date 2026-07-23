"use client";

import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, Ban } from "lucide-react";
import type { ProcurementOverviewMetrics } from "./procurement-types";

interface ExecutiveInsightsProps {
  metrics: ProcurementOverviewMetrics;
  totalSpend: number;
  spendGrowth: number;
  avgSavingsPercent: number;
  vendorAtRisk: number;
  expiringContracts: number;
  approvalBottlenecks: number;
}

export function ExecutiveInsights({ metrics, totalSpend, spendGrowth, avgSavingsPercent, vendorAtRisk, expiringContracts, approvalBottlenecks }: ExecutiveInsightsProps) {
  const insights: Array<{ type: "positive" | "negative" | "info"; title: string; description: string }> = [];

  if (totalSpend > 0) {
    insights.push({
      type: spendGrowth < 10 ? "positive" : "info",
      title: spendGrowth < 10 ? "Controlled Spend Growth" : "Spend Growth Alert",
      description: `Total procurement spend is $${(totalSpend / 1e6).toFixed(1)}M with ${spendGrowth.toFixed(1)}% growth this period.`,
    });
  }

  if (avgSavingsPercent > 5) {
    insights.push({ type: "positive", title: "Cost Savings Achieved", description: `Average cost savings of ${avgSavingsPercent.toFixed(1)}% across procurement categories.` });
  } else {
    insights.push({ type: "info", title: "Limited Cost Savings", description: `Cost savings at ${avgSavingsPercent.toFixed(1)}% — review sourcing strategies for opportunities.` });
  }

  if (vendorAtRisk > 0) {
    insights.push({ type: "negative", title: "Vendors at Risk", description: `${vendorAtRisk} vendors flagged with high or critical risk levels — review and mitigate.` });
  }

  if (metrics.blockedVendors > 0) {
    insights.push({ type: "negative", title: "Blocked Vendors", description: `${metrics.blockedVendors} vendors are blocked due to compliance, disputes, or inactivity.` });
  }

  if (expiringContracts > 0) {
    insights.push({ type: "info", title: "Contracts Expiring Soon", description: `${expiringContracts} active contracts expire within 30 days — review renewal terms.` });
  }

  if (approvalBottlenecks > 0) {
    insights.push({ type: "negative", title: "Approval Bottlenecks", description: `${approvalBottlenecks} approvals are pending past their due date — escalate for action.` });
  }

  if (metrics.matchExceptions > 0) {
    insights.push({ type: "negative", title: "Invoice Match Exceptions", description: `${metrics.matchExceptions} invoice matching exceptions require investigation and resolution.` });
  }

  if (metrics.pendingApprovals > 0) {
    insights.push({ type: "info", title: "Pending Approvals", description: `${metrics.pendingApprovals} approvals are awaiting decision across PRs, POs, invoices, and contracts.` });
  }

  if (metrics.pendingInvoices > metrics.totalInvoices * 0.3) {
    insights.push({ type: "negative", title: "High Pending Invoices", description: `${metrics.pendingInvoices} invoices (${((metrics.pendingInvoices / Math.max(metrics.totalInvoices, 1)) * 100).toFixed(0)}%) are pending — consider process improvements.` });
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-medium text-gray-200">Executive Insights</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-800 p-3">
            <div className="mt-0.5">
              {insight.type === "positive" ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : insight.type === "negative" ? <AlertTriangle className="h-4 w-4 text-red-400" /> : <Lightbulb className="h-4 w-4 text-amber-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{insight.title}</p>
              <p className="text-xs text-gray-400">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
