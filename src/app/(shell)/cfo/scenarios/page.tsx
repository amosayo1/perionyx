import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ScenarioCard } from "@/components/cfo-advisor/scenario-card";
import { BarChart3, Plus, Play, AlertTriangle } from "lucide-react";

export default async function CFOScenariosPage() {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const result = await CFOAdvisorService.getScenarios(ctx, {
    limit: 50,
  }).catch(() => ({ items: [], total: 0 }));

  const scenarios = result.items;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Scenario Planner"
        description="What-if analysis for revenue, expenses, FX, acquisitions, and strategic decisions"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Scenarios", value: result.total, icon: BarChart3 },
          {
            label: "Completed",
            value: scenarios.filter((s) => s.status === "COMPLETED").length,
            icon: Play,
          },
          {
            label: "Running",
            value: scenarios.filter((s) => s.status === "RUNNING").length,
            icon: AlertTriangle,
          },
          {
            label: "Failed",
            value: scenarios.filter((s) => s.status === "FAILED").length,
            icon: AlertTriangle,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Create Scenario
            </h2>
            <p className="text-xs text-zinc-500">
              Define parameters and run what-if analysis
            </p>
          </div>
        </div>

        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Scenario Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Q3 Revenue Decline"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d4af37]/30 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Scenario Type
            </label>
            <select
              name="scenarioType"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-[#d4af37]/30 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
            >
              <option value="revenue_decline">Revenue Decline</option>
              <option value="revenue_growth">Revenue Growth</option>
              <option value="payroll_increase">Payroll Increase</option>
              <option value="hiring_freeze">Hiring Freeze</option>
              <option value="customer_default">Customer Default</option>
              <option value="fx_movement">FX Movement</option>
              <option value="interest_rate">Interest Rate Change</option>
              <option value="tax_increase">Tax Increase</option>
              <option value="acquisition">Acquisition</option>
              <option value="capex">Capital Expenditure</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Base Amount ($)
            </label>
            <input
              type="number"
              name="baseAmount"
              placeholder="1000000"
              defaultValue={1000000}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d4af37]/30 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Change Rate (%)
            </label>
            <input
              type="number"
              name="changeRate"
              placeholder="0.10"
              step="0.01"
              defaultValue={0.1}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d4af37]/30 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-1 block text-xs text-zinc-500">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe the scenario assumptions and expected outcomes..."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d4af37]/30 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-5 py-2.5 text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20"
            >
              <Play className="h-4 w-4" />
              Run Scenario
            </button>
          </div>
        </form>
      </div>

      {scenarios.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              All Scenarios
            </h2>
            <span className="text-xs text-zinc-500">{result.total} total</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={{
                  name: scenario.name,
                  type: scenario.scenarioType,
                  status: scenario.status.toLowerCase() as
                    | "idle"
                    | "running"
                    | "completed"
                    | "failed",
                  parameters: scenario.parameters as Record<string, string>,
                  results: scenario.results.summary
                    ? {
                        summary: scenario.results.summary as string,
                        risk: scenario.results.risk as string | undefined,
                        outcome: scenario.results.outcome as
                          | string
                          | undefined,
                        confidence: scenario.results.confidence as
                          | number
                          | undefined,
                      }
                    : undefined,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {scenarios.length === 0 && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-8 w-8 text-zinc-500" />
          <p className="text-sm text-zinc-400">No scenarios yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Create your first what-if scenario above
          </p>
        </div>
      )}
    </PageContainer>
  );
}
