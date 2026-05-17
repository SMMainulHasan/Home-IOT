#include "globals.h"
#include "pins.h"
#include "wifi_manager.h"

void wifiTask(void *pvParameters) {
  pinMode(LED_BUILTIN, OUTPUT);

  while (true) {

    if (!isWiFiConnected()) {
      isWifiConnected = false;
      digitalWrite(LED_BUILTIN, LOW);
      Serial.println("[WiFi] Not connected — retrying...");

      // ✅ force reconnect — fixes power cut issue
      WiFi.disconnect();
      delay(1000);
      WiFi.reconnect();

    } else if (!isWifiConnected) {
      // just became connected
      isWifiConnected = true;
      digitalWrite(LED_BUILTIN, HIGH);
      Serial.println("[WiFi] Connected: " + WiFi.localIP().toString());
    }

    vTaskDelay(5000 / portTICK_PERIOD_MS);
  }
}