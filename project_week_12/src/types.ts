export interface Booking {
  id: string;
  room: string;
  start: number; // minutes from midnight (0-1440)
  end: number;   // minutes from midnight (0-1440)
  bookedBy: string;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  blocked: boolean;
}

export type ReasonCode =
  | "available"
  | "room_blocked"
  | "booking_conflict"
  | "invalid_time"
  | "past_time"
  | "unknown";

export type AvailabilityResult =
  | { status: "available"; message: string; reason: ReasonCode }
  | { status: "unavailable"; message: string; reason: ReasonCode }
  | { status: "invalid"; message: string; reason: ReasonCode };
