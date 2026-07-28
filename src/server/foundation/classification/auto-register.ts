/**
 * Enterprise Data Classification Platform — Auto-Registration
 *
 * Phase 24.0 | Constitutional Law 13: Data Classification Governs Handling
 *
 * Auto-registers all Prisma models into the ClassificationRegistry based on
 * field naming conventions and database column types. This ensures every
 * persisted entity has a classification without manual registration.
 */

import type { PrismaClient } from "@prisma/client";
import { ClassificationRegistry } from "./registry";
import { DataClassification, CLASSIFICATION_SENSITIVITY } from "./types";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "classification-auto-register" });

// ── Field Classification Rules ───────────────────────────────────────────────
// Rules are evaluated top-to-bottom. First match wins.

interface FieldRule {
  pattern: RegExp;
  classification: DataClassification;
}

const FIELD_RULES: FieldRule[] = [
  // Secrets / credentials — highest priority, never default
  { pattern: /password|secret|token|key|credential|mfa/i, classification: DataClassification.SECRETS },

  // Personally identifiable information
  { pattern: /email|phone|name|address|ssn|tax[_-]?id|birth|first[_-]?name|last[_-]?name|fullName/i, classification: DataClassification.PII },

  // Financial data — monetary values, balances, transactions
  { pattern: /amount|balance|price|total|cost|fee|rate|currency|payment|debit|credit|revenue|tax|discount|surcharge/i, classification: DataClassification.FINANCIAL },

  // Tenant and ownership identifiers
  { pattern: /companyId|tenantId|organizationId/i, classification: DataClassification.CONFIDENTIAL },

  // User and audit trail identifiers
  { pattern: /createdBy|updatedBy|deletedBy|userId|user[_-]?id|authorId/i, classification: DataClassification.INTERNAL },

  // Request metadata
  { pattern: /ipAddress|userAgent|correlationId|traceId|requestId|sessionId/i, classification: DataClassification.INTERNAL },
];

// ── Type-Based Classification ────────────────────────────────────────────────
// Applied when no field-name rule matches.

const TYPE_MAP: Record<string, DataClassification> = {
  datetime: DataClassification.INTERNAL,
  timestamp: DataClassification.INTERNAL,
  "timestamp with time zone": DataClassification.INTERNAL,
  "timestamp without time zone": DataClassification.INTERNAL,
  date: DataClassification.INTERNAL,
  time: DataClassification.INTERNAL,
  boolean: DataClassification.INTERNAL,
  enum: DataClassification.INTERNAL,
  json: DataClassification.INTERNAL,
  jsonb: DataClassification.INTERNAL,
  uuid: DataClassification.INTERNAL,
  integer: DataClassification.INTERNAL,
  bigint: DataClassification.INTERNAL,
  smallint: DataClassification.INTERNAL,
  decimal: DataClassification.INTERNAL,
  "double precision": DataClassification.INTERNAL,
  real: DataClassification.INTERNAL,
  serial: DataClassification.INTERNAL,
  bigserial: DataClassification.INTERNAL,
  text: DataClassification.INTERNAL,
  varchar: DataClassification.INTERNAL,
  character: DataClassification.INTERNAL,
  "character varying": DataClassification.INTERNAL,
  "text[]": DataClassification.INTERNAL,
  bytea: DataClassification.INTERNAL,
};

// ── Column Metadata ──────────────────────────────────────────────────────────

interface ColumnInfo {
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: string;
}

// ── Classification Logic ─────────────────────────────────────────────────────

/**
 * Determine the classification for a field based on its name and database type.
 */
function classifyField(fieldName: string, dataType: string): DataClassification {
  for (const rule of FIELD_RULES) {
    if (rule.pattern.test(fieldName)) {
      return rule.classification;
    }
  }

  const normalizedType = dataType.toLowerCase();
  const mapped = TYPE_MAP[normalizedType];
  if (mapped) return mapped;

  return DataClassification.INTERNAL;
}

// ── Prisma Schema Introspection ──────────────────────────────────────────────

/**
 * Query information_schema for all user tables and columns.
 * Returns null if the database does not support information_schema (e.g. SQLite).
 */
async function introspectSchema(prisma: PrismaClient): Promise<ColumnInfo[] | null> {
  try {
    const rows = await prisma.$queryRaw<ColumnInfo[]>`
      SELECT
        t.table_name   AS "tableName",
        c.column_name  AS "columnName",
        c.data_type    AS "dataType",
        c.is_nullable   AS "isNullable"
      FROM information_schema.tables t
      JOIN information_schema.columns c
        ON c.table_schema = t.table_schema
        AND c.table_name  = t.table_name
      WHERE t.table_schema = 'public'
        AND t.table_type   = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position
    `;
    return rows;
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface AutoClassifyResult {
  entitiesRegistered: number;
  fieldsRegistered: number;
}

/**
 * Auto-register all Prisma models into the ClassificationRegistry.
 *
 * Introspects the database schema via information_schema and classifies
 * every table and column using naming-convention heuristics. This provides
 * a baseline classification that can be overridden manually for edge cases.
 *
 * @param prisma  - Active PrismaClient instance (PostgreSQL required).
 * @param registry - Target ClassificationRegistry (defaults to singleton).
 * @returns Counts of entities and fields registered.
 */
export async function autoClassifyPrismaModels(
  prisma: PrismaClient,
  registry?: ClassificationRegistry,
): Promise<AutoClassifyResult> {
  const reg = registry ?? ClassificationRegistry.getInstance();

  const columns = await introspectSchema(prisma);
  if (!columns) {
    log.warn("information_schema unavailable — skipping auto-classification (SQLite?)");
    return { entitiesRegistered: 0, fieldsRegistered: 0 };
  }

  const tables = new Map<string, ColumnInfo[]>();
  for (const col of columns) {
    const existing = tables.get(col.tableName);
    if (existing) {
      existing.push(col);
    } else {
      tables.set(col.tableName, [col]);
    }
  }

  let entitiesRegistered = 0;
  let fieldsRegistered = 0;

  for (const [tableName, cols] of tables) {
    const fieldOverrides: Record<string, DataClassification> = {};
    let maxSensitivity = 0;
    const classifications = new Map<string, DataClassification>();

    for (const col of cols) {
      const classification = classifyField(col.columnName, col.dataType);
      classifications.set(col.columnName, classification);

      const sensitivity = CLASSIFICATION_SENSITIVITY[classification];
      if (sensitivity > maxSensitivity) maxSensitivity = sensitivity;

      if (classification !== DataClassification.INTERNAL) {
        fieldOverrides[col.columnName] = classification;
      }
    }

    const entityClassification = SENSITIVITY_TO_CLASSIFICATION[maxSensitivity] ?? DataClassification.INTERNAL;
    reg.registerEntity(tableName, entityClassification, Object.keys(fieldOverrides).length > 0 ? fieldOverrides : undefined);
    entitiesRegistered++;

    for (const [colName, classification] of classifications) {
      reg.registerField(tableName, colName, classification);
      fieldsRegistered++;
    }
  }

  return { entitiesRegistered, fieldsRegistered };
}

// ── Sensitivity → Classification Reverse Map ─────────────────────────────────

const SENSITIVITY_TO_CLASSIFICATION: Record<number, DataClassification> = Object.entries(CLASSIFICATION_SENSITIVITY).reduce(
  (acc, [cls, score]) => {
    // Keep the first (least restrictive) classification for each score
    if (!(score in acc)) {
      acc[score] = cls as DataClassification;
    }
    return acc;
  },
  {} as Record<number, DataClassification>,
);
