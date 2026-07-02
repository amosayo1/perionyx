import type { ReactNode } from "react";

interface Props {
  left: ReactNode;
  right: ReactNode;
}

export function OperationsGrid({ left, right }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">{left}</div>
      <div className="space-y-6">{right}</div>
    </div>
  );
}
