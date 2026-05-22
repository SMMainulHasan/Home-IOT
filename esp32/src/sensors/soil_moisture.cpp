#include "soil_moisture.h"
#include "globals.h"
#include "pins.h"

void initSoilSensor() {
  pinMode(SOIL_POWER_PIN, OUTPUT);

  // keep sensor OFF initially
  digitalWrite(SOIL_POWER_PIN, LOW);
}

void soilTask(void *pvParameters) {
    int soilMoisture = 0;

  while (true) {

    // 🌿 Turn sensor ON
    digitalWrite(SOIL_POWER_PIN, HIGH);

    // wait sensor stabilize
    vTaskDelay(300 / portTICK_PERIOD_MS);

    // take multiple readings
    long total = 0;

    for (int i = 0; i < 10; i++) {
      total += analogRead(SOIL_SENSOR_PIN);
      vTaskDelay(20 / portTICK_PERIOD_MS);
    }

    // 🌿 Turn sensor OFF
    digitalWrite(SOIL_POWER_PIN, LOW);

    int rawValue = total / 10;

    // convert to percentage
    soilMoisture = map(rawValue, 4095, 700, 0, 100); // in air, 4095 is 0% and 700 is 100%

    soilMoisture = constrain(soilMoisture, 0, 100);

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    systemContext.soilMoisture = soilMoisture;
    xSemaphoreGive(dataMutex);

    Serial.print("🌱 Soil Moisture: ");
    Serial.print(soilMoisture);
    Serial.println("%");

    vTaskDelay(60000 / portTICK_PERIOD_MS);
  }
}