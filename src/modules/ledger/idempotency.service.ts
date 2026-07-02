/** Prevents duplicate transaction processing via idempotency keys. */

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ValidationError, ConflictError } from "@/lib/errors/app-error";
import crypto from "crypto";

export interface IdempotencyRecord {
  id: string;
  companyId: string;
  idempotencyKey: string;
  requestHash: string;
  method: string;
  path: string;
  statusCode: number;
  responseBody: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

export class IdempotencyService {
  /**
   * TTL for idempotency records (24 hours).
   * After this, the same key can be reused.
   */
  private static readonly RECORD_TTL_MS = 24 * 60 * 60 * 1000;

  /**
   * Generate request hash for integrity verification.
   * Prevents replaying with different request bodies.
   */
  static hashRequest(method: string, path: string, body?: Record<string, any>): string {
    const content = JSON.stringify({
      method,
      path,
      body: body || {},
    });

    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Generate idempotency key from request.
   * Used when client doesn't provide one.
   */
  static generateKey(
    companyId: string,
    method: string,
    path: string,
    body?: Record<string, any>
  ): string {
    const content = JSON.stringify({
      companyId,
      method,
      path,
      body: body || {},
      timestamp: Math.floor(Date.now() / 1000),
    });

    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Check if request has been processed before.
   * 
   * Returns:
   * - null if never seen
   * - cached response if seen and still valid
   * - throws if seen with different request body
   */
  static async getIfProcessed(
    companyId: string,
    idempotencyKey: string,
    method: string,
    path: string,
    requestHash: string
  ): Promise<{ statusCode: number; body: Record<string, any> } | null> {
    const record = await prisma.idempotencyRecord.findFirst({
      where: {
        companyId,
        idempotencyKey,
      },
    });

    if (!record) {
      return null;
    }

    // Check if still within TTL
    if (new Date() > record.expiresAt) {
      // Expired — can be reused
      return null;
    }

    // Verify request hash matches
    if (record.requestHash !== requestHash) {
      throw new ConflictError(
        `Idempotency key ${idempotencyKey} was used with different request parameters`
      );
    }

    // Return cached response
    return {
      statusCode: record.statusCode,
      body: (record.responseBody as any) || {},
    };
  }

  /**
   * Record successful operation.
   * 
   * Call this after operation completes successfully.
   */
  static async recordSuccess(
    companyId: string,
    idempotencyKey: string,
    method: string,
    path: string,
    requestHash: string,
    statusCode: number,
    responseBody: Record<string, any>
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + this.RECORD_TTL_MS);

    // Upsert to handle race conditions
    await prisma.idempotencyRecord.upsert({
      where: {
        companyId_idempotencyKey: {
          companyId,
          idempotencyKey,
        },
      },
      create: {
        companyId,
        idempotencyKey,
        requestHash,
        method,
        path,
        statusCode,
        responseBody,
        expiresAt,
      },
      update: {
        statusCode,
        responseBody,
        expiresAt,
      },
    });
  }

  /**
   * Record failed operation.
   * 
   * Prevents immediate retry without changing request.
   * After TTL expires, operation can be retried with same key.
   */
  static async recordFailure(
    companyId: string,
    idempotencyKey: string,
    method: string,
    path: string,
    requestHash: string,
    statusCode: number,
    errorMessage: string
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + this.RECORD_TTL_MS);

    const responseBody = {
      error: {
        code: "IDEMPOTENT_OPERATION_FAILED",
        message: errorMessage,
      },
    };

    await prisma.idempotencyRecord.upsert({
      where: {
        companyId_idempotencyKey: {
          companyId,
          idempotencyKey,
        },
      },
      create: {
        companyId,
        idempotencyKey,
        requestHash,
        method,
        path,
        statusCode,
        responseBody,
        expiresAt,
      },
      update: {
        statusCode,
        responseBody,
        expiresAt,
      },
    });
  }

  /**
   * Cleanup expired records.
   * Run periodically (e.g., via cron job).
   */
  static async cleanupExpired(): Promise<number> {
    const result = await prisma.idempotencyRecord.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Get statistics on idempotency records.
   */
  static async getStats(companyId?: string) {
    const where = companyId ? { companyId } : {};

    const total = await prisma.idempotencyRecord.count({ where });
    const expired = await prisma.idempotencyRecord.count({
      where: {
        ...where,
        expiresAt: { lt: new Date() },
      },
    });
    const active = total - expired;

    return {
      total,
      active,
      expired,
    };
  }
}

/**
 * Middleware/utility for wrapping API handlers with idempotency.
 */
export interface IdempotentRequestContext {
  companyId: string;
  idempotencyKey?: string;
  method: string;
  path: string;
  body?: Record<string, any>;
}

export async function executeIdempotently<T extends Record<string, any>>(
  context: IdempotentRequestContext,
  operation: () => Promise<T>
): Promise<T> {
  const { companyId, method, path, body } = context;

  // Generate key if not provided
  const idempotencyKey = context.idempotencyKey || IdempotencyService.generateKey(companyId, method, path, body);

  // Hash request for integrity
  const requestHash = IdempotencyService.hashRequest(method, path, body);

  // Check if already processed
  const cached = await IdempotencyService.getIfProcessed(
    companyId,
    idempotencyKey,
    method,
    path,
    requestHash
  );

  if (cached) {
    // Return cached response
    return cached.body as T;
  }

  // Execute operation
  try {
    const result = await operation();

    // Record success
    await IdempotencyService.recordSuccess(
      companyId,
      idempotencyKey,
      method,
      path,
      requestHash,
      200,
      result
    );

    return result;
  } catch (error) {
    // Record failure
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await IdempotencyService.recordFailure(
      companyId,
      idempotencyKey,
      method,
      path,
      requestHash,
      error instanceof Error && "statusCode" in error ? (error.statusCode as number) : 500,
      errorMessage
    );

    throw error;
  }
}
