import type { DeviceData } from "../../types";
import { PineTrees } from "./PineTrees.tsx";

interface Props {
  deviceData: DeviceData;
}

export default function PlantStatusCard({ deviceData }: Props) {
  const lastWatered = new Date(
    deviceData.data.lastWaterTime * 1000,
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-slate-900 rounded-2xl p-4 shadow-lg flex items-center justify-between">
      {/* Left */}
      <div>
        <p className="text-slate-400 text-sm">Last Watered</p>
        <h3 className="text-white text-lg font-semibold">{lastWatered}</h3>
        <p className="text-slate-400 text-sm">
          {deviceData.data.lastSessionLiters.toFixed(3)} Liter
        </p>
      </div>

      {/* Center Plant */}
      <div className="w-1/3 flex flex-col items-center">
        <div
          className={`text-4xl transition ${
            deviceData?.data.pumpOn ? "animate-pulse scale-110" : ""
          }`}
        >
          <PineTrees
            className="hover:scale-105 transition-transform duration-300"
            deviceData={deviceData}
          />
        </div>
        {deviceData?.data.pumpOn && (
          <p className="text-green-400 text-xs mt-1">Watering...</p>
        )}
      </div>

      {/* Right */}
      <div className="text-right">
        <p className="text-slate-400 text-sm">Flow Rate</p>
        <h3 className="text-green-400 text-sm font-semibold">
          {deviceData.data.flowRatePerMin.toFixed(3)} L/Min
        </h3>

        <p className="text-slate-400 text-sm mt-1">Session</p>
        <h3 className="text-blue-400 text-sm font-semibold">
          {deviceData.data.sessionLiters.toFixed(3)} L
        </h3>
      </div>
    </div>
  );
}
