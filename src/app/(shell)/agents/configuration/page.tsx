import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AgentConfigurationClient } from "@/components/agent-framework/agent-configuration-client";
import { Settings } from "lucide-react";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function AgentConfigurationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const params = await searchParams;
  
    if (params.id) {
      const config = await prisma.agentConfiguration.findFirst({
        where: { id: params.id, companyId: ctx.tenant.companyId },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              role: true,
              status: true,
              description: true,
            },
          },
        },
      });
  
      if (!config) {
        return (
          <PageContainer>
            <EnterprisePageHeader
              title="Agent Configuration"
              description="Configuration not found"
            />
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-16 text-center">
              <Settings className="mb-3 h-6 w-6 text-zinc-500" />
              <p className="text-sm text-zinc-400">Configuration not found</p>
              <Link href="/agents/configuration" className="mt-3 text-xs text-[#d4af37] hover:underline">
                View all configurations
              </Link>
            </div>
          </PageContainer>
        );
      }
  
      return (
        <PageContainer>
          <EnterprisePageHeader
            title={`${config.agent.name} Configuration`}
            description={`Runtime settings for ${config.agent.role} agent`}
            actions={
              <Link
                href="/agents/configuration"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
              >
                All Configurations
              </Link>
            }
          />
          <AgentConfigurationClient
            config={{
              id: config.id,
              agentId: config.agentId,
              maxConcurrentTasks: config.maxConcurrentTasks,
              taskTimeout: config.taskTimeout,
              maxRetries: config.maxRetries,
              rateLimitPerMinute: config.rateLimitPerMinute,
              allowedActions: config.allowedActions,
              forbiddenActions: config.forbiddenActions,
              escalationRules: config.escalationRules as Record<string, unknown>,
              safetyPolicies: config.safetyPolicies as Record<string, unknown>,
              notificationPrefs: config.notificationPrefs as Record<string, unknown>,
              config: config.config as Record<string, unknown>,
            }}
            agent={config.agent}
          />
        </PageContainer>
      );
    }
  
    const configs = await prisma.agentConfiguration.findMany({
      where: { companyId: ctx.tenant.companyId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            role: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Agent Configuration"
          description="Runtime settings for all agents — concurrency, timeouts, rate limits, and action policies"
          actions={
            <Link
              href="/agents/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
            >
              <Settings className="h-4 w-4" />
              Dashboard
            </Link>
          }
        />
  
        <AgentConfigurationClient
          configs={configs.map((c) => ({
            id: c.id,
            agentId: c.agentId,
            maxConcurrentTasks: c.maxConcurrentTasks,
            taskTimeout: c.taskTimeout,
            maxRetries: c.maxRetries,
            rateLimitPerMinute: c.rateLimitPerMinute,
            allowedActions: c.allowedActions,
            forbiddenActions: c.forbiddenActions,
            escalationRules: c.escalationRules as Record<string, unknown>,
            safetyPolicies: c.safetyPolicies as Record<string, unknown>,
            notificationPrefs: c.notificationPrefs as Record<string, unknown>,
            config: c.config as Record<string, unknown>,
            agent: c.agent,
          }))}
        />
      </PageContainer>
    );
  });
}
