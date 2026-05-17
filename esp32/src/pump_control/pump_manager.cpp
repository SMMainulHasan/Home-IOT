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
