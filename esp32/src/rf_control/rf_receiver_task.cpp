#include "globals.h"

#include "rf_receiver_task.h"


void rfReceiverTask(void *pvParameters) {

  long lastCode = 0;
  long receivedCode;
  unsigned long lastTime = 0;

  while (true) {
    if (mySwitch.available()) {
      receivedCode = mySwitch.getReceivedValue();
      mySwitch.resetAvailable();
      
      if (millis() - lastTime > 1000) {
        xQueueReset(rfQueue);
        lastCode = 0;
      }
      if(receivedCode == lastCode){
        continue;
      }
      lastCode = receivedCode;
      lastTime = millis();
      xQueueSend(rfQueue, &receivedCode, portMAX_DELAY);
    }

    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}