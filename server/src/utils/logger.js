import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.prettyPrint(),
    // winston.format.printf(({ timestamp, level, message }) => {
    //   return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    // }),
  ),
  transports: [new winston.transports.Console()],
});
