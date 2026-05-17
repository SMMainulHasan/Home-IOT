import { io } from "socket.io-client";
import { WS_URL } from "./lib/api";

export const socket = io(WS_URL, {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🟢 Connected to server:", socket.id);

  socket.emit("register", {
    type: "client",
    deviceId: "ESP32_1",
    userId: "client_1",
  });
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from server");
});
