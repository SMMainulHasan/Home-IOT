export interface Schedule {
  scheduleId: string;
  deviceId: string;
  id: string;
  name: string;
  hour: number;
  minute: number;
  liters: number;
  isDone: boolean;
  isActive: boolean;
}

export type ScheduleType = "daily" | "once" | "weekly";
