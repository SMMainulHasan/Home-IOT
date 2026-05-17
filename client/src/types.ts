export type PumpState =
  | "STATE_IDLE"
  | "STATE_WATERING"
  | "STATE_DELAYED"
  | "STATE_MANUAL"
  | "STATE_BLOCKED";

export interface Session {
  hour: number;
  minute: number;
  liters: number;
  waterDone: boolean;
}

export interface DeviceData {
  deviceId: string;
  data: {
    paused: boolean;
    manualPump: boolean;
    flowRatePerMin: number;
    sessionLiters: number;
    targetLiters: number;
    pumpOn: boolean;
    state: PumpState;
    sessions: Session[];
    lastWaterTime: number;
    lastSessionLiters: number;
  };
}
