import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import type { ReportType } from "@/server/risk/types";

export default function RiskReportingPage() {
  const reports = riskService.riskReport.getAll();
  const byType = {} as Record<ReportType, number>;
  for (const r of reports) {
    byType[r.type] = (byType[r.type] ?? 0) + 1;
  }

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Reporting" description="Risk reports, dashboards, and regulatory filings" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          {(["dashboard", "summary", "detailed", "regulatory"] as const).map((t) => (
            <div key={t} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
              <p className="text-xs capitalize text-zinc-500">{t} Reports</p>
              <p className="text-2xl font-bold text-white">{byType[t] ?? 0}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No reports generated yet</p>
          ) : (
            [...reports].sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()).map((r) => {
              let section: Record<string, unknown> = {};
              try { section = JSON.parse(r.section) as Record<string, unknown>; } catch { /* ignore */ }
              return (
                <div key={r.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{r.title}</p>
                      <p className="text-xs text-zinc-500 capitalize">{r.type} • Period: {r.period}</p>
                    </div>
                    <span className="text-xs text-zinc-500">{r.generatedAt.toLocaleDateString()}</span>
                  </div>
                  {Object.keys(section).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(section).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="rounded bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-400">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageContainer>
  );
}
