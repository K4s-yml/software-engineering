import { useMemo, useState } from "react";
import { CalendarCheck, Search, RotateCcw } from "lucide-react";
import type { AvailabilityResult } from "@/types";
import { ROOMS, BOOKINGS } from "@/sampleData";
import { MAX_BOOKING_MINUTES, MINUTES_IN_DAY } from "@/constants";
import { checkAvailability } from "@/utils/availability";
import type { ExplanationInput } from "@/utils/explain";
import { parseWholeMinutes, minutesToLabel } from "@/utils/time";
import TimeField from "@/components/TimeField";
import RoomCard from "@/components/RoomCard";
import Timeline from "@/components/Timeline";
import ResultPanel from "@/components/ResultPanel";

export default function App() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);

  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [lastInput, setLastInput] = useState<ExplanationInput | null>(null);
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState<{ start?: string; end?: string; current?: string; room?: string }>({});

  const startNum = parseWholeMinutes(startTime);
  const endNum = parseWholeMinutes(endTime);
  const currentNum = parseWholeMinutes(currentTime);

  const selectedRoom = useMemo(() => ROOMS.find((r) => r.id === roomId) ?? null, [roomId]);
  const roomBookings = useMemo(
    () => (roomId ? BOOKINGS.filter((b) => b.room === roomId) : []),
    [roomId],
  );

  function validate(): boolean {
    const e: typeof errors = {};
    if (startTime.trim() === "") e.start = "Enter a start time.";
    else if (startNum === null || startNum < 0 || startNum > MINUTES_IN_DAY)
      e.start = "Must be a whole number from 0 to 1440.";

    if (endTime.trim() === "") e.end = "Enter an end time.";
    else if (endNum === null || endNum < 0 || endNum > MINUTES_IN_DAY)
      e.end = "Must be a whole number from 0 to 1440.";

    if (currentTime.trim() === "") e.current = "Enter the current time.";
    else if (currentNum === null || currentNum < 0 || currentNum > MINUTES_IN_DAY)
      e.current = "Must be a whole number from 0 to 1440.";

    if (!roomId) e.room = "Select a room to check.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCheck() {
    if (!validate()) {
      setResult(null);
      setChecked(false);
      return;
    }
    // Safe because validate() guarantees non-null
    const res = checkAvailability(
      startNum as number,
      endNum as number,
      currentNum as number,
      roomId as string,
      ROOMS,
      BOOKINGS,
    );
    setLastInput({
      roomName: selectedRoom?.name ?? "",
      start: startNum as number,
      end: endNum as number,
      isAvailable: res.status === "available",
      reasonCode: res.reason,
    });
    setResult(res);
    setChecked(true);
  }

  function handleReset() {
    setStartTime("");
    setEndTime("");
    setCurrentTime("");
    setRoomId(null);
    setResult(null);
    setLastInput(null);
    setChecked(false);
    setErrors({});
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">Smart Campus Room Availability</h1>
            <p className="text-xs text-slate-500 sm:text-sm">Check whether a campus room is free for your requested time.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Left: form */}
          <section className="flex min-w-0 flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Request details</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                All times are in minutes from midnight (0–{MINUTES_IN_DAY}). Max booking: {MAX_BOOKING_MINUTES} min.
              </p>
            </div>

            <TimeField
              id="current-time"
              label="Current time"
              value={currentTime}
              onChange={(v) => { setCurrentTime(v); setChecked(false); }}
              error={errors.current}
              hint={`Now ${currentNum !== null ? `= ${minutesToLabel(currentNum)}` : ""}`}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TimeField
                id="start-time"
                label="Start time"
                value={startTime}
                onChange={(v) => { setStartTime(v); setChecked(false); }}
                error={errors.start}
                hint={startNum !== null ? `= ${minutesToLabel(startNum)}` : undefined}
              />
              <TimeField
                id="end-time"
                label="End time"
                value={endTime}
                onChange={(v) => { setEndTime(v); setChecked(false); }}
                error={errors.end}
                hint={endNum !== null ? `= ${minutesToLabel(endNum)}` : undefined}
              />
            </div>

            {startNum !== null && endNum !== null && endNum > startNum && (
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Duration: <span className="font-semibold text-slate-700">{endNum - startNum} minutes</span>
                {endNum - startNum > MAX_BOOKING_MINUTES && (
                  <span className="ml-2 font-semibold text-red-600">(exceeds {MAX_BOOKING_MINUTES} min)</span>
                )}
              </div>
            )}

            {/* Room selection */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">Select a room</h3>
              {errors.room && <p className="mb-2 text-xs text-red-600">{errors.room}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                {ROOMS.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    selected={roomId === room.id}
                    onSelect={() => { setRoomId(room.id); setChecked(false); }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCheck}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <Search className="h-4 w-4" /> Check availability
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </section>

          {/* Right: result + timeline */}
          <section className="flex min-w-0 flex-col gap-5">
            <ResultPanel
              key={`${checked}-${result?.message ?? ""}`}
              result={result}
              checked={checked}
              buildInput={lastInput ? () => lastInput : undefined}
            />

            {selectedRoom && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-800">{selectedRoom.name}</h2>
                  <span className="text-xs text-slate-400">{selectedRoom.location}</span>
                </div>

                <Timeline
                  bookings={roomBookings}
                  candidateStart={checked ? startNum : null}
                  candidateEnd={checked ? endNum : null}
                  blocked={selectedRoom.blocked}
                />

                {roomBookings.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-400">No existing bookings for this room.</p>
                ) : (
                  <div className="mt-4">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Existing bookings ({roomBookings.length})
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {roomBookings
                        .slice()
                        .sort((a, b) => a.start - b.start)
                        .map((b) => (
                          <li
                            key={b.id}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                          >
                            <span className="font-medium text-slate-700">{b.bookedBy}</span>
                            <span className="text-slate-500">
                              {minutesToLabel(b.start)} – {minutesToLabel(b.end)} ({b.end - b.start} min)
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!selectedRoom && (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-sm text-slate-400">
                Select a room to see its booking timeline.
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Fictional sample data · No bookings are created or modified by this tool.
        </footer>
      </main>
    </div>
  );
}
