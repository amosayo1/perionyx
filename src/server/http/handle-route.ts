import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode },
    );
  }
  logger.error(error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Internal server error" } },
    { status: 500 },
  );
}

export function zodErrorResponse(error: z.ZodError) {
  const message = error.issues
    .map((issue) => issue.message)
    .filter(Boolean)
    .join("; ");
  return NextResponse.json(
    { error: { code: "VALIDATION", message: message || "Validation failed", issues: error.issues } },
    { status: 400 },
  );
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError("Invalid JSON body", "INVALID_JSON", 400);
  }
}
