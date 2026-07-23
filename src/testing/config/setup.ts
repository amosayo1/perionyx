import "vitest";

beforeAll(() => {
  (process.env as Record<string, string>).NODE_ENV = "test";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.REDIS_HOST = "localhost";
  process.env.REDIS_PORT = "6379";
  process.env.JWT_SECRET = "test-jwt-secret-for-testing-only";
  process.env.ENCRYPTION_KEY = "test-encryption-key-32-chars-long!!";
});
