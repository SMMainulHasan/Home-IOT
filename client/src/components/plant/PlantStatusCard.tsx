import { useEffect, useRef, useState } from "react";
import type { DeviceData } from "../../types";
import { PineTrees } from "./PineTrees.tsx";

interface Props {
  deviceData: DeviceData;
}

export default function PlantStatusCard({ deviceData }: Props) {
  const [isOnline, setIsOnline] = useState(false);
  const lastDataTime = useRef<number>(0);

  useEffect(() => {
    if (deviceData) {
      lastDataTime.current = Date.now();
    }
  }, [deviceData]);

  //only setState inside the interval callback — not in effect body
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Date.now() - lastDataTime.current < 3000);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
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
        {/* Device Status */}
        <div
          className={`
        inline-flex items-center px-2.5  rounded-full
        border text-[10px] font-medium tracking-wide
        transition-all duration-300

        ${
          isOnline
            ? "border-emerald-400/30 text-emerald-300 shadow-[0_0_10px_rgba(74,222,128,0.25)]"
            : "border-slate-700 text-slate-500 opacity-70"
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
        <p className="text-slate-400 text-sm">
          <span className="text-green-400 font-bold">
            {deviceData.data.soilMoisture >= 0
              ? deviceData.data.soilMoisture
              : "N/A"}
            %
          </span>{" "}
          Soil Moist
        </p>
        <h3 className="text-green-400 text-sm font-bold">
          {deviceData.data.flowRatePerMin.toFixed(3)} L/Min
        </h3>
        <p className="text-slate-400 text-sm font-semibold">Session:</p>
        <h3 className="text-green-400 text-sm font-semibold">
          {deviceData.data.sessionLiters.toFixed(3)} L
        </h3>
      </div>
    </div>
  );
}
