#include <Arduino.h>

#include "config.h"
#include "create_tasks.h"
#include "wifi/wifi_manager.h"
#include "storage/state_storage.h"
#include "sensors/flow_sensor.h"
#include "data/shared_data.h"
#include "rf_control/rf_control.h"



void setup() {
  Serial.begin(115200);

  mountFileSystem();
  initSharedData();
  loadConfig();

  initWiFi(WIFI_SSID, WIFI_PASSWORD);
  initFlowSensor();
  initRfQueue();
  
  createTasks();
}

void loop() {
}