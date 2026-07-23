import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ReportScheduleForm } from "@/components/financial-reports/report-schedule-form";

export default async function SchedulesPage() {
  const session = await auth();
  const companyId = session?.user?.activeCompanyId;

  const schedules = companyId ? await prisma.financialReportSchedule.findMany({
    where: { companyId },
    orderBy: { nextRunAt: "asc" },
  }) : [];

  return (
    <PageContainer>
      <EnterprisePageHeader title="Report Schedules" description="Automated report generation and delivery" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Active Schedules ({schedules.length})</h2>
          {schedules.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-8 text-center">
              <p className="text-zinc-400">No schedules yet. Create one to automate report delivery.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s: any) => (
                <div key={s.id} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{s.name}</h3>
                      <p className="text-sm text-zinc-400">{s.frequency} &middot; {s.format}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${s.isActive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {s.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">New Schedule</h2>
          <ReportScheduleForm onSave={() => {}} onCancel={() => {}} />
        </div>
      </div>
    </PageContainer>
  );
}
