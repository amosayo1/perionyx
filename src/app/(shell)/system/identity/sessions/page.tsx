import { identityFacade } from "@/server/identity";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

export default function SessionsPage() {
  const sessions = identityFacade.sessions.getAllActiveSessions();

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Active Sessions"
        description={`${sessions.length} active user sessions`}
      />

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-900/60">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">User</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Device</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">IP Address</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Auth Method</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">MFA</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Last Activity</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Expires</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-600">
                  No active sessions
                </td>
              </tr>
            )}
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{session.email}</p>
                    <p className="text-xs text-zinc-600">{session.userId}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400 max-w-[200px] truncate">
                  {session.deviceName || session.userAgent || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{session.ipAddress}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                    {session.authenticationMethod.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {session.mfaVerified
                    ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        Verified
                      </span>
                    )
                    : (
                      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-500">
                        No
                      </span>
                    )}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {session.lastActivityAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {session.expiresAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
