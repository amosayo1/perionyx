import type { Incident, IncidentStatus } from "./types";

const steps: { status: IncidentStatus; label: string }[] = [
  { status: "open", label: "Open" },
  { status: "investigating", label: "Investigating" },
  { status: "awaiting_info", label: "Awaiting Info" },
  { status: "fix_in_progress", label: "Fix In Progress" },
  { status: "resolved", label: "Resolved" },
  { status: "closed", label: "Closed" },
];

const stepIndex: Record<IncidentStatus, number> = {
  open: 0,
  investigating: 1,
  awaiting_info: 2,
  fix_in_progress: 3,
  resolved: 4,
  closed: 5,
};

export function IncidentResolutionCard({ incident }: { incident: Incident }) {
  const currentIdx = stepIndex[incident.status];

  return (
    <div className="space-y-4">
      {/* Status flow */}
      <div className="flex items-center gap-1">
        {steps.map((step, idx) => {
          const isPast = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={step.status} className="flex items-center gap-1 flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                    isCurrent
                      ? "bg-gold text-white"
                      : isPast
                        ? "bg-gold/20 text-gold"
                        : "bg-zinc-800 text-zinc-600"
                  }`}
                >
                  {isPast ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-[9px] font-medium text-center leading-tight ${
                    isCurrent ? "text-gold" : isPast ? "text-zinc-400" : "text-zinc-700"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    idx < currentIdx ? "bg-gold/40" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Resolution details */}
      {incident.resolutionSummary && (
        <div className="rounded-lg bg-zinc-900/40 border border-white/[0.06] p-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Resolution Summary
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">{incident.resolutionSummary}</p>
        </div>
      )}

      {incident.lessonsLearned && (
        <div className="rounded-lg bg-zinc-900/40 border border-white/[0.06] p-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Lessons Learned
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">{incident.lessonsLearned}</p>
        </div>
      )}

      {incident.rootCauseClassification && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="text-zinc-600">Classification:</span>
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-300">
            {incident.rootCauseClassification}
          </span>
        </div>
      )}
    </div>
  );
}
