export type Environment = "development" | "staging" | "production" | "test";

export interface EnvironmentConfig {
  nodeEnv: Environment;
  appUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

export class EnvironmentValidator {
  validate(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const nodeEnv = process.env.NODE_ENV;

    if (!nodeEnv || !["development", "staging", "production", "test"].includes(nodeEnv)) {
      issues.push("NODE_ENV must be one of: development, staging, production, test");
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      issues.push("NEXT_PUBLIC_APP_URL is required");
    }

    if (process.env.NODE_ENV === "production") {
      if (process.env.NEXT_PUBLIC_APP_URL?.startsWith("http://")) {
        issues.push("Production APP_URL must use HTTPS");
      }
      if (process.env.JWT_SECRET === "test-jwt-secret-for-testing-only") {
        issues.push("Production JWT_SECRET must not use default test secret");
      }
    }

    return { valid: issues.length === 0, issues };
  }

  getConfig(): EnvironmentConfig {
    const nodeEnv = (process.env.NODE_ENV || "development") as Environment;
    return {
      nodeEnv,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      isProduction: nodeEnv === "production",
      isDevelopment: nodeEnv === "development",
      isTest: nodeEnv === "test",
    };
  }
}

export const environmentValidator = new EnvironmentValidator();
