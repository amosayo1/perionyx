export interface MockFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

export interface SeedFactory<T, R = T> {
  seed(data?: Partial<T>): Promise<R>;
  seedMany(count: number, data?: Partial<T>): Promise<R[]>;
}
