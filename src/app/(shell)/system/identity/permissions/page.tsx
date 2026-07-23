import { identityFacade } from "@/server/identity";
import { PermissionRegistry } from "@/server/iam/permissions";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

export default function PermissionsPage() {
  const categories = PermissionRegistry.getCategories();
  const totalPermissions = identityFacade.permissions.getAllPermissions().length;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Permissions"
        description={`${totalPermissions} permissions across ${categories.length} categories`}
      />

      <div className="space-y-4">
        {categories.map((category) => {
          const perms = PermissionRegistry.getByCategory(category);

          return (
            <details
              key={category}
              className="group rounded-xl border border-white/[0.06] bg-zinc-900/80 transition-colors hover:border-white/[0.1]"
            >
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white capitalize">{category}</span>
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
                    {perms.length}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="border-t border-white/[0.06] px-5 py-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-3 py-2 text-left font-medium text-zinc-500">Permission</th>
                      <th className="px-3 py-2 text-left font-medium text-zinc-500">Description</th>
                      <th className="px-3 py-2 text-left font-medium text-zinc-500">Scopes</th>
                      <th className="px-3 py-2 text-left font-medium text-zinc-500">MFA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perms.map((p) => (
                      <tr key={p.name} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                        <td className="px-3 py-2.5 font-mono text-xs text-[#d4a843]">{p.name}</td>
                        <td className="px-3 py-2.5 text-zinc-300">{p.description}</td>
                        <td className="px-3 py-2.5 text-zinc-400">
                          {p.scopes.join(", ")}
                        </td>
                        <td className="px-3 py-2.5">
                          {p.requiresMfa
                            ? (
                              <span className="inline-flex items-center rounded-full bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-400">
                                Required
                              </span>
                            )
                            : (
                              <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-500">
                                Optional
                              </span>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
      </div>
    </PageContainer>
  );
}
