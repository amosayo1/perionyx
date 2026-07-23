export class InputValidator {
  sanitize(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  validateCurrencyCode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code);
  }

  validateAmount(amount: number): boolean {
    return Number.isFinite(amount) && amount >= 0;
  }

  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "");
  }

  truncate(value: string, maxLength: number): string {
    if (value.length <= maxLength) return value;
    return value.slice(0, maxLength) + "...";
  }

  sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = this.sanitize(value);
      } else if (typeof value === "object" && value !== null) {
        result[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }
}

export const inputValidator = new InputValidator();
