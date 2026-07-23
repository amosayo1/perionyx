import Link from "next/link";
import { identityFacade } from "@/server/identity";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

const CATEGORIES = [
  { href: "/system/identity/users", label: "Users", description: "Provisioned users and sync status" },
  { href: "/system/identity/groups", label: "Groups", description: "User groups and memberships" },
  { href: "/system/identity/roles", label: "Roles", description: "Role definitions and assignments" },
  { href: "/system/identity/permissions", label: "Permissions", description: "Granular permission registry" },
  { href: "/system/identity/providers", label: "Identity Providers", description: "SSO, OIDC, SAML, LDAP connections" },
  { href: "/system/identity/sessions", label: "Sessions", description: "Active user sessions" },
  { href: "/system/identity/audit", label: "Audit", description: "Security event audit trail" },
  { href: "/system/identity/policies", label: "Security Policies", description: "Password, session, MFA policies" },
];

export default function IdentityPage() {
  const health = identityFacade.health();
  const groupCount = identityFacade.groups.count();
  const roleCount = identityFacade.roles.count();
  const policyCount = identityFacade.policies.count();

  const cards = [
    { label: "Users", value: health.userCount, color: "text-blue-400" },
    { label: "Groups", value: groupCount, color: "text-emerald-400" },
    { label: "Roles", value: roleCount, color: "text-violet-400" },
    { label: "Identity Providers", value: health.providerCount, color: "text-amber-400" },
    { label: "Active Sessions", value: health.sessionCount, color: "text-cyan-400" },
    { label: "Audit Logs", value: health.auditCount, color: "text-rose-400" },
  ];

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Identity & Access Management"
        description="Manage users, roles, permissions, identity providers, and security policies"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/[0.06] bg-zinc-900/80 p-5"
          >
            <p className="text-sm font-medium text-zinc-500">{card.label}</p>
            <p className={`mt-1 text-3xl font-bold tracking-tight ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/80 p-5">
        <h2 className="text-lg font-semibold text-white">Health Status</h2>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm text-zinc-300 capitalize">{health.status}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <span className="text-zinc-500">Providers</span>
            <p className="font-medium text-zinc-200">{health.providerCount}</p>
          </div>
          <div>
            <span className="text-zinc-500">Users</span>
            <p className="font-medium text-zinc-200">{health.userCount}</p>
          </div>
          <div>
            <span className="text-zinc-500">Sessions</span>
            <p className="font-medium text-zinc-200">{health.sessionCount}</p>
          </div>
          <div>
            <span className="text-zinc-500">Audit Records</span>
            <p className="font-medium text-zinc-200">{health.auditCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group rounded-xl border border-white/[0.06] bg-zinc-900/80 p-5 transition-colors hover:border-white/[0.12] hover:bg-zinc-900"
          >
            <h3 className="font-semibold text-white group-hover:text-[#d4a843] transition-colors">
              {cat.label}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">{cat.description}</p>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
