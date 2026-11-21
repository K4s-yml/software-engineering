import { useMemo } from "react";
import type { Booking } from "@/types";
import { minutesToLabel } from "@/utils/time";
import { MINUTES_IN_DAY } from "@/constants";

interface TimelineProps {
  bookings: Booking[];
  candidateStart: number | null;
  candidateEnd: number | null;
  blocked: boolean;
}

const HOUR_PX = 2.4; // 24h * 2.4 = 57.6rem → fits a horizontal scroll area

export default function Timeline({ bookings, candidateStart, candidateEnd, blocked }: TimelineProps) {
  const hours = useMemo(() => Array.from({ length: 25 }, (_, i) => i), []);
  const widthPx = MINUTES_IN_DAY / 60 * HOUR_PX * 16; // rem→px approx (1rem=16px)

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" /> Existing booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-sm ${blocked ? "bg-red-400" : "bg-emerald-400"}`} />
          Your request
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="relative" style={{ width: `${widthPx}px`, minWidth: "100%" }}>
          {/* hour gridlines + labels */}
          {hours.map((h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 border-l border-slate-200"
              style={{ left: `${(h * 60 * HOUR_PX * 16) / MINUTES_IN_DAY * 100}%` }}
            >
              <span className="absolute -top-0.5 -translate-x-1/2 text-[10px] text-slate-400">
                {minutesToLabel(h * 60)}
              </span>
            </div>
          ))}

          {/* existing bookings */}
          {bookings.map((b) => (
            <div
              key={b.id}
              className="absolute top-5 bottom-2 rounded-sm bg-blue-500/80 px-1 text-[10px] leading-tight text-white flex items-center overflow-hidden"
              style={{
                left: `${(b.start / MINUTES_IN_DAY) * 100}%`,
                width: `${((b.end - b.start) / MINUTES_IN_DAY) * 100}%`,
              }}
              title={`${b.bookedBy} · ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
            >
              <span className="truncate">{minutesToLabel(b.start)}–{minutesToLabel(b.end)}</span>
            </div>
          ))}

          {/* candidate interval */}
          {candidateStart !== null && candidateEnd !== null && candidateStart >= 0 && candidateEnd <= MINUTES_IN_DAY && candidateStart < candidateEnd && (
            <div
              className={`absolute top-5 bottom-2 rounded-sm border-2 px-1 text-[10px] font-semibold flex items-center overflow-hidden ${
                blocked ? "border-red-500 bg-red-400/30 text-red-700" : "border-emerald-500 bg-emerald-400/25 text-emerald-700"
              }`}
              style={{
                left: `${(candidateStart / MINUTES_IN_DAY) * 100}%`,
                width: `${((candidateEnd - candidateStart) / MINUTES_IN_DAY) * 100}%`,
              }}
            >
              <span className="truncate">{minutesToLabel(candidateStart)}–{minutesToLabel(candidateEnd)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
