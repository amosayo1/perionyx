import { describe, it, expect } from "vitest";
import { cnRTL } from "@/hooks/locale/use-rtl";

describe("cnRTL", () => {
  describe("LTR mode (isRTL=false)", () => {
    it("returns classes unchanged", () => {
      expect(cnRTL(false, "pl-4", "mr-2", "text-left")).toBe("pl-4 mr-2 text-left");
    });

    it("filters falsy values", () => {
      expect(cnRTL(false, "pl-4", false, null, undefined, "mr-2")).toBe("pl-4 mr-2");
    });

    it("handles empty input", () => {
      expect(cnRTL(false)).toBe("");
    });
  });

  describe("RTL mode (isRTL=true)", () => {
    it("flips pl- to pr-", () => {
      expect(cnRTL(true, "pl-4")).toBe("pr-4");
    });

    it("flips pr- to pl-", () => {
      expect(cnRTL(true, "pr-4")).toBe("pl-4");
    });

    it("flips ml- to mr-", () => {
      expect(cnRTL(true, "ml-2")).toBe("mr-2");
    });

    it("flips mr- to ml-", () => {
      expect(cnRTL(true, "mr-2")).toBe("ml-2");
    });

    it("flips border-l to border-r", () => {
      expect(cnRTL(true, "border-l")).toBe("border-r");
    });

    it("flips border-r to border-l", () => {
      expect(cnRTL(true, "border-r")).toBe("border-l");
    });

    it("flips left to right", () => {
      expect(cnRTL(true, "left-0")).toBe("right-0");
    });

    it("flips right to left", () => {
      expect(cnRTL(true, "right-0")).toBe("left-0");
    });

    it("flips text-left to text-right", () => {
      expect(cnRTL(true, "text-left")).toBe("text-right");
    });

    it("flips text-right to text-left", () => {
      expect(cnRTL(true, "text-right")).toBe("text-left");
    });

    it("flips flex-row to flex-row-reverse", () => {
      expect(cnRTL(true, "flex-row")).toBe("flex-row-reverse");
    });

    it("flips flex-row-reverse to flex-row", () => {
      expect(cnRTL(true, "flex-row-reverse")).toBe("flex-row");
    });

    it("flips translate-x to -translate-x", () => {
      expect(cnRTL(true, "translate-x-1/2")).toBe("-translate-x-1/2");
    });

    it("flips -translate-x to translate-x", () => {
      expect(cnRTL(true, "-translate-x-1/2")).toBe("translate-x-1/2");
    });

    it("flips responsive md:ml-auto to md:mr-auto", () => {
      expect(cnRTL(true, "md:ml-auto")).toBe("md:mr-auto");
    });

    it("flips responsive md:mr-auto to md:ml-auto", () => {
      expect(cnRTL(true, "md:mr-auto")).toBe("md:ml-auto");
    });

    it("handles space-x- with reverse modifier", () => {
      const result = cnRTL(true, "space-x-4");
      expect(result).toContain("space-x-reverse");
      expect(result).toContain("space-x-4");
    });

    it("removes space-x-reverse standalone", () => {
      expect(cnRTL(true, "space-x-reverse")).toBe("");
    });
  });

  describe("deterministic transformation (no double-flip bug)", () => {
    it("pl-4 does not get double-flipped back to pl-4", () => {
      const result = cnRTL(true, "pl-4");
      expect(result).toBe("pr-4");
      expect(result).not.toBe("pl-4");
    });

    it("pr-8 does not get double-flipped back to pr-8", () => {
      const result = cnRTL(true, "pr-8");
      expect(result).toBe("pl-8");
      expect(result).not.toBe("pr-8");
    });

    it("multiple spacing classes all flip correctly", () => {
      const result = cnRTL(true, "pl-4", "pr-2", "ml-3", "mr-1");
      expect(result).toBe("pr-4 pl-2 mr-3 ml-1");
    });

    it("complex class string with arbitrary values", () => {
      const result = cnRTL(true, "pl-[16px]", "mr-[2rem]");
      expect(result).toBe("pr-[16px] ml-[2rem]");
    });
  });

  describe("edge cases", () => {
    it("handles empty class string", () => {
      expect(cnRTL(true, "")).toBe("");
    });

    it("classes without RTL mappings stay unchanged", () => {
      expect(cnRTL(true, "bg-zinc-900", "text-white", "p-4")).toBe("bg-zinc-900 text-white p-4");
    });

    it("filters null and undefined gracefully", () => {
      expect(cnRTL(true, "pl-4", null, undefined, false, "mr-2")).toBe("pr-4 ml-2");
    });
  });
});
