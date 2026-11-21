import type { Room, Booking } from "@/types";

export const ROOMS: Room[] = [
  { id: "r1", name: "Room 101", location: "Building A · 1st Floor", capacity: 30, blocked: false },
  { id: "r2", name: "Room 102", location: "Building A · 1st Floor", capacity: 40, blocked: true },
  { id: "r3", name: "Room 201", location: "Building B · 2nd Floor", capacity: 60, blocked: false },
  { id: "r4", name: "Room 205", location: "Building B · 2nd Floor", capacity: 20, blocked: false },
  { id: "r5", name: "Room 301", location: "Building C · 3rd Floor", capacity: 50, blocked: false },
];

export const BOOKINGS: Booking[] = [
  { id: "b1", room: "r1", start: 540, end: 600, bookedBy: "Prof. Smith" },
  { id: "b2", room: "r1", start: 720, end: 780, bookedBy: "Prof. Chen" },
  { id: "b3", room: "r3", start: 600, end: 660, bookedBy: "Dr. Patel" },
  { id: "b4", room: "r3", start: 900, end: 960, bookedBy: "Dr. Patel" },
  { id: "b5", room: "r4", start: 480, end: 540, bookedBy: "Prof. Lee" },
  { id: "b6", room: "r5", start: 840, end: 930, bookedBy: "Prof. Garcia" },
  { id: "b7", room: "r5", start: 1020, end: 1080, bookedBy: "Prof. Garcia" },
];
