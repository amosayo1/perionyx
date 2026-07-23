"use client";

import { memo, useId, cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { FieldStatus } from "./types";
import { FieldHelp } from "./field-help";
import { FieldHint } from "./field-hint";

interface EnterpriseFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  helpText?: string;
  hint?: string;
  hintType?: "example" | "best-practice" | "regulatory" | "tip";
  error?: string;
  warning?: string;
  status?: FieldStatus;
  children: React.ReactNode;
  className?: string;
  layout?: "vertical" | "horizontal";
  description?: string;
}

export const EnterpriseField = memo(function EnterpriseField({
  label,
  htmlFor,
  required,
  optional,
  helpText,
  hint,
  hintType = "tip",
  error,
  warning,
  status,
  children,
  className,
  layout = "vertical",
  description,
}: EnterpriseFieldProps) {
  const labelId = useId();
  const feedbackId = useId();

  const describedBy = error || warning ? feedbackId : undefined;

  const childrenWithAria = describedBy
    ? <ChildrenWithAriaDescribedby describedBy={describedBy}>{children}</ChildrenWithAriaDescribedby>
    : children;

  return (
    <div
      className={cn(
        layout === "horizontal"
          ? "flex items-start gap-4"
          : "space-y-1.5",
        className,
      )}
      role="group"
      aria-labelledby={labelId}
    >
      <div className={cn(layout === "horizontal" ? "w-1/3 pt-1 shrink-0" : "")}>
        <div className="flex items-center gap-2">
          <label
            id={labelId}
            htmlFor={htmlFor}
            className={cn(
              "text-xs font-medium",
              error ? "text-red-400" : "text-zinc-300",
            )}
          >
            {label}
            {required && <span className="ml-0.5 text-red-400" aria-label="required">*</span>}
          </label>
          {optional && (
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">Optional</span>
          )}
          {status === "valid" && (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-[10px] text-zinc-500">{description}</p>
        )}
      </div>
      <div className={cn("flex-1", layout === "horizontal" ? "" : "space-y-1.5")}>
        {childrenWithAria}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              id={feedbackId}
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1 text-[11px] text-red-400"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              {error}
            </motion.p>
          )}
          {warning && !error && (
            <motion.p
              key="warning"
              id={feedbackId}
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1 text-[11px] text-amber-400"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              {warning}
            </motion.p>
          )}
        </AnimatePresence>
        {helpText && <FieldHelp>{helpText}</FieldHelp>}
        {hint && <FieldHint type={hintType}>{hint}</FieldHint>}
      </div>
    </div>
  );
});

function ChildrenWithAriaDescribedby({
  children,
  describedBy,
}: {
  children: ReactNode;
  describedBy: string;
}) {
  return (
    <>
      {cloneOrWrap(children, describedBy)}
    </>
  );
}

function cloneOrWrap(child: ReactNode, describedBy: string): ReactNode {
  if (isValidElement(child)) {
    const existing = (child.props as Record<string, string>)["aria-describedby"];
    const merged = existing ? `${existing} ${describedBy}` : describedBy;
    return cloneElement(child, { "aria-describedby": merged } as Record<string, string>);
  }
  return child;
}
