import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { PeriodCloseBoard } from "../../../../components/gl/period-close-board";
import type { ClosingChecklist } from "../../../../server/gl/types";

export default async function PeriodClosePage() {
  const periods = glService.periods.getAllPeriods();
  const fiscalYears = glService.periods.getAllFiscalYears();
  const currentPeriod = glService.periods.getCurrentPeriod();

  const checklists: Record<string, ClosingChecklist[]> = {};
  for (const p of periods) {
    const items = glService.periods.getChecklist(p.id);
    if (items.length > 0) {
      checklists[p.id] = items;
    }
  }

  const openPeriods = periods.filter((p) => p.status === "open" || p.status === "reopened").length;
  const softClosed = periods.filter((p) => p.status === "soft-close").length;
  const hardClosed = periods.filter((p) => p.status === "hard-close").length;
  const lockedPeriods = periods.filter((p) => p.status === "locked").length;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Period Close"
        description="Period-end closing workflow and checklists"
      />
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Periods</p>
          <p className="text-2xl font-bold text-white">{periods.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs text-emerald-400/70">Open</p>
          <p className="text-2xl font-bold text-emerald-400">{openPeriods}</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-400/70">Soft Close</p>
          <p className="text-2xl font-bold text-amber-400">{softClosed}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs text-red-400/70">Hard Closed</p>
          <p className="text-2xl font-bold text-red-400">{hardClosed}</p>
        </div>
      </div>
      {currentPeriod && (
        <div className="rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-3">
          <p className="text-xs text-zinc-500">Current Period</p>
          <p className="text-sm font-semibold text-[#d4af37]">{currentPeriod.period} ({currentPeriod.fiscalYear})</p>
        </div>
      )}
      <PeriodCloseBoard periods={periods} checklists={checklists} />
    </PageContainer>
  );
}
