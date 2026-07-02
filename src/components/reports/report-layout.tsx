import type { ReactNode } from "react";

export function ReportLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl space-y-8">{children}</div>;
}
