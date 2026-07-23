import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AgentTasksClient } from "@/components/agent-framework/agent-tasks-client";
import { ListTodo } from "lucide-react";

export default async function AgentTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; taskType?: string }>;
}) {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;
  const statusFilter = params.status && params.status !== "ALL" ? params.status : undefined;
  const taskTypeFilter = params.taskType && params.taskType !== "ALL" ? params.taskType : undefined;

  const where: Record<string, unknown> = { companyId: ctx.companyId };
  if (statusFilter) where.status = statusFilter;
  if (taskTypeFilter) where.taskType = taskTypeFilter;

  const [tasks, taskStats, typeStats] = await Promise.all([
    prisma.agentTask.findMany({
      where,
      include: {
        agent: { select: { id: true, name: true, role: true } },
        session: { select: { id: true, status: true } },
        capability: { select: { id: true, name: true, capabilityType: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.agentTask.groupBy({
      by: ["status"],
      where: { companyId: ctx.companyId },
      _count: { id: true },
    }),
    prisma.agentTask.groupBy({
      by: ["taskType"],
      where: { companyId: ctx.companyId },
      _count: { id: true },
    }),
  ]);

  const stats = {
    total: taskStats.reduce((acc, s) => acc + s._count.id, 0),
    byStatus: Object.fromEntries(taskStats.map((s) => [s.status, s._count.id])),
    byType: Object.fromEntries(typeStats.map((s) => [s.taskType, s._count.id])),
  };

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Agent Tasks"
        description="Track, filter, and monitor all agent tasks across your fleet"
        actions={
          <Link
            href="/agents/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            <ListTodo className="h-4 w-4" />
            Dashboard
          </Link>
        }
      />

      <AgentTasksClient tasks={tasks as unknown as TaskRow[]} stats={stats} />
    </PageContainer>
  );
}

type TaskRow = {
  id: string;
  name: string;
  description: string;
  taskType: string;
  priority: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  retryCount: number;
  maxRetries: number;
  error: Record<string, unknown> | null;
  agent: { id: string; name: string; role: string };
  session: { id: string; status: string } | null;
  capability: { id: string; name: string; capabilityType: string } | null;
};
