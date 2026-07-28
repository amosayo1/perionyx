import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import {
  Sun, Package, BarChart3, HeartHandshake, LayoutGrid,
  UserCircle, Compass, Sparkles, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

const QUICK_LINKS: QuickLink[] = [
  { title: "Morning Briefing", description: "Daily financial snapshot and key metrics", href: "/morning-briefing", icon: Sun, color: "text-amber-400" },
  { title: "Implementation Center", description: "Track deployment progress", href: "/implementation-center", icon: Package, color: "text-blue-400" },
  { title: "Adoption Analytics", description: "Understand platform usage", href: "/adoption-analytics", icon: BarChart3, color: "text-emerald-400" },
  { title: "Customer Success", description: "Resources, tickets, and feature requests", href: "/customer-success", icon: HeartHandshake, color: "text-purple-400" },
  { title: "Workspaces", description: "Navigate financial workspaces", href: "/workspaces", icon: LayoutGrid, color: "text-cyan-400" },
  { title: "Role Dashboard", description: "Role-specific KPIs and actions", href: "/role-dashboard", icon: UserCircle, color: "text-orange-400" },
  { title: "Interactive Guidance", description: "Product tours and walkthroughs", href: "/guidance", icon: Compass, color: "text-pink-400" },
  { title: "Feature Discovery", description: "Explore available features", href: "/feature-discovery", icon: Sparkles, color: "text-indigo-400" },
];

export default async function EnterpriseExperiencePage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    if (!ctx.tenant.companyId) redirect("/onboarding");
  
    const [latestScore, implementationMilestones, adoptionScore] = await Promise.all([
      prisma.adoptionScore.findFirst({
        where: { companyId: ctx.tenant.companyId },
        orderBy: { createdAt: "desc" },
        select: { overallScore: true, activeUsers: true, totalUsers: true },
      }),
      prisma.implementationMilestone.count({
        where: { companyId: ctx.tenant.companyId },
      }),
      prisma.adoptionScore.findFirst({
        where: { companyId: ctx.tenant.companyId },
        orderBy: { createdAt: "desc" },
        select: { overallScore: true },
      }),
    ]);
  
    const totalMilestones = implementationMilestones;
    const completedMilestones = await prisma.implementationProgress.count({
      where: { companyId: ctx.tenant.companyId, status: "completed" },
    });
    const implementationPercent =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const score = adoptionScore?.overallScore ?? 0;
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Enterprise Experience"
          description="Your central hub for platform adoption, guidance, and success"
        />
  
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/implementation-center"
            className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30"
          >
            <p className="text-xs text-zinc-500">Implementation</p>
            <p className="mt-1 text-3xl font-bold text-white">{implementationPercent}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${implementationPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {completedMilestones} of {totalMilestones} milestones
            </p>
          </Link>
  
          <Link
            href="/adoption-analytics"
            className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30"
          >
            <p className="text-xs text-zinc-500">Adoption Score</p>
            <p className="mt-1 text-3xl font-bold text-amber-400">{score}%</p>
            <p className="mt-1 text-xs text-zinc-500">
              {latestScore?.activeUsers ?? 0} active of {latestScore?.totalUsers ?? 0} users
            </p>
          </Link>
  
          <Link
            href="/morning-briefing"
            className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30"
          >
            <p className="text-xs text-zinc-500">Start Your Day</p>
            <p className="mt-1 text-lg font-semibold text-white">Morning Briefing</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-amber-400">
              View briefing <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
  
          <Link
            href="/guidance"
            className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 transition-all hover:border-amber-400/30"
          >
            <p className="text-xs text-zinc-500">Learn the Platform</p>
            <p className="mt-1 text-lg font-semibold text-white">Interactive Tours</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-amber-400">
              Start a tour <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
  
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
                <h4 className="text-sm font-semibold text-white group-hover:text-amber-400">
                  {link.title}
                </h4>
                <p className="mt-1 text-xs text-zinc-500">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    );
  });
}
