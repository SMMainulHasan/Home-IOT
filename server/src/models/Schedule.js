import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  scheduleId: {
    type: String,
    default: () =>
      Date.now().toString(36).slice(-3) +
      Math.random().toString(36).slice(2, 5),
  },
  deviceId: String,
  name: String,
  hour: Number,
  minute: Number,
  liters: Number,
  isDone: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export const Schedule = mongoose.model("Schedule", scheduleSchema);
