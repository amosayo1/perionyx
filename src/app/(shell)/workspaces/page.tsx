import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import {
  Landmark, CalendarCheck, BarChart3, SearchCheck,
  ShoppingCart, Wallet, Building2, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Landmark,
  CalendarCheck,
  BarChart3,
  SearchCheck,
  ShoppingCart,
  Wallet,
  Building2,
};

function WorkspaceCard({
  slug,
  name,
  description,
  iconName,
  order,
  isActive,
}: {
  slug: string;
  name: string;
  description: string | null;
  iconName: string | null;
  order: number;
  isActive: boolean;
}) {
  const Icon = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Building2;
  return (
    <Link
      href={`/workspaces/${slug}`}
      className={`group block rounded-xl border bg-zinc-900/40 p-5 transition-all hover:border-amber-400/30 hover:bg-zinc-900/60 ${
        isActive ? "border-white/[0.06]" : "border-white/[0.03] opacity-60"
      }`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] group-hover:border-amber-400/20">
        <Icon className="h-5 w-5 text-zinc-400 group-hover:text-amber-400" />
      </div>
      <h3 className="text-sm font-semibold text-white">{name}</h3>
      {description && (
        <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{description}</p>
      )}
      {!isActive && (
        <span className="mt-2 inline-block rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-xs text-zinc-400">
          Inactive
        </span>
      )}
    </Link>
  );
}

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  const ctx = requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  const workspaces = await prisma.workspace.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { order: "asc" },
  });

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Workspaces"
        description="Navigate to your financial workspaces"
      />

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-900/40 p-12 text-center">
          <Building2 className="mb-3 h-12 w-12 text-zinc-600" />
          <p className="text-lg font-medium text-zinc-400">No workspaces configured</p>
          <p className="mt-1 text-sm text-zinc-500">Workspaces will appear here once configured by your administrator.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workspaces.map((ws: any) => (
            <WorkspaceCard
              key={ws.id}
              slug={ws.slug}
              name={ws.name}
              description={ws.description}
              iconName={ws.icon}
              order={ws.order}
              isActive={ws.isActive}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
