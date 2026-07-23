"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  CalendarClock, Plus, ArrowRight, Clock, Play, Webhook,
  Zap, RefreshCw, CheckCircle2, ShieldCheck, Trash2, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { AutomationSchedule } from "@/modules/automation-studio/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const SchedulerForm = dynamic(() => import("./scheduler-form").then(m => ({ default: m.SchedulerForm })), { ssr: false });
import type { SchedulerFormData } from "./scheduler-form";

interface Props {
  schedules: AutomationSchedule[];
}

const TRIGGER_ICONS: Record<string, any> = {
  immediate: Zap,
  scheduled: Clock,
  recurring: RefreshCw,
  cron: CalendarClock,
  webhook: Webhook,
  manual: Play,
  connector_event: RefreshCw,
  bank_event: RefreshCw,
  erp_event: RefreshCw,
  approval_event: CheckCircle2,
  governance_event: ShieldCheck,
  decision_event: Zap,
};

const TRIGGER_COLORS: Record<string, string> = {
  immediate: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  scheduled: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  recurring: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  cron: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20",
  webhook: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  manual: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  connector_event: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  bank_event: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  erp_event: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  approval_event: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  governance_event: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  decision_event: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

function formatTriggerType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ScheduleCard({ schedule, onEdit, onDelete }: { schedule: AutomationSchedule; onEdit: () => void; onDelete: () => void }) {
  const Icon = TRIGGER_ICONS[schedule.triggerType] ?? Clock;
  const colorClasses = TRIGGER_COLORS[schedule.triggerType] ?? TRIGGER_COLORS.manual;

  return (
    <div
      className="group rounded-lg border border-white/[0.06] bg-zinc-900/30 transition-colors hover:bg-zinc-900/50"
      role="region"
      aria-label={`Schedule: ${schedule.name}`}
    >
      <div className="flex items-start justify-between p-4">
        <button type="button" onClick={onEdit} className="flex items-start gap-3 flex-1 text-left" aria-label={`Edit ${schedule.name}`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClasses}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">{schedule.name}</p>
              <Badge variant={schedule.enabled ? "success" : "default"} className="text-[9px]">
                {schedule.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="capitalize">{formatTriggerType(schedule.triggerType)}</span>
              {schedule.cronExpression && (
                <>
                  <span className="text-zinc-600" aria-hidden="true">&middot;</span>
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-[#d4af37]">
                    {schedule.cronExpression}
                  </code>
                </>
              )}
              {schedule.eventType && (
                <>
                  <span className="text-zinc-600" aria-hidden="true">&middot;</span>
                  <span>{schedule.eventType}</span>
                </>
              )}
            </div>
            {schedule.templateId && (
              <p className="mt-1 text-[10px] text-zinc-600">
                Template: {schedule.templateId}
              </p>
            )}
          </div>
        </button>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {schedule.lastRunAt && (
            <span className="text-[10px] text-zinc-600">
              Last: {new Date(schedule.lastRunAt).toLocaleDateString()}
            </span>
          )}
          {schedule.nextRunAt && schedule.enabled && (
            <span className="text-[10px] text-emerald-400">
              Next: {new Date(schedule.nextRunAt).toLocaleDateString()}
            </span>
          )}
          <div className="flex items-center gap-1 mt-1">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-1.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-amber-400"
              aria-label={`Edit ${schedule.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
              aria-label={`Delete ${schedule.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SchedulerClient({ schedules: initialSchedules }: Props) {
  const router = useRouter();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<AutomationSchedule | null>(null);
  const [confirmState, setConfirmState] = useState<{ open: boolean; onConfirm: () => void; title: string; message: string; destructive?: boolean }>({ open: false, onConfirm: () => {}, title: "", message: "" });
  const pageSize = 20;

  const triggerTypes = Array.from(new Set(schedules.map((s) => s.triggerType)));

  const filtered = schedules.filter((s) => {
    if (typeFilter && s.triggerType !== typeFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paged = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSave = useCallback(async (data: SchedulerFormData) => {
    const isEdit = !!editSchedule;
    const url = isEdit ? `/api/automation-studio/schedules/${editSchedule!.id}` : "/api/automation-studio/schedules";
    const method = isEdit ? "PUT" : "POST";

    const promise = fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || err.details?.[0]?.message || "Request failed");
      }
      const result: AutomationSchedule = await res.json();
      setSchedules((prev) =>
        isEdit
          ? prev.map((s) => (s.id === result.id ? result : s))
          : [result, ...prev],
      );
      setDialogOpen(false);
      setEditSchedule(null);
      router.refresh();
      return result;
    });

    toast.promise(promise, {
      loading: isEdit ? "Updating schedule..." : "Creating schedule...",
      success: isEdit ? "Schedule updated" : "Schedule created",
      error: (err: Error) => err.message,
      action: {
        label: "Retry",
        onClick: () => handleSave(data),
      },
    });
  }, [editSchedule, router]);

  const handleDelete = useCallback(async (schedule: AutomationSchedule) => {

    const promise = fetch(`/api/automation-studio/schedules/${schedule.id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to delete");
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
      router.refresh();
    });

    toast.promise(promise, {
      loading: "Deleting schedule...",
      success: "Schedule deleted",
      error: "Failed to delete schedule",
      action: {
        label: "Retry",
        onClick: () => handleDelete(schedule),
      },
    });
  }, [router]);

  const confirmDelete = useCallback((schedule: AutomationSchedule) => {
    setConfirmState({
      open: true,
      destructive: true,
      title: "Delete Schedule",
      message: `Delete schedule "${schedule.name}"? This cannot be undone.`,
      onConfirm: () => {
        setConfirmState((prev) => ({ ...prev, open: false }));
        handleDelete(schedule);
      },
    });
  }, [handleDelete]);

  const openCreate = () => {
    setEditSchedule(null);
    setDialogOpen(true);
  };

  const openEdit = (schedule: AutomationSchedule) => {
    setEditSchedule(schedule);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" id="scheduler-heading">Scheduler</h1>
          <p className="mt-1 text-sm text-zinc-400" id="scheduler-description">
            Configure when and how automations are triggered
          </p>
        </div>
        <nav className="flex items-center gap-2" aria-label="Scheduler actions">
          <Button onClick={openCreate} className="gap-2" aria-label="Create new schedule">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Schedule
          </Button>
          <Link href="/automation-studio">
            <Button variant="outline" size="sm" className="gap-1.5" aria-label="Back to dashboard">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
              Dashboard
            </Button>
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3" role="search" aria-label="Search schedules">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search schedules..."
        />
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by trigger type">
          <button
            onClick={() => setTypeFilter(null)}
            role="tab"
            aria-selected={typeFilter === null}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              typeFilter === null
                ? "bg-[#d4af37]/10 text-[#d4af37]"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
            }`}
          >
            All
          </button>
          {triggerTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              role="tab"
              aria-selected={typeFilter === t}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                typeFilter === t
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}
            >
              {formatTriggerType(t)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center" role="status">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/60 text-zinc-600">
              <CalendarClock className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-white">
              {search ? "No matching schedules" : "No schedules configured"}
            </h3>
            <p className="mb-4 text-sm text-zinc-500">
              {search
                ? "Try a different search term."
                : "Schedule automations to run immediately, on a cron schedule, or trigger by events."}
            </p>
            {!search && (
              <Button onClick={openCreate} className="gap-2" aria-label="Create your first schedule">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Your First Schedule
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" role="list" aria-label="Schedules">
          {paged.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onEdit={() => openEdit(schedule)}
              onDelete={() => confirmDelete(schedule)}
            />
          ))}
        </div>
      )}
      {filtered.length > pageSize && (
        <PaginationBar
          page={safePage}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      )}

      <SchedulerForm
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) setEditSchedule(null); setDialogOpen(open); }}
        onSave={handleSave}
        editSchedule={editSchedule}
      />

      <ConfirmDialog
        open={confirmState.open}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        title={confirmState.title}
        message={confirmState.message}
        destructive={confirmState.destructive}
        confirmLabel="Delete"
      />
    </div>
  );
}
