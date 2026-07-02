import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
