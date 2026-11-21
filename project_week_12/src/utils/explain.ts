import { MINUTES_IN_DAY } from "@/constants";
import { minutesToLabel } from "@/utils/time";

export type ReasonCode =
  | "available"
  | "room_blocked"
  | "booking_conflict"
  | "invalid_time"
  | "past_time"
  | "unknown";

export interface ExplanationInput {
  roomName: string;
  start: number;
  end: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
}

export const MAX_ROOM_NAME_LENGTH = 80;
export const MAX_EXPLANATION_LENGTH = 280;

export const FALLBACK_EXPLANATION =
  "The explanation could not be generated. The availability result is unchanged.";

const REASON_CODES: readonly ReasonCode[] = [
  "available",
  "room_blocked",
  "booking_conflict",
  "invalid_time",
  "past_time",
  "unknown",
];

function validateInput(input: ExplanationInput): void {
  if (typeof input.roomName !== "string" || input.roomName.trim() === "") {
    throw new Error("Room name must be a non-empty string.");
  }
  if (input.roomName.length > MAX_ROOM_NAME_LENGTH) {
    throw new Error(`Room name must be at most ${MAX_ROOM_NAME_LENGTH} characters.`);
  }
  if (
    !Number.isInteger(input.start) ||
    !Number.isInteger(input.end) ||
    input.start < 0 ||
    input.end < 0 ||
    input.start > MINUTES_IN_DAY ||
    input.end > MINUTES_IN_DAY
  ) {
    throw new Error("Start and end must be whole minutes within 0 to 1440.");
  }
  if (input.start >= input.end) {
    throw new Error("Start must be earlier than end.");
  }
  if (typeof input.isAvailable !== "boolean") {
    throw new Error("isAvailable must be a boolean.");
  }
  if (!REASON_CODES.includes(input.reasonCode)) {
    throw new Error("Unknown reason code.");
  }
  if (input.isAvailable !== (input.reasonCode === "available")) {
    throw new Error("isAvailable contradicts reasonCode.");
  }
}

/**
 * Mock LLM adapter: pure, deterministic, no network. Uses only the facts in
 * the input; never mutates anything and never changes the booking status.
 */
export function buildExplanation(input: ExplanationInput): { explanation: string } {
  validateInput(input);
  const time = `${minutesToLabel(input.start)}–${minutesToLabel(input.end)}`;

  let explanation: string;
  if (input.reasonCode === "available" && input.isAvailable) {
    explanation =
      `${input.roomName} is available for the requested interval (${time}). ` +
      "This is based on the checked request only; no booking has been created.";
  } else if (input.reasonCode === "room_blocked") {
    explanation =
      `${input.roomName} is blocked and cannot be booked for the requested interval (${time}). ` +
      "No booking has been created.";
  } else if (input.reasonCode === "booking_conflict") {
    explanation =
      `${input.roomName} already has a booking that overlaps the requested interval (${time}). ` +
      "No booking has been created.";
  } else if (input.reasonCode === "past_time") {
    explanation =
      `The requested start for ${input.roomName} (${time}) is not after the current time. ` +
      "No booking has been created.";
  } else if (input.reasonCode === "invalid_time") {
    explanation =
      `The requested interval for ${input.roomName} (${time}) is not a valid booking interval. ` +
      "No booking has been created.";
  } else {
    explanation =
      `Availability for ${input.roomName} in the requested interval (${time}) could not be explained further. ` +
      "No booking has been created.";
  }

  if (typeof explanation !== "string" || explanation.trim() === "" || explanation.length > MAX_EXPLANATION_LENGTH) {
    throw new Error("Generated explanation failed output validation.");
  }
  return { explanation };
}

export interface ExplainOptions {
  timeoutMs?: number;
  impl?: (input: ExplanationInput) => { explanation: string };
}

/**
 * Async wrapper around the mock adapter with a timeout and output validation.
 * Throws on adapter failure, timeout or invalid output; callers must show a
 * fallback and never change the booking status.
 */
export async function explainWithTimeout(
  input: ExplanationInput,
  options: ExplainOptions = {},
): Promise<{ explanation: string }> {
  const impl = options.impl ?? buildExplanation;
  const timeoutMs = options.timeoutMs ?? 2000;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Explanation timed out.")), timeoutMs);
  });

  try {
    const res = await Promise.race([Promise.resolve().then(() => impl(input)), timeout]);
    if (
      !res ||
      typeof res.explanation !== "string" ||
      res.explanation.trim() === "" ||
      res.explanation.length > MAX_EXPLANATION_LENGTH
    ) {
      throw new Error("Generated explanation failed output validation.");
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}
