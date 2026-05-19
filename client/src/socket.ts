import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SERVER_HOST, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 3000,
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
