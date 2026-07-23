import type { ReactNode } from "react";

export type FormStatus = "idle" | "saving" | "saved" | "error" | "unsaved";

export type FieldStatus = "idle" | "validating" | "valid" | "invalid" | "warning";

export interface FieldError {
  field: string;
  message: string;
  code?: string;
  hint?: string;
}

export interface FormSectionConfig {
  id: string;
  title: string;
  description?: string;
  initiallyExpanded?: boolean;
  collapsible?: boolean;
  optional?: boolean;
  advanced?: boolean;
  icon?: ReactNode;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: unknown, allValues: Record<string, unknown>) => string | null | undefined;
}

export interface SmartSelectOption {
  label: string;
  value: string;
  group?: string;
  description?: string;
  icon?: ReactNode;
}

export interface AutoSaveState {
  status: FormStatus;
  lastSaved?: Date;
  errorMessage?: string;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  optional?: boolean;
  validate?: () => boolean;
}
