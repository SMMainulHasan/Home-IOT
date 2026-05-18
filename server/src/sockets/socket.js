import { Schedule } from "../models/Schedule.js";
import { getEspSchedules } from "../routes/schedule.route.js";
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
    logger.info(`Client connected: ${socket.id}`);

    // Identify client type (frontend or ESP32)
    socket.on("register", async ({ type, deviceId, userId }) => {
      if (type === "device") {
        devices.set(deviceId, socket.id);
        socket.join(deviceId); // ✅ join room

        try {
          const espSchedules = await getEspSchedules(deviceId);
          // sync to ESP32
          io.to(deviceId).emit("schedule:sync", espSchedules);
        } catch (err) {
          logger.info(err);
        }

        logger.info(`Device registered: ${deviceId}`);
      }

      if (type === "client") {
        socket.join(deviceId); // deviceId is esp's devices ID Always!
        logger.info(`Frontend connected: ${socket.id}`);
        userDevices.set(userId, deviceId); // track which device this user owns
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

      //  STATE_IDLE = 0,STATE_WATERING = 1, STATE_DELAYED = 2, STATE_MANUAL = 3, STATE_BLOCKED = 4
      //Notify when watering starts (state changed from 0 to 1)
      if (prevState === 0 && data.state === 1) {
        notify(
          `🌱 <b>Schedule watering started!</b>\n` +
            `💧 It will water ${data.targetLiters}L\n` +
            `🕐 ${new Date().toLocaleTimeString()}\n`,
        );
      }
      //Notify when watering completed (state changed from 1 to 0)
      else if (prevState === 1 && data.state === 0) {
        notify(
          `✅ <b>Schedule watering completed!</b>\n` +
            `💧 It watered ${data.lastSessionLiters}L\n` +
            `🕐 ${new Date().toLocaleTimeString()}\n`,
        );
      }
      //Watering delayed (state changed from 1 to 2)
      else if (prevState === 1 && data.state === 2) {
        notify(
          `⏳ <b>Watering delayed!</b>\n` +
            `💧 Not enough water flow\n` +
            `🕐 ${new Date().toLocaleTimeString()}\n`,
        );
      }
      //Trying again (state changed from 2 to 1)
      else if (prevState === 2 && data.state === 1) {
        notify(
          `🔄 <b>Trying again to water!</b>\n` +
            `💧 Target liters: ${data.targetLiters}L\n` +
            `💧 It watered till now ${data.sessionLiters}L\n` +
            `🕐 ${new Date().toLocaleTimeString()}\n`,
        );
      }
      prevState = data.state; // Update previous state
    });

    // Disconnect
    socket.on("disconnect", () => {
      logger.info(`Disconnected: ${socket.id}`);

      for (const [deviceId, id] of devices.entries()) {
        if (id === socket.id) {
          devices.delete(deviceId);
          logger.warn(`Device removed: ${deviceId}`);
        }
      }
    });
  });
};

export function getIO() {
  return ioInstance;
}
