import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/testing/config/setup.ts"],
    globalSetup: "./src/testing/config/global-setup.ts",
    teardownTimeout: 30000,
    hookTimeout: 30000,
    testTimeout: 30000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: false,
        maxForks: 4,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/testing/**",
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/**/*.d.ts",
        "src/generated/**",
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
    reporters: ["default", "junit"],
    outputFile: {
      junit: "./coverage/junit-report.xml",
    },
    retry: 1,
    maxConcurrency: 8,
    sequence: {
      concurrent: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@testing": path.resolve(__dirname, "./src/testing"),
    },
  },
});
