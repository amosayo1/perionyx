import { forwardRef, type HTMLAttributes } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./button";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: ButtonProps;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)} {...props}>
      <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-[var(--surface-tertiary)] flex items-center justify-center mb-4">
        {icon || <Inbox className="h-6 w-6 text-[var(--text-tertiary)]" />}
      </div>
      <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      {description && <p className="text-[13px] text-[var(--text-tertiary)] max-w-sm">{description}</p>}
      {action && (
        <div className="mt-4">
          <Button {...action} />
        </div>
      )}
    </div>
  )
);
EmptyState.displayName = "EmptyState";
