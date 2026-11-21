import { MINUTES_IN_DAY } from "@/constants";

export function minutesToLabel(min: number): string {
  const m = Math.max(0, Math.min(MINUTES_IN_DAY, Math.round(min)));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

export function clampInt(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (!Number.isInteger(rounded)) return null;
  return rounded;
}


/** Strict parser for user-typed minutes: whole numbers only (no decimals, hex, exponent). */
export function parseWholeMinutes(text: string): number | null {
  const t = text.trim();
  if (!/^-?\d+$/.test(t)) return null;
  return Number(t);
}