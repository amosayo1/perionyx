import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-spin rounded-full border-2 border-[var(--surface-tertiary)] border-t-[var(--color-gold)]", sizes[size], className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
);
Spinner.displayName = "Spinner";
