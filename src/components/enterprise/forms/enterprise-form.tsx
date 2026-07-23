"use client";

import { useState, useCallback, useRef, useEffect, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FormStatus, FieldError, AutoSaveState } from "./types";
import { AutoSaveIndicator } from "./auto-save-indicator";
import { UnsavedChangesGuard } from "./unsaved-changes-guard";
import { ValidationSummary } from "./validation-summary";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/enterprise/motion/animated-button";
import { Loader2, Save } from "lucide-react";

interface EnterpriseFormProps {
  children: ReactNode;
  onSubmit?: (e: FormEvent) => void | Promise<void>;
  onSave?: () => Promise<boolean>;
  autoSave?: boolean;
  autoSaveDelay?: number;
  initialErrors?: FieldError[];
  validate?: () => FieldError[];
  className?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  submitIcon?: ReactNode;
  disableSubmit?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  compact?: boolean;
}

export function EnterpriseForm({
  children,
  onSubmit,
  onSave,
  autoSave = false,
  autoSaveDelay = 2000,
  initialErrors,
  validate,
  className,
  title,
  description,
  submitLabel = "Save",
  submitIcon,
  disableSubmit,
  cancelLabel,
  onCancel,
  compact,
}: EnterpriseFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [errors, setErrors] = useState<FieldError[]>(initialErrors || []);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);

  const markDirty = useCallback(() => {
    setHasUnsaved(true);
    setStatus("unsaved");

    if (autoSave && onSave) {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(async () => {
        setStatus("saving");
        const ok = await onSave();
        if (ok) {
          setStatus("saved");
          setLastSaved(new Date());
          setHasUnsaved(false);
        } else {
          setStatus("error");
        }
      }, autoSaveDelay);
    }
  }, [autoSave, autoSaveDelay, onSave]);

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (validate) {
      const validationErrors = validate();
      setErrors(validationErrors);
      if (validationErrors.length > 0) {
        const firstError = formRef.current?.querySelector(`[data-field="${validationErrors[0].field}"]`);
        (firstError as HTMLElement)?.focus();
        return;
      }
    }

    setSaving(true);
    setStatus("saving");
    try {
      if (onSubmit) {
        await onSubmit(e);
      } else if (onSave) {
        const ok = await onSave();
        if (!ok) {
          setStatus("error");
          setSaving(false);
          return;
        }
      }
      setStatus("saved");
      setLastSaved(new Date());
      setHasUnsaved(false);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = async () => {
    setStatus("saving");
    if (onSave) {
      const ok = await onSave();
      if (ok) {
        setStatus("saved");
        setLastSaved(new Date());
        setHasUnsaved(false);
      } else {
        setStatus("error");
      }
    }
  };

  const handleDiscard = () => {
    setHasUnsaved(false);
    setStatus("idle");
    setErrors([]);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn(
        "space-y-6",
        compact && "space-y-4",
        className,
      )}
      onChange={markDirty}
      noValidate
    >
      {(title || description || status !== "idle") && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
          </div>
          <AutoSaveIndicator status={status} lastSaved={lastSaved} onRetry={handleRetry} />
        </div>
      )}

      <UnsavedChangesGuard
        hasUnsaved={hasUnsaved}
        onSave={onSave ? handleRetry : undefined}
        onDiscard={handleDiscard}
      />

      <ValidationSummary errors={errors} onFieldFocus={(field) => {
        const el = formRef.current?.querySelector(`[data-field="${field}"]`);
        (el as HTMLElement)?.focus();
      }} />

      {children}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
        {cancelLabel && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            {cancelLabel}
          </Button>
        )}
        <AnimatedButton
          type="submit"
          disabled={disableSubmit || saving}
          variant="primary"
          status={saving ? "loading" : "idle"}
          className="gap-2"
        >
          {submitIcon || <Save className="h-4 w-4" />}
          {saving ? "Saving..." : submitLabel}
        </AnimatedButton>
      </div>
    </form>
  );
}
