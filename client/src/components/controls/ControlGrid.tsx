import {
  Droplet,
  Fan,
  Lightbulb,
  MoreHorizontal,
  Settings,
  Thermometer,
} from "lucide-react";
import { socket } from "../../socket";
import type { DeviceData } from "../../types";
import ControlButton from "./ControlButton";

interface Props {
  deviceData: DeviceData;
}

export default function ControlGrid({ deviceData }: Props) {
  const isManualPump = deviceData?.data.manualPump;
  const pumpHandler = () => {
    socket.emit("device-control", {
      deviceId: "ESP32_1",
      command: { manualPump: !isManualPump },
    });
  };
  return (
    <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
      <ControlButton
        icon={<Droplet size={20} />}
        label={isManualPump ? "Stop" : "Water"}
        value={isManualPump ? "Watering" : "Start"}
        onClick={pumpHandler}
      />

      <ControlButton
        icon={<Thermometer size={20} />}
        label="Temperature"
        value="28°C"
      />

      <ControlButton icon={<Lightbulb size={20} />} label="Light" value="On" />

      <ControlButton icon={<Fan size={20} />} label="Fan" value="On" />

      <ControlButton icon={<Settings size={20} />} label="Settings" />

      <ControlButton icon={<MoreHorizontal size={20} />} label="More" />
    </div>
  );
}
