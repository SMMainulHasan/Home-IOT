import { Schedule } from "../models/Schedule.js";
import { getEspSchedules } from "../routes/schedule.route.js";
import { sendWateringNotification } from "../services/sendWateringNotification.js";
import { notify } from "../services/telegram.js";
import { logger } from "../utils/logger.js";

const devices = new Map(); // deviceId -> socket.id
const userDevices = new Map(); // It will need in future when I add more esp or user auth
const deviceSessions = new Map(); // deviceId -> "id1:true,id2:false,..."

let ioInstance = null;
let prevState = null; //previous watering state

export const initSockets = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    // Identify client type (frontend or ESP32)
    socket.on("register", async ({ type, deviceId, userId }) => {
      if (type === "device") {
        devices.set(deviceId, socket.id);
        socket.join(deviceId); // ✅ join room
        logger.info(`Device registered: ${deviceId}`);
        await notify(
          `🟢  <b>Device Online</b>\n` +
            `─────────────────\n` +
            `📡  <b>Device ID:</b> <code>${deviceId}</code>\n` +
            `<i>Your plant system is up and running.</i>\n`,
        );

        try {
          const espSchedules = await getEspSchedules(deviceId);
          // sync to ESP32
          io.to(deviceId).emit("schedule:sync", {
            schedules: espSchedules,
            serverTime: Math.floor(Date.now() / 1000), // ✅ unix timestamp in seconds
          });
        } catch (err) {
          logger.info(err);
        }
      }

      if (type === "client") {
        userDevices.set(userId, deviceId); // track which device this user owns
        socket.join(deviceId); // deviceId is esp's devices ID Always!
        logger.info(`Frontend Registered: ${socket.id}`);
      }
    });

    // Control device from frontend
    socket.on("device-control", ({ deviceId, command }) => {
      const deviceSocketId = devices.get(deviceId);

      if (deviceSocketId) {
        io.to(deviceSocketId).emit("device-control", command);
      } else {
        logger.warn(`Device not found: ${deviceId}`);
      }
    });

    // Receive data from ESP32
    socket.on("device-data", async ({ deviceId, data }) => {
      //only send to clients in this device's room
      socket.to(deviceId).emit("device-data", { deviceId, data });
      // logger.info(`Data from ${deviceId}: ${JSON.stringify(data)}`);

      //update isDone in DB if sessions exist and changed
      if (data.sessions?.length) {
        const newHash = data.sessions
          .map((s) => `${s.scheduleId}:${s.waterDone}`)
          .join(",");
        const cachedHash = deviceSessions.get(deviceId);

        if (newHash !== cachedHash) {
          deviceSessions.set(deviceId, newHash);
          try {
            for (const session of data.sessions) {
              await Schedule.updateOne(
                { scheduleId: session.scheduleId, deviceId },
                { $set: { isDone: session.waterDone } },
              );
            }
            logger.info(`💾 isDone updated for ${deviceId}`);
          } catch (err) {
            logger.error(`DB update failed: ${err.message}`);
          }
        }
      }

      // Check watering state changes and send notifications
      sendWateringNotification(prevState, data);
      prevState = data.state; // Update previous state
    });

    // Disconnect
    socket.on("disconnect", async () => {
      logger.info(`Disconnected: ${socket.id}`);

      for (const [deviceId, id] of devices.entries()) {
        if (id === socket.id) {
          devices.delete(deviceId);
          logger.warn(`Device removed: ${deviceId}`);
          await notify(
            `🔴  <b>Device Offline</b>\n` +
              `─────────────────\n` +
              `📡  <b>Device ID:</b> <code>${deviceId}</code>\n` +
              `<i>Connection lost. Check your device.</i>\n`,
          );
        }
      }
    });
  });
};

export function getIO() {
  return ioInstance;
}
