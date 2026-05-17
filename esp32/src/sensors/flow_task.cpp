#include "flow_task.h"

#include "globals.h"


void flowTask(void *pvParameters) {
  while (true) {
    uint32_t count;
    // Safely copy pulse count
    noInterrupts();
    count = pulseCount;
    pulseCount = 0;
    interrupts();
    
    float flowRatePerSec = 2.41 * count; // 1 pulse= 2.41 or calibration factor is 2.41  flow sensor
    float liters = flowRatePerSec / 1000.0; // Convert to liters per second
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    systemContext.sessionLiters += liters;
    systemContext.flowRatePerMin = liters*60; // Convert to liters per minute
    
    // Serial.printf("Flow: %.2f L/min | Total: %.3f L\n", systemContext.flowRatePerMin, systemContext.sessionLiters);
    xSemaphoreGive(dataMutex);

    vTaskDelay(1000 / portTICK_PERIOD_MS);
  }
}
