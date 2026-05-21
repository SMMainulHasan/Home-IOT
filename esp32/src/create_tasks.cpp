#include "create_tasks.h"

#include "globals.h"

#include "wifi/wifi_task.h"
#include "sensors/flow_task.h"
#include "pump_control/pump_control_task.h"
#include "websocket/websocket_task.h"
#include "sensors/dht_sensor.h"
#include "rf_control/rf_receiver_task.h"
#include "rf_control/rf_control_task.h"
#include "sensors/soil_moisture.h"


void createTasks() {
  //core 0 for WiFi and WebSocket (networking tasks)
  xTaskCreatePinnedToCore(wifiTask,         "WIFI TASK",         4096, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(websocketTask,    "WEBSOCKET TASK",    8192, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(rfReceiverTask,   "RF RECEIVER TASK",  3000, NULL, 1, NULL, 0);
  //core 1 for sensor reading and pump control (time-sensitive tasks)
  xTaskCreatePinnedToCore(flowTask,         "FLOW TASK",         4096, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(pumpControlTask,  "PUMP CONTROL TASK", 4096, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(dhtTask,          "DHT TASK",          3072, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(rfControlTask,    "RF CONTROL TASK",   3000, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(soilTask,         "SOIL TASK",         4096, NULL, 1, NULL, 1);
}

