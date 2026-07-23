import { identityFacade } from "@/server/identity";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-rose-900/40 text-rose-400",
  error: "bg-red-900/40 text-red-400",
  warning: "bg-amber-900/40 text-amber-400",
  info: "bg-blue-900/40 text-blue-400",
};

export default function AuditPage() {
  const logs = identityFacade.audit.getRecentLogs(50);

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Audit Log"
        description={`${logs.length} recent security events`}
      />

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Filter by event type…"
          className="w-full max-w-sm rounded-lg border border-white/[0.06] bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-[#d4a843]/40 focus:outline-none"
          readOnly
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-900/60">
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Event</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">User</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Details</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Severity</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">IP</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-600">
                  No audit records found
                </td>
              </tr>
            )}
            {logs.toReversed().map((log) => (
              <tr key={log.id} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-[#d4a843]">{log.eventType}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-zinc-200">{log.userEmail || "—"}</p>
                    {log.userId && <p className="text-xs text-zinc-600">{log.userId}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">{log.details}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      SEVERITY_STYLES[log.severity] || "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {log.severity}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {log.ipAddress ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                  {log.timestamp.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
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
