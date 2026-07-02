import { backgroundJobs } from "./data";
import { JobCard } from "./job-card";

export function BackgroundJobs() {
  const sorted = [...backgroundJobs].sort((a, b) => {
    const order = { running: 0, queued: 1, failed: 2, completed: 3 };
    return (order[a.status] ?? 0) - (order[b.status] ?? 0);
  });

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Background Jobs</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Status of scheduled and asynchronous processing jobs</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
