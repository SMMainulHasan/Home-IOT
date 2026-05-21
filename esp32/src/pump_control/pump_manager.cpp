#include "pump_manager.h"
#include "globals.h"
#include "pins.h"



bool turnOnPump(){
    bool pumpOn;
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    pumpOn = systemContext.pumpOn;
    xSemaphoreGive(dataMutex);
    
    if(pumpOn){
        // Serial.println("Pump is already ON");
        return false;
    }
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    systemContext.pumpOn = true;
    xSemaphoreGive(dataMutex);

    digitalWrite(RELAY_PIN, HIGH);
    return true;
}

bool turnOffPump(){
   bool pumpOn;
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    pumpOn = systemContext.pumpOn;
    xSemaphoreGive(dataMutex);
    
    if(!pumpOn){
        // Serial.println("Pump is already OFF");
        return false;
    }

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    systemContext.pumpOn = false;
    xSemaphoreGive(dataMutex);

    digitalWrite(RELAY_PIN, LOW);
    return true;
}

void shakeSolenoid(int pulses, int pulseMs) {
  for (int i = 0; i < pulses; i++) {
    turnOnPump();
    vTaskDelay(pulseMs / portTICK_PERIOD_MS);
    turnOffPump();
    vTaskDelay(pulseMs / portTICK_PERIOD_MS);
  }
  // Reset after purge — don't count purge water
  xSemaphoreTake(dataMutex, portMAX_DELAY);
  systemContext.sessionLiters = 0;
  xSemaphoreGive(dataMutex);

  Serial.println("✅ shakeSolenoid complete");
}