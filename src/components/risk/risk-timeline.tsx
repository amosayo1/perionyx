"use client";

interface TimelineEvent {
  date: Date;
  title: string;
  description: string;
  type: "created" | "updated" | "reviewed" | "breach" | "mitigated" | "closed" | "escalated";
}

interface RiskTimelineProps {
  events: TimelineEvent[];
}

export function RiskTimeline({ events }: RiskTimelineProps) {
  const renderIcon = (type: string) => {
    switch (type) {
      case "created": return <span className="text-emerald-400">+</span>;
      case "updated": return <span className="text-blue-400">~</span>;
      case "reviewed": return <span className="text-gray-400">✓</span>;
      case "breach": return <span className="text-red-400">!</span>;
      case "mitigated": return <span className="text-emerald-400">↓</span>;
      case "closed": return <span className="text-gray-500">×</span>;
      case "escalated": return <span className="text-amber-400">△</span>;
      default: return <span className="text-gray-400">•</span>;
    }
  };

  const borderColor = (type: string) => {
    switch (type) {
      case "created": return "border-emerald-800";
      case "updated": return "border-blue-800";
      case "breach": return "border-red-800";
      case "mitigated": return "border-emerald-800";
      case "escalated": return "border-amber-800";
      default: return "border-gray-700";
    }
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-300">Activity Timeline</h3>
      <div className="space-y-0">
        {events.slice(0, 15).map((event, i) => (
          <div key={i} className="relative flex gap-3 pb-4 pl-6 last:pb-0">
            <div className={`absolute left-2 top-1.5 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-[#1a1a24] text-[8px] ${borderColor(event.type)}`}>
              {renderIcon(event.type)}
            </div>
            {i < events.length - 1 && <div className="absolute bottom-0 left-2 top-4 w-px -translate-x-1/2 bg-gray-800" />}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">{event.title}</p>
              <p className="text-xs text-gray-500">{event.description}</p>
              <p className="mt-0.5 text-[10px] text-gray-600">{event.date.toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
