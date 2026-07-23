import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { WorkflowDashboard } from "@/components/orchestration/workflow-dashboard";
import {
  FileText, LayoutTemplate, Zap, Activity, Clock, BarChart3, ArrowRight,
  type LucideIcon,
} from "lucide-react";

const QUICK_LINKS: Array<{ title: string; description: string; href: string; icon: LucideIcon; color: string }> = [
  { title: "Workflow Builder", description: "Design and configure workflows", href: "/orchestration/builder", icon: FileText, color: "text-amber-400" },
  { title: "Templates", description: "Pre-built workflow templates", href: "/orchestration/templates", icon: LayoutTemplate, color: "text-emerald-400" },
  { title: "Automation Rules", description: "Event-driven automation", href: "/orchestration/automation-rules", icon: Zap, color: "text-blue-400" },
  { title: "Monitoring", description: "System health and metrics", href: "/orchestration/monitoring", icon: Activity, color: "text-purple-400" },
  { title: "Executions", description: "View execution history", href: "/orchestration/executions", icon: Clock, color: "text-cyan-400" },
  { title: "Scheduler", description: "Cron-based scheduling", href: "/orchestration/scheduler", icon: Clock, color: "text-orange-400" },
  { title: "Analytics", description: "Workflow performance data", href: "/orchestration/analytics", icon: BarChart3, color: "text-pink-400" },
];

export default async function OrchestrationPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Platform Orchestration"
        description="Automate, schedule, and monitor financial workflows across your enterprise"
      />

      <WorkflowDashboard />

      <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Modules</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30 hover:bg-zinc-900/60"
            >
              <Icon className={`mb-3 h-6 w-6 ${link.color}`} />
              <h4 className="text-sm font-semibold text-white group-hover:text-amber-400">{link.title}</h4>
              <p className="mt-1 text-xs text-zinc-500">{link.description}</p>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
