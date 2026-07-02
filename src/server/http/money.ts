import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors/app-error";

export function parsePositiveDecimalString(value: string, fieldName: string): Prisma.Decimal {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError(`${fieldName} is required`, "VALIDATION", 400);
  }
  let d: Prisma.Decimal;
  try {
    d = new Prisma.Decimal(trimmed);
  } catch {
    throw new AppError(`${fieldName} must be a valid decimal`, "VALIDATION", 400);
  }
  if (!d.gt(0)) {
    throw new AppError(`${fieldName} must be greater than zero`, "VALIDATION", 400);
  }
  return d;
}

export function decimalToString(d: { toString(): string }): string {
  return d.toString();
}
