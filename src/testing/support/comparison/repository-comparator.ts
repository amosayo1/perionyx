import type { MockFactory } from "../types";

export class RepositoryComparator<T> {
  constructor(private readonly createMock: MockFactory<T>) {}

  compare(repoA: { findById: (id: string) => Promise<T | null> }, repoB: { findById: (id: string) => Promise<T | null> }) {
    return {
      findById: async (id: string) => {
        const [a, b] = await Promise.all([repoA.findById(id), repoB.findById(id)]);
        return { a, b, match: JSON.stringify(a) === JSON.stringify(b) };
      },
    };
  }

  async compareAll(
    repoA: { findAll: () => Promise<T[]> },
    repoB: { findAll: () => Promise<T[]> },
  ) {
    const [a, b] = await Promise.all([repoA.findAll(), repoB.findAll()]);
    return {
      a,
      b,
      match: a.length === b.length && a.every((item, i) => JSON.stringify(item) === JSON.stringify(b[i])),
    };
  }
}
