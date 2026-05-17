import express from "express";
import { Schedule } from "../models/Schedule.js";
import { getIO } from "../sockets/socket.js";

export const scheduleRoutes = express.Router();

// helper to get esp formatted schedules
export const getEspSchedules = async (deviceId) => {
  const schedules = await Schedule.find({ deviceId, isActive: true }).select(
    "scheduleId hour minute liters isDone -_id",
  );
  return { schedules };
};

// GET ALL
scheduleRoutes.get("/", async (req, res) => {
  try {
    const { deviceId } = req.query; // ?deviceId=ESP32_1
    const schedules = await Schedule.find(deviceId ? { deviceId } : {});
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
scheduleRoutes.post("/", async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    const { deviceId } = req.body;

    const espSchedules = await getEspSchedules(deviceId);

    // sync to ESP32
    getIO().to(deviceId).emit("schedule:sync", espSchedules);

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
scheduleRoutes.patch("/:id", async (req, res) => {
  try {
    const updated = await Schedule.findOneAndUpdate(
      { scheduleId: req.params.id },
      req.body,
      { new: true },
    );

    const espSchedules = await getEspSchedules(updated.deviceId);

    getIO().to(updated.deviceId).emit("schedule:sync", espSchedules);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
scheduleRoutes.delete("/:id", async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ scheduleId: req.params.id });
    await schedule.deleteOne();

    const espSchedules = await getEspSchedules(schedule.deviceId);

    getIO().to(schedule.deviceId).emit("schedule:sync", espSchedules);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
