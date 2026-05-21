#include "create_tasks.h"

#include "globals.h"

#include "wifi/wifi_task.h"
#include "sensors/flow_task.h"
#include "pump_control/pump_control_task.h"
#include "websocket/websocket_task.h"
#include "rf_control/rf_receiver_task.h"
#include "rf_control/rf_control_task.h"


void createTasks() {
  xTaskCreatePinnedToCore(wifiTask, "WIFI TASK", 4096, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(flowTask, "FLOW TASK", 4096, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(pumpControlTask, "PUMP CONTROL TASK", 4096, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(websocketTask, "WEBSOCKET TASK", 8192, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(rfReceiverTask,"RF RECEIVER TASK",3000,NULL,1,NULL,0);
  xTaskCreatePinnedToCore(rfControlTask,"RF CONTROL TASK",3000,NULL,1,NULL,1);
}

