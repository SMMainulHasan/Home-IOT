import { useEffect, useState } from "react";
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from "../../api/schedule.api";
import { useDevice } from "../../context/useDevice";
import type { Schedule } from "../../types/schedule";
import AddScheduleModal from "../modal/AddScheduleModal";
import ScheduleCard from "./ScheduleCard";

type extendedSchedule = Partial<Schedule> & { period: string };

export default function WateringScheduleSection() {
  const { deviceId } = useDevice();
  const [open, setOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  //ADD SCHEDULE ::POST
  const addNewSchedule = async (data: extendedSchedule) => {
    const hour = data.hour ?? 0;
    const hour24 =
      data.period === "PM"
        ? hour === 12
          ? 12
          : hour + 12
        : hour === 12
          ? 0
          : hour;

    try {
      const newSchedule = await createSchedule({ ...data, hour: hour24 });
      if (newSchedule.scheduleId) {
        setSchedules((prev) => [...prev, newSchedule]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // HANDLE TOGGLE PAUSE
  const handleToggle = async (scheduleId: string, isActive: boolean) => {
    const data = { scheduleId: scheduleId, isActive: !isActive };
    try {
      const updatedSchedule = await updateSchedule(scheduleId, data);
      if (updatedSchedule.scheduleId) {
        setSchedules((prev) =>
          prev?.map((s) => {
            if (s.scheduleId !== scheduleId) return s;
            return { ...s, isActive: !s.isActive };
          }),
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (id: string) => {
    console.log("Edit schedule:", id);
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      const res = await deleteSchedule(scheduleId);
      if (res.success) {
        setSchedules((prev) => prev?.filter((s) => s.scheduleId != scheduleId));
      }
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await getSchedules(deviceId);
        setSchedules(data);
      } catch (err) {
        setSchedules([]);
        console.log(err);
      }
    };
    fetchSchedules();
  }, [deviceId]);

  return (
    <div className="relative min-h-[250px] bg-slate-900 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex">
        <div className="mb-3">
          <h2 className="text-white text-lg font-semibold">
            Watering Schedule
          </h2>
          <p className="text-slate-400 text-sm">Manage automatic watering</p>
        </div>
        <div>
          {/* Floating Button */}
          <button
            onClick={() => setOpen(true)}
            className="absolute right-6 w-10 h-10 rounded-full 
                 bg-green-500 text-white text-3xl flex items-center justify-center
                 shadow-lg hover:scale-105 active:scale-95 transition"
          >
            +
          </button>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
        {[...schedules]
          .sort((a, b) =>
            a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute,
          )
          .map((schedule: Schedule) => (
            <ScheduleCard
              key={schedule.scheduleId}
              schedule={schedule}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
      </div>

      <AddScheduleModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={(data) => {
          addNewSchedule(data);
          setOpen(false);
        }}
      />
    </div>
  );
}
