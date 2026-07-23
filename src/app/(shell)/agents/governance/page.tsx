import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AgentGovernanceClient } from "@/components/agent-framework/agent-governance-client";
import { Shield } from "lucide-react";

export default async function AgentGovernancePage() {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const [agents, permissions, configurations, auditRecent] = await Promise.all([
    prisma.agentDefinition.findMany({
      where: { companyId: ctx.companyId },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        enabled: true,
        configurations: {
          select: {
            id: true,
            permission: true,
            effect: true,
            reason: true,
            grantedBy: true,
            expiresAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        configuration: {
          select: {
            id: true,
            maxConcurrentTasks: true,
            taskTimeout: true,
            maxRetries: true,
            rateLimitPerMinute: true,
            allowedActions: true,
            forbiddenActions: true,
          },
        },
        _count: {
          select: {
            configurations: true,
            tasks: true,
            decisions: true,
            sessions: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.agentPermission.groupBy({
      by: ["effect"],
      where: { companyId: ctx.companyId },
      _count: { id: true },
    }),
    prisma.agentConfiguration.aggregate({
      where: { companyId: ctx.companyId },
      _count: { id: true },
      _avg: {
        maxConcurrentTasks: true,
        taskTimeout: true,
        maxRetries: true,
        rateLimitPerMinute: true,
      },
    }),
    prisma.agentAudit.findMany({
      where: {
        companyId: ctx.companyId,
        action: { in: ["permission.granted", "permission.revoked"] },
      },
      include: {
        agent: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const governanceSummary = {
    totalAgents: agents.length,
    activeAgents: agents.filter((a) => a.status === "ACTIVE").length,
    totalPermissions: permissions.reduce((acc, p) => acc + p._count.id, 0),
    allowedPermissions: permissions.find((p) => p.effect === "ALLOW")?._count.id ?? 0,
    deniedPermissions: permissions.find((p) => p.effect === "DENY")?._count.id ?? 0,
    totalConfigurations: configurations._count.id,
    avgConcurrency: configurations._avg.maxConcurrentTasks ?? 0,
    avgTimeout: configurations._avg.taskTimeout ?? 0,
    avgRetries: configurations._avg.maxRetries ?? 0,
    avgRateLimit: configurations._avg.rateLimitPerMinute ?? 0,
  };

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Agent Governance"
        description="Permissions, configurations, and audit trail across all agents"
        actions={
          <Link
            href="/agents/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            <Shield className="h-4 w-4" />
            Dashboard
          </Link>
        }
      />

      <AgentGovernanceClient
        agents={agents as unknown as AgentWithPermissions[]}
        summary={governanceSummary}
        recentAudit={auditRecent as unknown as AuditEntry[]}
      />
    </PageContainer>
  );
}

type AgentWithPermissions = {
  id: string;
  name: string;
  role: string;
  status: string;
  enabled: boolean;
  configurations: {
    id: string;
    permission: string;
    effect: string;
    reason: string;
    grantedBy: string | null;
    expiresAt: string | null;
  }[];
  configuration: {
    id: string;
    maxConcurrentTasks: number;
    taskTimeout: number;
    maxRetries: number;
    rateLimitPerMinute: number;
    allowedActions: string[];
    forbiddenActions: string[];
  } | null;
  _count: { configurations: number; tasks: number; decisions: number; sessions: number; auditLogs: number };
};

type AuditEntry = {
  id: string;
  action: string;
  createdAt: string;
  agent: { name: string };
  actorUserId: string | null;
};
