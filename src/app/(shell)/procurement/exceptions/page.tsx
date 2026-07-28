"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ExceptionQueue, type Exception } from "../../../../components/procurement/exception-queue";
import { AlertTriangle, CheckCircle, Clock, ArrowUpRight } from "lucide-react";

function StatCard({ title, value, icon, variant = "default" }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: "default" | "critical" | "warning" | "success";
}) {
  const colors = {
    default: "border-gray-800 bg-[#1a1a24]",
    critical: "border-red-900/50 bg-red-950/20",
    warning: "border-amber-900/50 bg-amber-950/20",
    success: "border-emerald-900/50 bg-emerald-950/20",
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[variant]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{title}</span>
        <span className="text-gray-600">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-100">{value}</p>
    </div>
  );
}

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExceptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/ap/exceptions?limit=100", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setExceptions(data.data.exceptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exceptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExceptions(); }, [fetchExceptions]);

  const openCount = exceptions.filter((e) => e.status === "OPEN").length;
  const inReviewCount = exceptions.filter((e) => e.status === "IN_REVIEW").length;
  const escalatedCount = exceptions.filter((e) => e.status === "ESCALATED").length;
  const resolvedCount = exceptions.filter((e) => e.status === "RESOLVED").length;
  const criticalCount = exceptions.filter((e) => e.severity === "CRITICAL" && e.status !== "RESOLVED").length;

  const handleAssign = async (id: string, userId: string) => {
    const res = await fetch(`/api/v1/ap/exceptions/${id}/assign`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: userId }),
    });
    if (!res.ok) throw new Error(`Assign failed: ${res.status}`);
    await fetchExceptions();
  };

  const handleResolve = async (id: string, resolution: string, notes: string) => {
    const res = await fetch(`/api/v1/ap/exceptions/${id}/resolve`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution, resolutionNotes: notes }),
    });
    if (!res.ok) throw new Error(`Resolve failed: ${res.status}`);
    await fetchExceptions();
  };

  const handleEscalate = async (id: string, reason: string) => {
    const res = await fetch(`/api/v1/ap/exceptions/${id}/escalate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(`Escalate failed: ${res.status}`);
    await fetchExceptions();
  };

  const handleBulkResolve = async (ids: string[], resolution: string, notes: string) => {
    const res = await fetch("/api/v1/ap/exceptions/bulk-resolve", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exceptionIds: ids, resolution, resolutionNotes: notes }),
    });
    if (!res.ok) throw new Error(`Bulk resolve failed: ${res.status}`);
    await fetchExceptions();
  };

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Exception Queue"
        description="Review, assign, and resolve AP invoice exceptions"
      />

      <div className="mt-6 grid grid-cols-5 gap-4">
        <StatCard title="Open" value={openCount} icon={<AlertTriangle className="h-4 w-4" />} variant={openCount > 0 ? "warning" : "default"} />
        <StatCard title="In Review" value={inReviewCount} icon={<Clock className="h-4 w-4" />} />
        <StatCard title="Escalated" value={escalatedCount} icon={<ArrowUpRight className="h-4 w-4" />} variant={escalatedCount > 0 ? "critical" : "default"} />
        <StatCard title="Resolved" value={resolvedCount} icon={<CheckCircle className="h-4 w-4" />} variant="success" />
        <StatCard title="Critical Open" value={criticalCount} icon={<AlertTriangle className="h-4 w-4" />} variant={criticalCount > 0 ? "critical" : "default"} />
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6">
        <ExceptionQueue
          exceptions={exceptions}
          onAssign={handleAssign}
          onResolve={handleResolve}
          onEscalate={handleEscalate}
          onBulkResolve={handleBulkResolve}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}
