import { SCHEDULE_URL } from "../lib/api";
import type { Schedule } from "../types/schedule";

const API = SCHEDULE_URL;

// GET ALL
export async function getSchedules(deviceId: string): Promise<Schedule[]> {
  const res = await fetch(`${API}/?deviceId=${deviceId}`);

  return res.json();
}

// CREATE
export async function createSchedule(
  data: Partial<Schedule>,
): Promise<Schedule> {
  const res = await fetch(API, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  return res.json();
}

// UPDATE
export async function updateSchedule(
  scheduleId: string,
  data: Partial<Schedule>,
): Promise<Schedule> {
  const res = await fetch(`${API}/${scheduleId}`, {
    method: "PATCH",

    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

// DELETE
export async function deleteSchedule(scheduleId: string) {
  const res = await fetch(`${API}/${scheduleId}`, {
    method: "DELETE",
  });

  return res.json();
}
