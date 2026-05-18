#include "websocket/websocket_task.h"
#include "websocket/websocket_manager.h"

#include "globals.h"
#include "config.h"

void websocketTask(void *pvParameters) {

  // webSocket.begin(WS_HOST, WS_PORT, WS_PATH);
  webSocket.beginSSL(
  "home-iot.onrender.com",
  443,
  "/socket.io/?EIO=4&transport=websocket"
);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  while (true) {
    webSocket.loop();

    static unsigned long lastSend = 0;

    if (millis() - lastSend > 1000) {
      lastSend = millis();

      JsonDocument doc;
      

      xSemaphoreTake(dataMutex, portMAX_DELAY);
      doc["timestamp"]          = millis();
      doc["paused"]             = systemContext.paused;
      doc["manualPump"]         = systemContext.manualPump;
      doc["flowRatePerMin"]     = systemContext.flowRatePerMin;
      doc["sessionLiters"]      = systemContext.sessionLiters;
      doc["lastSessionLiters"]  = systemContext.lastSessionLiters;
      doc["targetLiters"]       = systemContext.targetLiters;
      doc["pumpOn"]             = systemContext.pumpOn;
      doc["state"]              = systemContext.state;
      doc["lastWaterTime"]      = systemContext.lastWaterTime;

      JsonArray sessions = doc["sessions"].to<JsonArray>();
      for (const Session& s : systemContext.sessions) {
        JsonObject session    = sessions.add<JsonObject>();
        session["scheduleId"] = s.id;
        session["waterDone"]  = s.waterDone;
      }
      xSemaphoreGive(dataMutex);

      JsonDocument payload;
      payload["deviceId"] = "ESP32_1";
      payload["data"] = doc;
      
      String payloadStr;
      serializeJson(payload, payloadStr);

      // Socket.IO format
      String message = "42[\"device-data\"," + payloadStr + "]";
      webSocket.sendTXT(message);
    }

    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
};