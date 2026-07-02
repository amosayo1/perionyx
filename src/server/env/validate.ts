export function validateEnv(): { ok: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  const required = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "ENCRYPTION_KEY",
  ];

  const recommended = ["SENTRY_DSN", "NEXTAUTH_URL", "REDIS_URL"];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXTAUTH_URL) {
      warnings.push("NEXTAUTH_URL should be set in production for correct redirect URLs");
    }
    if (!process.env.SENTRY_DSN) {
      warnings.push("SENTRY_DSN is recommended in production for error monitoring");
    }
  }

  if (process.env.LOG_LEVEL && !["trace", "debug", "info", "warn", "error", "fatal"].includes(process.env.LOG_LEVEL)) {
    warnings.push(`LOG_LEVEL="${process.env.LOG_LEVEL}" is invalid; must be trace, debug, info, warn, error, or fatal`);
  }

  if (process.env.PLAID_ENV && !["sandbox", "development", "production"].includes(process.env.PLAID_ENV)) {
    warnings.push(`PLAID_ENV="${process.env.PLAID_ENV}" is invalid; must be sandbox, development, or production`);
  }

  if (process.env.SMTP_PORT && isNaN(Number(process.env.SMTP_PORT))) {
    warnings.push("SMTP_PORT must be a number");
  }

  if (!process.env.CRON_SECRET) {
    warnings.push("CRON_SECRET is recommended to protect the tick/cron endpoint");
  } else if (process.env.CRON_SECRET.length < 16) {
    warnings.push("CRON_SECRET should be at least 16 characters");
  }

  if (!process.env.REDIS_URL) {
    warnings.push("REDIS_URL is recommended for distributed rate limiting and caching");
  }

  if (process.env.VAULT_ADDR && !process.env.VAULT_TOKEN) {
    warnings.push("VAULT_ADDR is set but VAULT_TOKEN is missing — Vault secret store will not work");
  }

  return { ok: missing.length === 0, missing, warnings };
}
