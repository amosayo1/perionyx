import { prisma } from "@/server/db/prisma";
import { PrismaTreasuryRepository } from "./prisma-treasury-repository";

let initialized = false;

export function initializePrismaRepositories(): void {
  if (initialized) return;
  initialized = true;
  new PrismaTreasuryRepository(prisma);
}

export { PrismaTreasuryRepository };
