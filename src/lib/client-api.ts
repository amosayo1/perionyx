export function getErrorMessage(body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    const e = (body as { error?: { message?: string; issues?: { message: string }[] } }).error;
    if (e?.message) {
      return e.message;
    }
    if (e?.issues && Array.isArray(e.issues)) {
      return e.issues.map((i) => i.message).filter(Boolean).join("; ");
    }
  }
  return "Request failed";
}
