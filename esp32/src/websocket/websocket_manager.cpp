#include "websocket_manager.h"
#include "pump_control/pump_manager.h"
#include "globals.h"
#include "config.h"


void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {

    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");

      webSocket.sendTXT("40"); // Socket.IO handshake
      webSocket.sendTXT("42[\"register\", {\"type\":\"device\", \"deviceId\":\"ESP32_1\"}]");
      break;

    case WStype_TEXT: {

      // Check for Engine.IO Ping (2)
      if (payload[0] == '2') {
          // Send Engine.IO Pong (3)
          webSocket.sendTXT("3");
          Serial.println("🏓 Heartbeat: Pong sent");
      } 
      // Check for Socket.IO Message (4...)
      else if (payload[0] == '4') {
        Serial.printf("📩 Message received: %s\n", payload);
      
        String msg = String((char*)payload);
        Serial.println(msg);

        if (msg.startsWith("42")) {
          msg = msg.substring(2);

          StaticJsonDocument<512> doc;

          DeserializationError err = deserializeJson(doc, msg);
          if (err) {
            Serial.println("❌ JSON parse failed");
            break;
          }

          if (!doc.is<JsonArray>() || doc.size() < 2) {
            Serial.println("❌ Invalid WS format");
            break;
          }

          String event = doc[0].as<String>();
          JsonObject data = doc[1];

          Serial.print("📩 Event: ");
          Serial.println(event);

          Serial.print("📦 Data: ");
          serializeJson(data, Serial);
          Serial.println();

          // ---- DEVICE CONTROL ----
          if (event == "device-control") {

            if (data["manualPump"].is<bool>()) {
              xSemaphoreTake(dataMutex, portMAX_DELAY);
              systemContext.targetLiters= MANUAL_PUMP_TARGET_LIMIT;
              systemContext.manualPump = data["manualPump"];
              xSemaphoreGive(dataMutex);
              
              Serial.printf("🔭 Manual pump Control Received.");
            }

            // //Code for RF Signal Transmissions
            // if (data.containsKey("light_1")) {
            //   //Code for RF Light control here
            // }

          }

          // ---- SCHEDULE UPDATE ----
          if (event == "schedule:sync") {
            if (data["schedules"].is<JsonArray>()) {
              JsonArray schedules = data["schedules"].as<JsonArray>();

              xSemaphoreTake(dataMutex, portMAX_DELAY);
              
              systemContext.sessions.clear();

              for (JsonObject s : schedules) {
                Session session;
                session.id        = s["scheduleId"].as<String>();
                session.hour      = s["hour"].as<int>();
                session.minute    = s["minute"].as<int>();
                session.liters    = s["liters"].as<float>();
                session.waterDone = s["isDone"].as<bool>();

                systemContext.sessions.push_back(session);
              }

              xSemaphoreGive(dataMutex);
              
              Serial.printf("✅ %d schedules synced\n", systemContext.sessions.size());
            }
          }
        }
      }

      break;
    }

    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;

    default:
      break;
  }
}