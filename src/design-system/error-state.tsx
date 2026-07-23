"use client";
import { forwardRef, type HTMLAttributes } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  error?: Error | string;
  reset?: () => void;
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title = "Something went wrong", description, error, reset, className, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)} {...props}>
      <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-[var(--color-danger-muted)] flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-[var(--color-danger)]" />
      </div>
      <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--text-tertiary)] max-w-sm">
        {description || (error ? (typeof error === "string" ? error : error.message) : "An unexpected error occurred.")}
      </p>
      {reset && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={reset}>Try Again</Button>
        </div>
      )}
    </div>
  )
);
ErrorState.displayName = "ErrorState";
