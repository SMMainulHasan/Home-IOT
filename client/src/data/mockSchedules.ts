import type { Schedule } from "../types/schedule";

export const mockSchedules: Schedule[] = [
  {
    id: "1",
    name: "Morning",
    type: "daily",
    time: "7:00 AM",
    enabled: true,
  },
  {
    id: "2",
    name: "Evening",
    type: "daily",
    time: "4:00 PM",
    enabled: true,
  },
  {
    id: "3",
    name: "Interval",
    type: "interval",
    interval: "Every 12h",
    enabled: false,
  },
];
