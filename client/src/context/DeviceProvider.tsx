import { useState } from "react";
import { DeviceContext } from "./DeviceContext";

export const DeviceProvider = ({ children }: { children: React.ReactNode }) => {
  const [deviceId, setDeviceId] = useState<string>("ESP32_1"); // default or from localStorage

  return (
    <DeviceContext.Provider value={{ deviceId, setDeviceId }}>
      {children}
    </DeviceContext.Provider>
  );
};
