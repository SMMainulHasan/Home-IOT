#include "wifi_manager.h"
#include "globals.h"

void initWiFi(const char* ssid, const char* password) {
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(ssid, password);
  Serial.println("[WiFi] Initialization started...");
}

bool isWiFiConnected() {
  return WiFi.status() == WL_CONNECTED;
}