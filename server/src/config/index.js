import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  clientUrl: ["http://localhost:5173", process.env.CLIENT_URL],
};
