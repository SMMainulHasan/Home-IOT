import { useEffect, useState } from "react";
import ControlGrid from "./components/controls/ControlGrid";
import PlantStatusCard from "./components/plant/PlantStatusCard";
import WateringScheduleSection from "./components/schedule/SchedulesSection";
import { socket } from "./socket";
import type { DeviceData } from "./types";

export default function App() {
  const [deviceData, setDeviceData] = useState<DeviceData>({
    deviceId: "",
    data: {
      paused: false,
      manualPump: false,
      flowRatePerMin: 0,
      sessionLiters: 0,
      lastSessionLiters: 0,
      targetLiters: 0,
      pumpOn: false,
      state: "STATE_IDLE",
      sessions: [],
      lastWaterTime: 0,
    },
  });

  useEffect(() => {
    const onDeviceData = (payload: DeviceData) => {
      setDeviceData({
        ...payload,
      });
    };

    socket.on("device-data", onDeviceData);

    return () => {
      socket.off("device-data", onDeviceData);
    };
  }, [deviceData]);

  return (
    <div className="bg-slate-950 min-h-screen p-4">
      <PlantStatusCard deviceData={deviceData} />
      <ControlGrid deviceData={deviceData} />
      <WateringScheduleSection />
    </div>
  );
}
