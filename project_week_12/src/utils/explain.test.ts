import { describe, it, expect, vi, afterEach } from "vitest";
import {
  buildExplanation,
  explainWithTimeout,
  MAX_EXPLANATION_LENGTH,
  FALLBACK_EXPLANATION,
} from "@/utils/explain";

const base = {
  roomName: "Room 101",
  start: 600,
  end: 660,
  isAvailable: true,
  reasonCode: "available" as const,
};

describe("buildExplanation", () => {
  it("available room: explains availability", () => {
    const res = buildExplanation({ ...base, isAvailable: true, reasonCode: "available" });
    expect(res.explanation).toContain("Room 101");
    expect(res.explanation).toContain("10:00");
    expect(res.explanation.length).toBeLessThanOrEqual(MAX_EXPLANATION_LENGTH);
  });

  it("overlap: explains booking conflict", () => {
    const res = buildExplanation({ ...base, isAvailable: false, reasonCode: "booking_conflict" });
    expect(res.explanation).toContain("overlap");
  });

  it("blocked room: explains block", () => {
    const res = buildExplanation({ ...base, isAvailable: false, reasonCode: "room_blocked" });
    expect(res.explanation).toContain("blocked");
  });

  it("invalid time: explains invalid interval", () => {
    const res = buildExplanation({ ...base, start: 600, end: 720, isAvailable: false, reasonCode: "invalid_time" });
    expect(res.explanation).toContain("not a valid booking interval");
  });

  it("past time: explains past-start rejection", () => {
    const res = buildExplanation({ ...base, isAvailable: false, reasonCode: "past_time" });
    expect(res.explanation).toContain("not after the current time");
  });

  it("explanations are at most two sentences", () => {
    for (const reasonCode of ["available", "room_blocked", "booking_conflict", "invalid_time", "past_time"] as const) {
      const res = buildExplanation({ ...base, isAvailable: reasonCode === "available", reasonCode });
      const sentences = res.explanation.split(/[.!?]/).filter((s) => s.trim() !== "");
      expect(sentences.length).toBeLessThanOrEqual(2);
    }
  });

  it("rejects empty room name", () => {
    expect(() => buildExplanation({ ...base, roomName: "" })).toThrow();
    expect(() => buildExplanation({ ...base, roomName: "   " })).toThrow();
  });

  it("rejects malformed values (bad minutes, bad reason, bad boolean)", () => {
    expect(() => buildExplanation({ ...base, start: -5 })).toThrow();
    expect(() => buildExplanation({ ...base, end: 1500 })).toThrow();
    expect(() => buildExplanation({ ...base, start: 10.5 })).toThrow();
    expect(() => buildExplanation({ ...base, reasonCode: "hacker" as never })).toThrow();
    expect(() => buildExplanation({ ...base, isAvailable: "yes" as never })).toThrow();
  });

  it("rejects overly long room name", () => {
    const long = "R".repeat(81);
    expect(() => buildExplanation({ ...base, roomName: long })).toThrow();
  });

  it("rejects negative end (F1 regression)", () => {
    expect(() => buildExplanation({ ...base, end: -10 })).toThrow();
  });

  it("rejects start above 1440 (F1 regression)", () => {
    expect(() => buildExplanation({ ...base, start: 1441, end: 1441 })).toThrow();
  });

  it("rejects reversed interval where start >= end (F1 regression)", () => {
    expect(() => buildExplanation({ ...base, start: 600, end: 600 })).toThrow();
    expect(() => buildExplanation({ ...base, start: 660, end: 600 })).toThrow();
  });

  it("rejects isAvailable true with room_blocked (F2 regression)", () => {
    expect(() =>
      buildExplanation({ ...base, isAvailable: true, reasonCode: "room_blocked" }),
    ).toThrow();
  });

  it("rejects isAvailable false with available (F2 regression)", () => {
    expect(() =>
      buildExplanation({ ...base, isAvailable: false, reasonCode: "available" }),
    ).toThrow();
  });
});

describe("explainWithTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes through a valid adapter result", async () => {
    const res = await explainWithTimeout(base);
    expect(res.explanation).toContain("Room 101");
  });

  it("returns fallback-safe error on simulated adapter failure", async () => {
    const res = await explainWithTimeout(base, {
      impl: () => {
        throw new Error("boom");
      },
    }).catch((e: unknown) => e instanceof Error ? e.message : "unknown");
    expect(res).toBe("boom");
  });

  it("times out a hanging adapter", async () => {
    vi.useFakeTimers();
    const hanging = new Promise<never>(() => {});
    const pending = explainWithTimeout(base, {
      impl: () => hanging as unknown as ReturnType<typeof buildExplanation>,
      timeoutMs: 50,
    });
    const expectation = expect(pending).rejects.toThrow("Explanation timed out.");
    await vi.advanceTimersByTimeAsync(60);
    await expectation;
  });

  it("rejects empty adapter output", async () => {
    await expect(
      explainWithTimeout(base, { impl: () => ({ explanation: "" }) }),
    ).rejects.toThrow();
  });

  it("rejects overly long adapter output", async () => {
    await expect(
      explainWithTimeout(base, {
        impl: () => ({ explanation: "x".repeat(MAX_EXPLANATION_LENGTH + 1) }),
      }),
    ).rejects.toThrow();
  });

  it("fallback message is defined and states status is unchanged", async () => {
    expect(FALLBACK_EXPLANATION).toContain("unchanged");
    await expect(
      explainWithTimeout(base, {
        impl: () => {
          throw new Error("boom");
        },
      }),
    ).rejects.toThrow();
    // The booking status is never touched by the adapter; FALLBACK_EXPLANATION
    // is what the UI shows when the above rejects.
  });
});
