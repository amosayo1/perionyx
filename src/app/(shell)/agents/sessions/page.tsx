import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AgentSessionsClient } from "@/components/agent-framework/agent-sessions-client";
import { Activity } from "lucide-react";

export default async function AgentSessionsPage() {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const [activeSessions, recentSessions, sessionStats] = await Promise.all([
    prisma.agentSession.findMany({
      where: { companyId: ctx.companyId, status: "ACTIVE" },
      include: {
        agent: { select: { id: true, name: true, role: true, status: true } },
        tasks: {
          select: { id: true, name: true, status: true, taskType: true, priority: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: { select: { tasks: true, conversations: true } },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.agentSession.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["COMPLETED", "FAILED", "TERMINATED"] },
      },
      include: {
        agent: { select: { id: true, name: true, role: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 25,
    }),
    prisma.agentSession.groupBy({
      by: ["status"],
      where: { companyId: ctx.companyId },
      _count: { id: true },
    }),
  ]);

  const stats = {
    active: sessionStats.find((s) => s.status === "ACTIVE")?._count.id ?? 0,
    paused: sessionStats.find((s) => s.status === "PAUSED")?._count.id ?? 0,
    completed: sessionStats.find((s) => s.status === "COMPLETED")?._count.id ?? 0,
    failed: sessionStats.find((s) => s.status === "FAILED")?._count.id ?? 0,
    terminated: sessionStats.find((s) => s.status === "TERMINATED")?._count.id ?? 0,
  };

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Agent Sessions"
        description="Monitor active and recent agent sessions, context, and task progress"
        actions={
          <Link
            href="/agents/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            <Activity className="h-4 w-4" />
            Dashboard
          </Link>
        }
      />

      <AgentSessionsClient
        activeSessions={activeSessions as unknown as ActiveSession[]}
        recentSessions={recentSessions as unknown as RecentSession[]}
        stats={stats}
      />
    </PageContainer>
  );
}

type ActiveSession = {
  id: string;
  agentId: string;
  userId: string | null;
  status: string;
  context: Record<string, unknown>;
  config: Record<string, unknown>;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  agent: { id: string; name: string; role: string; status: string };
  tasks: { id: string; name: string; status: string; taskType: string; priority: number }[];
  _count: { tasks: number; conversations: number };
};

type RecentSession = {
  id: string;
  agentId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  agent: { id: string; name: string; role: string };
  _count: { tasks: number };
};
