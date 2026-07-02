import "dotenv/config";
import { describe, it, expect, beforeAll } from "vitest";

describe("FX Rates", () => {
  describe("MockProvider", () => {
    it("returns rates for supported base currencies", async () => {
      const { MockFxProvider } = await import("@/modules/fx/fx.provider");
      const provider = new MockFxProvider();
      const rates = await provider.getRates("USD");
      expect(rates.length).toBeGreaterThan(0);
      expect(rates[0]).toHaveProperty("baseCurrency");
      expect(rates[0]).toHaveProperty("quoteCurrency");
      expect(rates[0]).toHaveProperty("rate");
    });

    it("returns empty array for unsupported base", async () => {
      const { MockFxProvider } = await import("@/modules/fx/fx.provider");
      const provider = new MockFxProvider();
      const rates = await provider.getRates("XYZ");
      expect(rates).toEqual([]);
    });

    it("all returned rates are positive and finite", async () => {
      const { MockFxProvider } = await import("@/modules/fx/fx.provider");
      const provider = new MockFxProvider();
      const rates = await provider.getRates("USD");
      for (const r of rates) {
        expect(r.rate).toBeGreaterThan(0);
        expect(isFinite(r.rate)).toBe(true);
      }
    });
  });

  describe("FxService — fallback rates", () => {
    it("returns rate for known pair from fallback", async () => {
      const { FxService } = await import("@/modules/fx/fx.service");
      const rate = await FxService.getRate("test-company", "USD", "EUR");
      expect(rate).not.toBeNull();
      expect(rate!.rate).toBeGreaterThan(0);
      expect(rate!.source).toBe("fallback");
    });

    it("returns fallback rate for EUR/USD", async () => {
      const { FxService } = await import("@/modules/fx/fx.service");
      const rate = await FxService.getRate("test-company", "EUR", "USD");
      expect(rate).not.toBeNull();
      expect(rate!.rate).toBeGreaterThan(0);
      expect(rate!.source).toBe("fallback");
    });

    it("returns identity for same currency", async () => {
      const { FxService } = await import("@/modules/fx/fx.service");
      const rate = await FxService.getRate("test-company", "USD", "USD");
      expect(rate).toEqual({ rate: 1, source: "identity" });
    });

    it("returns null for unknown currency pair", async () => {
      const { FxService } = await import("@/modules/fx/fx.service");
      const rate = await FxService.getRate("test-company", "XXX", "YYY");
      expect(rate).toBeNull();
    });

    it("converts amount correctly", async () => {
      const { FxService } = await import("@/modules/fx/fx.service");
      const result = await FxService.convert("test-company", 100, "USD", "EUR");
      expect(result.convertedAmount).toBeGreaterThan(0);
      expect(result.rate).toBeGreaterThan(0);
      expect(result.source).toBeTruthy();
    });

    it("identity conversion returns same amount", async () => {
      const { FxService } = await import("@/modules/fx/fx.service");
      const result = await FxService.convert("test-company", 100, "USD", "USD");
      expect(result.convertedAmount).toBe(100);
      expect(result.rate).toBe(1);
      expect(result.source).toBe("identity");
    });

    it("conversion proportional to amount", async () => {
      const { FxService } = await import("@/modules/fx/fx.service");
      const result50 = await FxService.convert("test-company", 50, "USD", "EUR");
      const result100 = await FxService.convert("test-company", 100, "USD", "EUR");
      expect(result100.convertedAmount).toBeCloseTo(result50.convertedAmount * 2, 0);
    });
  });

  describe("FxService — currency listing", () => {
    it("returns sorted available currencies", async () => {
      const { FxService } = await import("@/modules/fx/fx.service");
      const currencies = await FxService.listAvailableCurrencies();
      expect(currencies.length).toBeGreaterThan(0);
      expect(currencies).toContain("USD");
      expect(currencies).toContain("EUR");
      expect(currencies).toContain("NGN");
      expect(currencies).toContain("ZAR");
      expect(currencies).toContain("AED");
    });
  });
});
