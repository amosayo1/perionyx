const services = [
  { label: "API", status: "operational", color: "bg-[#d4af37]" },
  { label: "Database", status: "operational", color: "bg-[#d4af37]" },
  { label: "Ledger Sync", status: "operational", color: "bg-[#d4af37]" },
  { label: "Backup", status: "healthy", color: "bg-[#d4af37]" },
  { label: "Security", status: "active", color: "bg-[#d4af37]" },
];

export function SecurityStatusBadges() {
  return (
    <div className="flex flex-wrap gap-3">
      {services.map((s) => (
        <div
          key={s.label}
          className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-zinc-800/30 px-3 py-2"
        >
          <span className={`h-2 w-2 rounded-full ${s.color} shadow-[0_0_8px_rgba(212,175,55,0.3)]`} />
          <span className="text-xs font-medium text-white/80">{s.label}</span>
          <span className="text-[10px] font-medium text-[#d4af37] uppercase">{s.status}</span>
        </div>
      ))}
    </div>
  );
}
