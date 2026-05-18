function sendWateringNotification(prevState, data) {
  const time = new Date().toLocaleTimeString();

  // 🌿 Watering Started
  if (prevState === 0 && data.state === 1) {
    notify(
      `🌿 <b>Watering Cycle Started</b>\n\n` +
        `🚿 Target Water: <b>${data.targetLiters}L</b>\n` +
        `⚙️ Pump Status: Active\n` +
        `🕒 ${time}`,
    );
  }

  // ✔️ Watering Completed
  else if (prevState === 1 && data.state === 0) {
    notify(
      `✔️ <b>Watering Completed</b>\n\n` +
        `🚿 Delivered Water: <b>${data.lastSessionLiters}L</b>\n` +
        `🌿 Soil hydration updated\n` +
        `🕒 ${time}`,
    );
  }

  // 🚨 Watering Delayed
  else if (prevState === 1 && data.state === 2) {
    notify(
      `🚨 <b>Flow Issue Detected</b>\n\n` +
        `📡 Water flow is below expected level\n` +
        `📅 Automatic retry in 15 minutes\n` +
        `🕒 ${time}`,
    );
  }

  // ↻ Retry Started
  else if (prevState === 2 && data.state === 1) {
    notify(
      `↻ <b>Retrying Watering Cycle</b>\n\n` +
        `🎯 Target Water: <b>${data.targetLiters}L</b>\n` +
        `🚿 Delivered So Far: <b>${data.sessionLiters}L</b>\n` +
        `⚙️ Pump Status: Active\n` +
        `🕒 ${time}`,
    );
  }

  // 🖐️ Manual Watering
  else if (data.state === 3) {
    notify(
      `🖐️ <b>Manual Watering Enabled</b>\n\n` +
        `⚙️ Pump controlled manually\n` +
        `🕒 ${time}`,
    );
  }

  // ⛔ Blocked State
  else if (data.state === 4) {
    notify(
      `⛔ <b>Watering Blocked</b>\n\n` +
        `📡 System paused due to safety condition\n` +
        `🕒 ${time}`,
    );
  }
}
