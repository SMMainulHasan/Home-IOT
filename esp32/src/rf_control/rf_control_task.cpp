#include "rf_control_task.h"

#include "globals.h"
#include "pins.h"
#include "config.h"

void rfControlTask(void *pvParameters) {

  long sequence[3];

  while (true) {

    // 💤 Wait forever for first item
    if (xQueueReceive(rfQueue, &sequence[0], portMAX_DELAY) == pdTRUE) {

      // ⏳ Wait for next 2 items (within time window)
      if (xQueueReceive(rfQueue, &sequence[1], pdMS_TO_TICKS(1000)) == pdTRUE &&
          xQueueReceive(rfQueue, &sequence[2], pdMS_TO_TICKS(1000)) == pdTRUE) {

        Serial.println(sequence[0]);
        Serial.println(sequence[1]);
        Serial.println(sequence[2]);

        // 🎯 Check combo
        if (sequence[0] == RF_FanUP &&
            sequence[1] == RF_FanDown &&
            sequence[2] == RF_FanUP) {

          Serial.println("Valid RF combo → Toggle pump");
          xSemaphoreTake(dataMutex, portMAX_DELAY);
          systemContext.manualPump = !systemContext.manualPump;
          xSemaphoreGive(dataMutex);

        } else {
          Serial.println("Invalid RF combo");
        }

      } else {
        // ❌ Didn't get full 3 items in time → discard
        Serial.println("Timeout: incomplete sequence");
      }
    }
  }
}