import { useRef, useState } from "react";
import type { Schedule } from "../../types/schedule";

interface Props {
  schedule: Schedule;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatTime = (num: number) => String(num).padStart(2, "0");

const THRESHOLD = 80;

export default function ScheduleCard({
  schedule,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const hour12 = schedule.hour % 12 || 12;
  const period = schedule.hour >= 12 ? "PM" : "AM";

  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX.current;
    setOffset(Math.max(-THRESHOLD, Math.min(THRESHOLD, diff)));
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (offset < -THRESHOLD / 1.1) setOffset(-THRESHOLD);
    else if (offset > THRESHOLD / 1.1) setOffset(THRESHOLD);
    else setOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* DELETE LEFT — shows when swiped right */}
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-slate-700 transition-all"
        style={{ width: THRESHOLD + 10 }}
      >
        <button
          onClick={() => onDelete(schedule.scheduleId)}
          className="text-white font-semibold text-sm px-3"
        >
          Delete
        </button>
      </div>

      {/* DELETE RIGHT — shows when swiped left */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-slate-700 transition-all"
        style={{ width: THRESHOLD + 10 }}
      >
        <button
          onClick={() => onDelete(schedule.scheduleId)}
          className="text-white font-semibold text-sm px-3"
        >
          Delete
        </button>
      </div>

      {/* CARD */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
        className={`bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between shadow-inner relative z-10`}
      >
        {/* Left */}
        <div
          className={`flex items-center gap-3  ${
            !schedule.isActive ? "opacity-50" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center text-green-400 font-semibold">
            {schedule.liters}L
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {schedule.name ? schedule.name : "Water"}
            </p>
            <p className="text-slate-400 text-xs capitalize">
              {schedule.isDone ? "Complete" : "Idle"}
            </p>
          </div>
        </div>

        {/* Time */}
        <div
          className={`text-green-400 text-sm font-medium  ${
            !schedule.isActive ? "opacity-50" : ""
          }`}
        >
          {formatTime(hour12)}:{formatTime(schedule.minute)} {period}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Toggle */}
          <button
            onClick={() => onToggle(schedule.scheduleId, schedule.isActive)}
            className={`w-10 h-5 flex items-center rounded-full transition ${
              schedule.isActive ? "bg-green-500" : "bg-slate-600"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                schedule.isActive ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>

          {/* 3 dots */}
          <button
            onClick={() => onEdit(schedule.scheduleId)}
            className="text-slate-400 hover:text-white text-lg"
          >
            ⋮
          </button>
        </div>
      </div>
    </div>
  );
}
