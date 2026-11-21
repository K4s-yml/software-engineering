import { describe, it, expect } from "vitest";
import { checkAvailability } from "@/utils/availability";
import type { Booking, Room } from "@/types";

const CURRENT_TIME = 540;

function makeRooms(): Room[] {
  return [
    { id: "r1", name: "Room 101", location: "Building A", capacity: 30, blocked: false },
    { id: "r2", name: "Room 102", location: "Building A", capacity: 40, blocked: true },
    { id: "r3", name: "Room 201", location: "Building B", capacity: 60, blocked: false },
  ];
}

function makeBookings(): Booking[] {
  return [{ id: "b1", room: "r1", start: 600, end: 660, bookedBy: "Prof. Smith" }];
}

describe("checkAvailability", () => {
  it("T01 AC4: touching after existing booking -> available", () => {
    const result = checkAvailability(660, 720, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("available");
  });

  it("T02 AC1: start equals current time -> unavailable", () => {
    const result = checkAvailability(540, 570, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("unavailable");
  });

  it("T03 AC1: zero duration -> invalid", () => {
    const result = checkAvailability(720, 720, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("invalid");
  });

  it("T04 AC1: reversed interval -> invalid", () => {
    const result = checkAvailability(750, 720, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("invalid");
  });

  it("T05 AC1: end past 1440 -> invalid", () => {
    const result = checkAvailability(1380, 1441, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("invalid");
  });

  it("T06 AC2: exactly 120 minutes -> available", () => {
    const result = checkAvailability(720, 840, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("available");
  });

  it("T07 AC2: 121 minutes exceeds max -> unavailable", () => {
    const result = checkAvailability(720, 841, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("unavailable");
  });

  it("T08 AC4: touching before existing booking -> available", () => {
    const result = checkAvailability(570, 600, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("available");
  });

  it("T09 AC4: partial overlap -> unavailable", () => {
    const result = checkAvailability(630, 690, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("unavailable");
  });

  it("T10 AC4: request contains the booking -> unavailable", () => {
    const result = checkAvailability(570, 690, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("unavailable");
  });

  it("T11 AC4: request inside the booking -> unavailable", () => {
    const result = checkAvailability(615, 645, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("unavailable");
  });

  it("T12 AC4: identical interval -> unavailable", () => {
    const result = checkAvailability(600, 660, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("unavailable");
  });

  it("T13 AC3: blocked room with valid free time -> unavailable", () => {
    const result = checkAvailability(660, 720, CURRENT_TIME, "r2", makeRooms(), makeBookings());
    expect(result.status).toBe("unavailable");
  });

  it("T14 AC4: no bookings -> available", () => {
    const result = checkAvailability(630, 690, CURRENT_TIME, "r1", makeRooms(), []);
    expect(result.status).toBe("available");
  });

  it("AC5: checking availability does not mutate bookings or rooms", () => {
    const rooms = makeRooms();
    const bookings = makeBookings();
    const bookingsSnapshot = bookings.map((b) => ({ ...b }));
    const roomsSnapshot = rooms.map((r) => ({ ...r }));
    checkAvailability(660, 720, CURRENT_TIME, "r1", rooms, bookings);
    checkAvailability(630, 690, CURRENT_TIME, "r1", rooms, bookings);
    checkAvailability(570, 600, CURRENT_TIME, "r1", rooms, bookings);
    expect(bookings).toEqual(bookingsSnapshot);
    expect(bookings.length).toBe(bookingsSnapshot.length);
    expect(rooms).toEqual(roomsSnapshot);
    expect(rooms.length).toBe(roomsSnapshot.length);
  });

  it("T15 AC1: ending exactly at 1440 -> available", () => {
    const result = checkAvailability(1380, 1440, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("available");
  });

  it("T16 AC1: start in the past -> unavailable", () => {
    const result = checkAvailability(500, 560, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("unavailable");
  });

  // --- Message content assertions ---

  it("T17 AC5: available message includes room name and formatted times", () => {
    const result = checkAvailability(660, 720, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result).toMatchObject({ status: "available" });
    if (result.status === "available") {
      expect(result.message).toBe("Room 101 is available from 11:00 to 12:00.");
    }
  });

  it("T18 AC3: blocked room message contains 'currently blocked'", () => {
    const result = checkAvailability(660, 720, CURRENT_TIME, "r2", makeRooms(), makeBookings());
    expect(result).toMatchObject({ status: "unavailable" });
    if (result.status === "unavailable") {
      expect(result.message).toContain("currently blocked");
    }
  });

  it("T19 AC4: overlap message contains booked-by name and existing interval", () => {
    const result = checkAvailability(630, 690, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result).toMatchObject({ status: "unavailable" });
    if (result.status === "unavailable") {
      expect(result.message).toContain("Prof. Smith");
      expect(result.message).toContain("10:00");
      expect(result.message).toContain("11:00");
    }
  });

  it("T20 AC2: 121-minute message contains actual duration and 120 limit", () => {
    const result = checkAvailability(720, 841, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result).toMatchObject({ status: "unavailable" });
    if (result.status === "unavailable") {
      expect(result.message).toContain("121");
      expect(result.message).toContain("120");
    }
  });

  // --- Room isolation ---

  it("T21 AC4: booking in another room does not block the requested room", () => {
    const rooms = makeRooms();
    const bookings: Booking[] = [
      { id: "b2", room: "r3", start: 630, end: 690, bookedBy: "Dr. Patel" },
    ];
    const result = checkAvailability(630, 690, CURRENT_TIME, "r1", rooms, bookings);
    expect(result.status).toBe("available");
  });

  // --- Negative start ---

  it("T22 AC1: negative start -> invalid", () => {
    const result = checkAvailability(-10, 30, CURRENT_TIME, "r1", makeRooms(), makeBookings());
    expect(result.status).toBe("invalid");
  });

  // --- Unknown room ---

  it("T23 AC4: unknown roomId -> unavailable with select-a-room message", () => {
    const result = checkAvailability(660, 720, CURRENT_TIME, "rX", makeRooms(), makeBookings());
    expect(result).toMatchObject({ status: "unavailable" });
    if (result.status === "unavailable") {
      expect(result.message).toContain("select a room");
    }
  });
});
