import type { DeviceData } from "../../types";
import { PineTrees } from "./PineTrees.tsx";

interface Props {
  deviceData: DeviceData;
}

const now = Date.now();

export default function PlantStatusCard({ deviceData }: Props) {
  const isOnline = now - deviceData.data.timestamp < 3 * 1000;
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
        <div
          className={`
            absolute top-4 left-4
            px-3 py-1
            rounded-full
            border
            text-[11px] font-medium tracking-wide
            backdrop-blur-sm
            transition-all duration-300

            ${
              isOnline
                ? "border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.45)]"
                : "border-red-400/30 text-red-300"
            }
          `}
        >
          {isOnline ? "Device Online" : "Device Offline"}
        </div>
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
