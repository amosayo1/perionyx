export interface ValidationRule {
  field: string;
  type: "required" | "string" | "number" | "boolean" | "date" | "email" | "url" | "min" | "max" | "minLength" | "maxLength" | "pattern" | "enum" | "custom";
  value?: unknown;
  message?: string;
  validate?: (value: unknown) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  rule: string;
}

export function validate(data: Record<string, unknown>, rules: ValidationRule[]): ValidationResult {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const fieldValue = data[rule.field];

    switch (rule.type) {
      case "required":
        if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
          errors.push({ field: rule.field, message: rule.message ?? `${rule.field} is required`, rule: "required" });
        }
        break;

      case "string":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue !== "string") {
          errors.push({ field: rule.field, message: rule.message ?? `${rule.field} must be a string`, rule: "string" });
        }
        break;

      case "number":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue !== "number") {
          errors.push({ field: rule.field, message: rule.message ?? `${rule.field} must be a number`, rule: "number" });
        }
        break;

      case "boolean":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue !== "boolean") {
          errors.push({ field: rule.field, message: rule.message ?? `${rule.field} must be a boolean`, rule: "boolean" });
        }
        break;

      case "email":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(fieldValue)) {
            errors.push({ field: rule.field, message: rule.message ?? `${rule.field} is not a valid email`, rule: "email" });
          }
        }
        break;

      case "url":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue === "string") {
          try {
            new URL(fieldValue);
          } catch {
            errors.push({ field: rule.field, message: rule.message ?? `${rule.field} is not a valid URL`, rule: "url" });
          }
        }
        break;

      case "min":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue === "number") {
          if (fieldValue < (rule.value as number)) {
            errors.push({ field: rule.field, message: rule.message ?? `${rule.field} must be at least ${rule.value}`, rule: "min" });
          }
        }
        break;

      case "max":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue === "number") {
          if (fieldValue > (rule.value as number)) {
            errors.push({ field: rule.field, message: rule.message ?? `${rule.field} must be at most ${rule.value}`, rule: "max" });
          }
        }
        break;

      case "minLength":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue === "string") {
          if (fieldValue.length < (rule.value as number)) {
            errors.push({ field: rule.field, message: rule.message ?? `${rule.field} must be at least ${rule.value} characters`, rule: "minLength" });
          }
        }
        break;

      case "maxLength":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue === "string") {
          if (fieldValue.length > (rule.value as number)) {
            errors.push({ field: rule.field, message: rule.message ?? `${rule.field} must be at most ${rule.value} characters`, rule: "maxLength" });
          }
        }
        break;

      case "pattern":
        if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue === "string" && rule.value instanceof RegExp) {
          if (!rule.value.test(fieldValue)) {
            errors.push({ field: rule.field, message: rule.message ?? `${rule.field} does not match required pattern`, rule: "pattern" });
          }
        }
        break;

      case "enum":
        if (fieldValue !== undefined && fieldValue !== null && Array.isArray(rule.value)) {
          if (!rule.value.includes(fieldValue)) {
            errors.push({ field: rule.field, message: rule.message ?? `${rule.field} must be one of: ${rule.value.join(", ")}`, rule: "enum" });
          }
        }
        break;

      case "custom":
        if (rule.validate && !rule.validate(fieldValue)) {
          errors.push({ field: rule.field, message: rule.message ?? `${rule.field} failed custom validation`, rule: "custom" });
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateOrThrow(data: Record<string, unknown>, rules: ValidationRule[]): void {
  const result = validate(data, rules);
  if (!result.valid) {
    const messages = result.errors.map((e) => e.message).join("; ");
    throw new Error(`Validation failed: ${messages}`);
  }
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isIban(value: string): boolean {
  return /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(value.replace(/\s/g, "").toUpperCase());
}

export function isSwift(value: string): boolean {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value);
}
