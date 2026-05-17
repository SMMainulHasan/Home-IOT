import { useState } from "react";
import { useDevice } from "../../context/useDevice";
import type { Schedule } from "../../types/schedule";
import DialPicker from "./DialPicker";

type extendedSchedule = Partial<Schedule> & { period: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: extendedSchedule) => void;
};

export default function AddScheduleModal({ isOpen, onClose, onSave }: Props) {
  const { deviceId } = useDevice();

  const now = new Date();

  const [name, setName] = useState("");
  const [liters, setLiters] = useState(10);
  const [hour, setHour] = useState(now.getHours() % 12 || 12);
  const [minute, setMinute] = useState(now.getMinutes());
  const [period, setPeriod] = useState<"AM" | "PM">(
    now.getHours() >= 12 ? "PM" : "AM",
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div className="bg-slate-900 w-full max-w-md rounded-t-3xl p-5 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-semibold">Add Schedule</h2>
          <button onClick={onClose} className="text-slate-400 text-xl">
            ✕
          </button>
        </div>

        {/* Name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Schedule name"
          className="w-full bg-slate-800 text-white rounded-xl p-3 mb-6 outline-none"
        />

        {/* Dials */}
        <div className="flex justify-between items-center gap-2">
          {/* Left */}
          <DialPicker
            label="Liters"
            values={Array.from({ length: 40 }, (_, i) => i + 1)}
            value={liters}
            onChange={setLiters}
          />

          {/* Center */}
          <div className="flex gap-2">
            <DialPicker
              label="Hour"
              values={Array.from({ length: 12 }, (_, i) => i + 1)}
              value={hour}
              onChange={setHour}
            />
            <DialPicker
              label="Min"
              values={Array.from({ length: 60 }, (_, i) => i)}
              value={minute}
              onChange={setMinute}
            />
          </div>

          {/* Right */}
          <DialPicker
            label="AM/PM"
            values={["AM", "PM"]}
            value={period}
            onChange={setPeriod}
          />
        </div>

        {/* Save */}
        <button
          onClick={() =>
            onSave({ deviceId, name, hour, minute, period, liters })
          }
          className="w-full mt-6 bg-green-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition"
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
}
