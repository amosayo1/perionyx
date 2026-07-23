import { SystemTabs } from "./system-tabs";

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-zinc-900/60">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-8">
          <div className="mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">System</h1>
            <p className="text-sm text-zinc-500">Performance monitoring and health status</p>
          </div>
          <SystemTabs />
        </div>
      </div>
      {children}
    </div>
  );
}
