"use client";

import type { ReactNode } from "react";
import { EmptyState as UIEmptyState } from "@/components/ui/empty-state";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {icon}
      <UIEmptyState title={title} description={description} />
      {action}
    </div>
  );
}
