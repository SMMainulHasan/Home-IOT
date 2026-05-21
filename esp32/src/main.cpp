#include <Arduino.h>

#include "config.h"
#include "create_tasks.h"
#include "wifi/wifi_manager.h"
#include "storage/schedules_storage.h"
#include "storage/state_storage.h"
#include "sensors/flow_sensor.h"
#include "time/time_manager.h"
#include "data/shared_data.h"
#include "sensors/dht_sensor.h"
#include "sensors/soil_moisture.h"
#include "rf_control/rf_control.h"



void setup() {
  Serial.begin(115200);

  initSharedData();  
  mountFileSystem();
  loadState();  
  loadSchedules();  
  initRTC(); 
  initWiFi(WIFI_SSID, WIFI_PASSWORD);
  initFlowSensor();
  initDHT();
  initSoilSensor();
  initRfQueue();
  
  createTasks();
}

void loop() {
}