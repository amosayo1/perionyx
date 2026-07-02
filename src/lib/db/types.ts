import type { PrismaClient } from "@prisma/client";

// Accept either a full PrismaClient or a transaction client.
// Transaction clients share the PrismaClient interface for queries.
export type DbClient = PrismaClient;
