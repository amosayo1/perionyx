import { scheduledTasks } from "./data";
import { ScheduledTaskCard } from "./scheduled-task-card";

export function ScheduledTasks() {
  const sorted = [...scheduledTasks].sort((a, b) => {
    const order = { running: 0, queued: 1, failed: 2, completed: 3 };
    return (order[a.status] ?? 0) - (order[b.status] ?? 0);
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Scheduled Tasks</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Recurring jobs, cron schedules, and execution status</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((task) => (
          <ScheduledTaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
