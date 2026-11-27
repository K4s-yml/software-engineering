import type { AvailabilityResult, Booking, Room } from "@/types";
import { MAX_BOOKING_MINUTES, MINUTES_IN_DAY } from "@/constants";
import { minutesToLabel } from "@/utils/time";

/**
 * Touching endpoints are allowed: [aStart, aEnd) and [bStart, bEnd) overlap
 * only when aStart < bEnd and bStart < aEnd.
 */
export function intervalsOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

export function checkAvailability(
  start: number,
  end: number,
  currentTime: number,
  roomId: string,
  rooms: Room[],
  bookings: Booking[],
): AvailabilityResult {
  // Input contract (AV-01, AV-02): whole minutes only, current time within the day
  if (![start, end, currentTime].every((v) => Number.isInteger(v)) || currentTime < 0 || currentTime > MINUTES_IN_DAY) {
    return { status: "invalid", message: "Times must be whole minutes within 0 to 1440.", reason: "invalid_time" };
  }
  // AC1: valid interval and start after current time
  if (start < 0 || end > MINUTES_IN_DAY) {
    return { status: "invalid", message: "Interval must stay within 0 to 1440 minutes.", reason: "invalid_time" };
  }
  if (!(start < end)) {
    return { status: "invalid", message: "Start time must be earlier than end time.", reason: "invalid_time" };
  }
  if (start <= currentTime) {
    return {
      status: "unavailable",
      message: `Start time (${minutesToLabel(start)}) must be after the current time (${minutesToLabel(currentTime)}).`,
      reason: "past_time",
    };
  }

  // AC2: max 120 minutes
  if (end - start > MAX_BOOKING_MINUTES) {
    return {
      status: "unavailable",
      message: `Booking is ${end - start} minutes — the maximum allowed is ${MAX_BOOKING_MINUTES} minutes.`,
      reason: "invalid_time",
    };
  }

  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return { status: "unavailable", message: "Please select a room.", reason: "unknown" };
  }

  // AC3: blocked room
  if (room.blocked) {
    return { status: "unavailable", message: `${room.name} is currently blocked and cannot be booked.`, reason: "room_blocked" };
  }

  // AC4: overlap check (touching endpoints allowed)
  const roomBookings = bookings.filter((b) => b.room === roomId);
  const conflict = roomBookings.find((b) => intervalsOverlap({ start, end }, { start: b.start, end: b.end }));
  if (conflict) {
    return {
      status: "unavailable",
      message: `Overlaps an existing booking by ${conflict.bookedBy} (${minutesToLabel(conflict.start)}–${minutesToLabel(conflict.end)}).`,
      reason: "booking_conflict",
    };
  }

  return {
    status: "available",
    message: `${room.name} is available from ${minutesToLabel(start)} to ${minutesToLabel(end)}.`,
    reason: "available",
  };
}
