import cors from "cors";
import express from "express";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { scheduleRoutes } from "./routes/schedule.route.js";

export const createApp = () => {
  const app = express();

  // MIDDLEWARE
  app.use(cors({ origin: config.clientUrl }));
  app.use(express.json());

  // ROUTES
  app.use("/api/schedules", scheduleRoutes);

  app.get("/", (req, res) => {
    res.json({ status: "Server is running 🚀" });
  });

  app.use(errorHandler);

  return app;
};
