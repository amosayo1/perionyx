import { NextResponse } from "next/server";
import type { AppError } from "@/lib/errors/app-error";

export interface APErrorBody {
  error: {
    code: string;
    message: string;
    category: string;
    correlationId: string;
    recoverability: string;
    userMessage: string;
    details?: Record<string, unknown>;
  };
}

const ERROR_CATEGORIES: Record<string, { category: string; recoverability: string }> = {
  VALIDATION: { category: "CLIENT_ERROR", recoverability: "FIX_INPUT" },
  NOT_FOUND: { category: "CLIENT_ERROR", recoverability: "CHECK_RESOURCE" },
  CONFLICT: { category: "BUSINESS_RULE", recoverability: "CHECK_STATE" },
  UNAUTHORIZED: { category: "AUTHENTICATION", recoverability: "REAUTHENTICATE" },
  FORBIDDEN: { category: "AUTHORIZATION", recoverability: "CONTACT_ADMIN" },
  IDEMPOTENT_REPLAY: { category: "IDEMPOTENCY", recoverability: "SAFE_REPLAY" },
  CONCURRENCY: { category: "CONCURRENCY", recoverability: "RETRY" },
  PAYLOAD_TOO_LARGE: { category: "CLIENT_ERROR", recoverability: "REDUCE_PAYLOAD" },
  INTERNAL: { category: "SYSTEM_ERROR", recoverability: "CONTACT_SUPPORT" },
  BUSINESS_RULE: { category: "BUSINESS_RULE", recoverability: "CHECK_STATE" },
  RATE_LIMITED: { category: "RATE_LIMIT", recoverability: "WAIT_RETRY" },
};

function getCategoryMeta(code: string): { category: string; recoverability: string } {
  if (ERROR_CATEGORIES[code]) return ERROR_CATEGORIES[code];
  if (code.startsWith("VALIDATION")) return ERROR_CATEGORIES.VALIDATION;
  if (code.startsWith("BUSINESS")) return ERROR_CATEGORIES.BUSINESS_RULE;
  return ERROR_CATEGORIES.INTERNAL;
}

export function apErrorResponse(
  error: AppError | Error,
  correlationId: string,
): NextResponse<APErrorBody> {
  const isAppError = "code" in error && "statusCode" in error;
  const code = isAppError ? (error as AppError).code : "INTERNAL";
  const message = isAppError ? error.message : "Internal server error";
  const statusCode = isAppError ? (error as AppError).statusCode : 500;
  const { category, recoverability } = getCategoryMeta(code);

  const body: APErrorBody = {
    error: {
      code,
      message,
      category,
      correlationId,
      recoverability,
      userMessage: sanitizeMessage(message, code),
    },
  };

  return NextResponse.json(body, {
    status: statusCode,
    headers: { "x-correlation-id": correlationId },
  });
}

export function apValidationError(
  issues: Array<{ path: string; message: string; code: string }>,
  correlationId: string,
): NextResponse<APErrorBody> {
  const body: APErrorBody = {
    error: {
      code: "VALIDATION_FAILED",
      message: `Request validation failed: ${issues.map((i) => `${i.path} ${i.message}`).join("; ")}`,
      category: "CLIENT_ERROR",
      correlationId,
      recoverability: "FIX_INPUT",
      userMessage: "Please check your request and try again.",
      details: { issues },
    },
  };

  return NextResponse.json(body, { status: 400, headers: { "x-correlation-id": correlationId } });
}

export function apConflictResponse(
  code: string,
  message: string,
  correlationId: string,
  details?: Record<string, unknown>,
): NextResponse<APErrorBody> {
  const body: APErrorBody = {
    error: {
      code,
      message,
      category: "BUSINESS_RULE",
      correlationId,
      recoverability: "CHECK_STATE",
      userMessage: sanitizeMessage(message, code),
      details,
    },
  };

  return NextResponse.json(body, { status: 409, headers: { "x-correlation-id": correlationId } });
}

export function apNotFoundResponse(
  resource: string,
  correlationId: string,
): NextResponse<APErrorBody> {
  const body: APErrorBody = {
    error: {
      code: "NOT_FOUND",
      message: `${resource} not found`,
      category: "CLIENT_ERROR",
      correlationId,
      recoverability: "CHECK_RESOURCE",
      userMessage: `The requested ${resource.toLowerCase()} does not exist or you do not have access.`,
    },
  };

  return NextResponse.json(body, { status: 404, headers: { "x-correlation-id": correlationId } });
}

function sanitizeMessage(message: string, code: string): string {
  const internalPatterns = /prisma|database|sql|query|stack|trace|internal|node_modules/i;
  if (internalPatterns.test(message) || code === "INTERNAL") {
    return "An unexpected error occurred. Please try again or contact support.";
  }
  return message;
}
