import { timingSafeEqual } from "crypto";

export function encode(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return Buffer.from(credentials, "utf-8").toString("base64");
}

export function decode(header: string): { username: string; password: string } | null {
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "basic") {
    return null;
  }

  try {
    const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
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

export function validate(
  header: string,
  expectedUsername: string,
  expectedPassword: string,
): boolean {
  const credentials = decode(header);
  if (!credentials) return false;

  const expected = `${expectedUsername}:${expectedPassword}`;
  const actual = `${credentials.username}:${credentials.password}`;

  if (expected.length !== actual.length) return false;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  } catch {
    return false;
  }
}
