import TelegramBot from "node-telegram-bot-api";
import { logger } from "../utils/logger.js";

let bot = null;

export const initTelegram = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    logger.warn("⚠️ Telegram bot token not set");
    return;
  }

  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  logger.info("✅ Telegram bot initialized");
};

export const notify = async (message) => {
  if (!bot) {
    logger.warn("⚠️ Telegram bot not initialized");
    return;
  }

  try {
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
      parse_mode: "HTML", // allows <b>bold</b> etc
    });
    logger.info(`📨 Telegram sent: ${message}`);
  } catch (err) {
    logger.error(`❌ Telegram failed: ${err.message}`);
  }
};
