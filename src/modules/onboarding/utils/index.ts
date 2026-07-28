export function calculatePercentComplete(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function getStatusOrder(status: string): number {
  const order: Record<string, number> = {
    COMPLETED: 0,
    SKIPPED: 1,
    IN_PROGRESS: 2,
    FAILED: 3,
    PENDING: 4,
    NOT_STARTED: 5,
  };
  return order[status] ?? 99;
}

export function getStepCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    core: "text-gold border-gold/20 bg-gold/10",
    integration: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    governance: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    automation: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    analytics: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
  };
  return colors[category] ?? "text-zinc-400 border-zinc-500/20 bg-zinc-500/10";
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}
