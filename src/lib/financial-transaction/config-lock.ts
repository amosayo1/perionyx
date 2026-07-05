import { ConflictError, NotFoundError } from "@/lib/errors/app-error";

export async function updateConfigWithVersion<T extends { id: string; version: number }>(
  delegate: {
    updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
    findUnique: (args: { where: { id: string } }) => Promise<T | null>;
  },
  id: string,
  expectedVersion: number,
  data: Record<string, unknown>,
  resourceName = "Resource",
): Promise<T> {
  const result = await delegate.updateMany({
    where: { id, version: expectedVersion },
    data: { ...data, version: { increment: 1 } },
  });

  if (result.count === 0) {
    const existing = await delegate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(resourceName);
    throw new ConflictError(
      `Concurrent modification detected — ${resourceName} was updated by another request. Reload and try again.`,
    );
  }

  return delegate.findUnique({ where: { id } }) as Promise<T>;
}
