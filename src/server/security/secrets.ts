export class SecretsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretsError";
  }
}

export class SecretsValidator {
  static readonly CRITICAL_SECRETS = [
    "JWT_SECRET",
    "ENCRYPTION_KEY",
    "ENCRYPTION_KEY_ID",
    "DATABASE_URL",
    "REDIS_URL",
    "AUTH_SECRET",
    "NEXT_PUBLIC_APP_URL",
  ];

  static readonly PRODUCTION_REQUIRED = [
    "JWT_SECRET",
    "ENCRYPTION_KEY",
    "ENCRYPTION_KEY_ID",
    "DATABASE_URL",
    "REDIS_URL",
    "AUTH_SECRET",
    "NEXT_PUBLIC_APP_URL",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SENTRY_DSN",
  ];

  private static readonly SECRET_PATTERNS: Record<string, RegExp> = {
    JWT_SECRET: /^.{32,}$/,
    ENCRYPTION_KEY: /^[a-fA-F0-9]{64}$/,
    DATABASE_URL: /^postgresql:\/\/.+/,
    REDIS_URL: /^redis(s)?:\/\/.+/,
    AUTH_SECRET: /^.{32,}$/,
  };

  validate(options?: {
    environment?: string;
    failOnMissing?: boolean;
  }): {
    valid: boolean;
    critical: string[];
    missing: string[];
    warnings: string[];
    errors: string[];
  } {
    const env = options?.environment ?? process.env.NODE_ENV ?? "development";
    const failOnMissing = options?.failOnMissing ?? env === "production";
    const missing: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    const critical: string[] = [];

    const required = env === "production"
      ? SecretsValidator.PRODUCTION_REQUIRED
      : SecretsValidator.CRITICAL_SECRETS;

    for (const secret of required) {
      const value = process.env[secret];
      if (!value) {
        missing.push(secret);
        if (SecretsValidator.CRITICAL_SECRETS.includes(secret)) {
          critical.push(secret);
        }
        continue;
      }

      const pattern = SecretsValidator.SECRET_PATTERNS[secret];
      if (pattern && !pattern.test(value)) {
        warnings.push(`${secret} does not match expected format`);
      }
    }

    if (env === "production") {
      if (process.env.ENCRYPTION_KEY === "test-encryption-key-32-chars-long!!" ||
          process.env.ENCRYPTION_KEY === "0000000000000000000000000000000000000000000000000000000000000000") {
        errors.push("ENCRYPTION_KEY is set to a known default value in production");
      }
      if (process.env.JWT_SECRET === "test-jwt-secret-for-testing-only") {
        errors.push("JWT_SECRET is set to a known test value in production");
      }
      if (process.env.NODE_ENV !== "production") {
        errors.push("NODE_ENV must be 'production' in production environment");
      }
    }

    if (failOnMissing && critical.length > 0) {
      throw new SecretsError(
        `Missing critical secrets: ${critical.join(", ")}. ` +
        `Application cannot start without these. See .env.example for required variables.`
      );
    }

    return {
      valid: missing.length === 0 && errors.length === 0,
      critical,
      missing,
      warnings,
      errors,
    };
  }

  static generateEncryptionKey(): string {
    const crypto = require("crypto");
    return crypto.randomBytes(32).toString("hex");
  }

  static generateJwtSecret(): string {
    const crypto = require("crypto");
    return crypto.randomBytes(64).toString("base64url");
  }

  static generateAuthSecret(): string {
    const crypto = require("crypto");
    return crypto.randomBytes(32).toString("base64url");
  }

  mask(value: string): string {
    if (value.length <= 8) return "****";
    return value.slice(0, 4) + "****" + value.slice(-4);
  }

  diagnose(): {
    nodeEnv: string;
    criticalPresent: string[];
    criticalMissing: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const nodeEnv = process.env.NODE_ENV ?? "not set";
    const criticalPresent: string[] = [];
    const criticalMissing: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    for (const secret of SecretsValidator.CRITICAL_SECRETS) {
      if (process.env[secret]) {
        criticalPresent.push(secret);
      } else {
        criticalMissing.push(secret);
      }
    }

    if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 64) {
      warnings.push("ENCRYPTION_KEY should be 64 hex characters (32 bytes)");
      recommendations.push("Run SecretsValidator.generateEncryptionKey() to generate a proper key");
    }
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      warnings.push("JWT_SECRET should be at least 32 characters");
    }
    if (!process.env.REDIS_URL) {
      recommendations.push("Set REDIS_URL for distributed rate limiting and caching");
    }
    if (nodeEnv === "production" && !process.env.SENTRY_DSN) {
      recommendations.push("Set SENTRY_DSN for error tracking in production");
    }
    if (nodeEnv === "production" && !process.env.SMTP_HOST) {
      recommendations.push("Set SMTP_* variables for email delivery in production");
    }

    return {
      nodeEnv,
      criticalPresent,
      criticalMissing,
      warnings,
      recommendations,
    };
  }
}

export const secretsValidator = new SecretsValidator();
