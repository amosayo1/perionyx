import type { ReactNode } from "react";

export function RiskLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl space-y-8">{children}</div>;
}
