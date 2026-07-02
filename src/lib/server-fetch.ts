import { headers } from "next/headers";

export async function serverFetch(path: string, init?: RequestInit): Promise<Response> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...Object.fromEntries(new Headers(init?.headers ?? {}).entries()),
      cookie: h.get("cookie") ?? "",
    },
    cache: "no-store",
  });
}

export async function readJsonIfOk<T>(res: Response): Promise<T | null> {
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as T;
}
