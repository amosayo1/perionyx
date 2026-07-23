export interface BasicAuthConfig {
  username: string;
  password: string;
}

export function buildAuthHeader(config: BasicAuthConfig): Record<string, string> {
  const encoded = btoa(`${config.username}:${config.password}`);
  return {
    Authorization: `Basic ${encoded}`,
  };
}

export function decodeAuthHeader(header: string): { username: string; password: string } | null {
  const match = header.match(/^Basic\s+(.+)$/i);
  if (!match) return null;
  try {
    const decoded = atob(match[1]);
    const colonIndex = decoded.indexOf(":");
    if (colonIndex === -1) return null;
    return {
      username: decoded.slice(0, colonIndex),
      password: decoded.slice(colonIndex + 1),
    };
  } catch {
    return null;
  }
}
