const BASE = `http://${window.location.hostname}:${import.meta.env.VITE_SERVER_PORT}`;

export const WS_URL = `ws://${window.location.hostname}:${import.meta.env.VITE_SERVER_PORT}`;
export const SCHEDULE_URL = `${BASE}/api/schedules`;
