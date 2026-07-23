export interface MutualTlsConfig {
  cert: string;
  key: string;
  ca?: string;
  passphrase?: string;
  rejectUnauthorized?: boolean;
}

export function getTlsOptions(config: MutualTlsConfig): Record<string, unknown> {
  return {
    cert: config.cert,
    key: config.key,
    ca: config.ca,
    passphrase: config.passphrase,
    rejectUnauthorized: config.rejectUnauthorized ?? true,
  };
}

export function isMutualTlsConfigured(config: MutualTlsConfig): boolean {
  return Boolean(config.cert && config.key);
}
