import { describe, it, expect } from "vitest";
import { parseWholeMinutes } from "@/utils/time";

describe("parseWholeMinutes (R-01 regression)", () => {
  it("accepts whole numbers", () => {
    expect(parseWholeMinutes("60")).toBe(60);
    expect(parseWholeMinutes(" 0 ")).toBe(0);
  });
  it("rejects decimals instead of silently rounding", () => {
    expect(parseWholeMinutes("60.5")).toBeNull();
  });
  it("rejects hex, exponent and non-numeric text", () => {
    expect(parseWholeMinutes("0x10")).toBeNull();
    expect(parseWholeMinutes("1e2")).toBeNull();
    expect(parseWholeMinutes("abc")).toBeNull();
    expect(parseWholeMinutes("")).toBeNull();
  });
});