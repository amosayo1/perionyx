export class DataBuilder<T> {
  private data: Partial<T> = {};

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }

  withMany(partial: Partial<T>): this {
    Object.assign(this.data, partial);
    return this;
  }

  build(defaults: T): T {
    return { ...defaults, ...this.data } as T;
  }

  buildList(defaults: T, count: number): T[] {
    return Array.from({ length: count }, () => ({ ...defaults, ...this.data } as T));
  }

  reset(): this {
    this.data = {};
    return this;
  }
}
