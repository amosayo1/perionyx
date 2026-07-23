import { identityFacade } from "@/server/identity";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

export default function RolesPage() {
  const roles = identityFacade.roles.getAllRoles() as Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    permissions: string[];
    inherits: string[];
    isCustom: boolean;
    companyId: string;
    createdAt: Date;
  }>;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Roles"
        description={`${roles.length} role definitions`}
      />

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-900/60">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Description</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Category</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Permissions</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Inherits</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Type</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-600">
                  No roles defined yet
                </td>
              </tr>
            )}
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-white">{role.name}</td>
                <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">
                  {role.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                    {role.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-zinc-200">{role.permissions.length}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {role.inherits.length > 0
                    ? role.inherits.join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {role.isCustom
                    ? (
                      <span className="inline-flex items-center rounded-full bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-400">
                        Custom
                      </span>
                    )
                    : (
                      <span className="inline-flex items-center rounded-full bg-blue-900/40 px-2 py-0.5 text-xs font-medium text-blue-400">
                        Built-in
                      </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
