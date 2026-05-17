import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/index.js";
import { initSockets } from "./sockets/socket.js";
import { logger } from "./utils/logger.js";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ["GET", "POST"],
  },
});

connectDB();

initSockets(io);

server.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
});
