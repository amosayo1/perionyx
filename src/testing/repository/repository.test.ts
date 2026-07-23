import { describe, it, expect } from "vitest";

describe("Repository Tests", () => {
  interface Repository<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(data: T): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
  }

  const createMockRepo = <T>(): Repository<T> => {
    const store = new Map<string, T>();
    return {
      findById: async (id: string) => store.get(id) ?? null,
      findAll: async () => [...store.values()],
      create: async (data: T) => {
        const id = (data as any).id ?? `item_${Date.now()}`;
        store.set(id, data);
        return data;
      },
      update: async (id: string, data: Partial<T>) => {
        const existing = store.get(id);
        if (!existing) throw new Error("Not found");
        const updated = { ...existing, ...data };
        store.set(id, updated);
        return updated;
      },
      delete: async (id: string) => store.delete(id),
    };
  };

  it("should create and find by id", async () => {
    const repo = createMockRepo<{ id: string; name: string }>();
    const item = { id: "1", name: "test" };
    await repo.create(item);
    const found = await repo.findById("1");
    expect(found).toEqual(item);
  });

  it("should return null for missing items", async () => {
    const repo = createMockRepo<{ id: string }>();
    const found = await repo.findById("nonexistent");
    expect(found).toBeNull();
  });

  it("should update existing items", async () => {
    const repo = createMockRepo<{ id: string; value: number }>();
    await repo.create({ id: "1", value: 10 });
    const updated = await repo.update("1", { value: 20 });
    expect(updated.value).toBe(20);
  });

  it("should delete items", async () => {
    const repo = createMockRepo<{ id: string }>();
    await repo.create({ id: "1" });
    const deleted = await repo.delete("1");
    expect(deleted).toBe(true);
    const found = await repo.findById("1");
    expect(found).toBeNull();
  });

  it("should return all items", async () => {
    const repo = createMockRepo<{ id: string }>();
    await repo.create({ id: "1" });
    await repo.create({ id: "2" });
    const all = await repo.findAll();
    expect(all).toHaveLength(2);
  });
});
