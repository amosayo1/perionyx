import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { ReportList } from "@/components/financial-reports/report-list";
import Link from "next/link";

export default async function FinancialReportsPage() {
  const session = await auth();
  const companyId = session?.user?.activeCompanyId;

  const definitions = companyId ? await prisma.financialReportDefinition.findMany({
    where: { companyId, isActive: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  }) : [];

  const recentExecutions = companyId ? await prisma.financialReportExecution.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 5,
  }) : [];

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Financial Reports"
        description="Enterprise-grade financial reporting and statement engine"
        actions={
          <div className="flex gap-3">
            <Link
              href="/financial-reports/builder"
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-500 transition-colors"
            >
              Create Report
            </Link>
            <Link
              href="/financial-reports/board-pack"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Board Pack
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Saved Reports" value={definitions.length.toString()} />
        <KpiCard label="Executions (30d)" value={recentExecutions.length.toString()} />
        <KpiCard label="Report Types" value="19" />
        <KpiCard label="Audience Presets" value="9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickActionCard href="/financial-reports/builder" title="Report Builder" description="Design custom financial reports" />
        <QuickActionCard href="/financial-reports/executive" title="Executive Reports" description="Audience-tailored report generation" />
        <QuickActionCard href="/financial-reports/schedules" title="Schedules" description="Automated report delivery" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Saved Reports</h2>
          <Link href="/financial-reports/builder" className="text-sm text-amber-400 hover:text-amber-300">View All</Link>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40">
          <ReportList definitions={JSON.parse(JSON.stringify(definitions))} onSelect={() => {}} onCreate={() => {}} />
        </div>
      </section>
    </PageContainer>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function QuickActionCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors">
      <h3 className="font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{description}</p>
    </Link>
  );
}
