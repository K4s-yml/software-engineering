import { Ban, MapPin, Users } from "lucide-react";
import type { Room } from "@/types";

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onSelect: () => void;
}

export default function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      disabled={room.blocked}
      className={`group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
        room.blocked
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
          : selected
            ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200"
            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-base font-semibold ${selected ? "text-blue-900" : "text-slate-800"}`}>
          {room.name}
        </span>
        {room.blocked && <Ban className="h-4 w-4 text-red-500" />}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5" /> {room.location}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Users className="h-3.5 w-3.5" /> Capacity: {room.capacity}
      </div>
      {room.blocked && (
        <span className="mt-1 inline-flex w-fit rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
          Blocked
        </span>
      )}
    </button>
  );
}
