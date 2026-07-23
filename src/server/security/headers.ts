export interface SecurityHeaders {
  "Content-Security-Policy": string;
  "Strict-Transport-Security": string;
  "X-Content-Type-Options": string;
  "X-Frame-Options": string;
  "X-XSS-Protection": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
  "Cache-Control": string;
  "Cross-Origin-Opener-Policy": string;
  "Cross-Origin-Resource-Policy": string;
  "Cross-Origin-Embedder-Policy": string;
}

export class SecurityHeadersManager {
  private readonly cspPolicies: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", "https:", "wss:"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  getHeaders(env: "development" | "production" = "production"): SecurityHeaders {
    const isDev = env === "development";
    return {
      "Content-Security-Policy": this.buildCSP(isDev),
      "Strict-Transport-Security": this.getHSTS(isDev),
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Cache-Control": "no-store, max-age=0",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    };
  }

  private buildCSP(isDev: boolean): string {
    const policies = { ...this.cspPolicies };
    if (isDev) {
      policies["script-src"] = [...(policies["script-src"] ?? []), "'unsafe-eval'"];
    }
    return Object.entries(policies)
      .map(([key, values]) => `${key} ${values.join(" ")}`)
      .join("; ");
  }

  private getHSTS(isDev: boolean): string {
    if (isDev) return "max-age=31536000";
    return "max-age=31536000; includeSubDomains; preload";
  }

  addCspDirective(directive: string, value: string): void {
    if (!this.cspPolicies[directive]) {
      this.cspPolicies[directive] = [];
    }
    this.cspPolicies[directive].push(value);
  }
}

export const securityHeaders = new SecurityHeadersManager();
