import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function InsightsLayout({ children }: Props) {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {children}
    </div>
  );
}
