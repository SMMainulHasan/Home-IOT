import { createContext } from "react";

interface DeviceContextType {
  deviceId: string;
  setDeviceId: (id: string) => void;
}

export const DeviceContext = createContext<DeviceContextType | null>(null);
