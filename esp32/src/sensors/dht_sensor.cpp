#include "dht_sensor.h"
#include <DHT.h>
#include "globals.h"
#include "pins.h"

#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);

void initDHT() {
  pinMode(DHT_PIN, INPUT);
  dht.begin();
  Serial.println("✅ DHT11 initialized");
}

float getTemperature() {
  float t = dht.readTemperature();
  if (isnan(t)) {
    Serial.println("❌ DHT11 temperature read failed");
    return -1;
  }
  return t;
}

float getHumidity() {
  float h = dht.readHumidity();
  if (isnan(h)) {
    Serial.println("❌ DHT11 humidity read failed");
    return -1;
  }
  return h;
}


void dhtTask(void *pvParameters) {
  while (true) {
    float t = getTemperature();
    float h = getHumidity();

    if (!isnan(t) && !isnan(h)) {
      xSemaphoreTake(dataMutex, portMAX_DELAY);
      systemContext.temperature = t;
      systemContext.humidity    = h;
      xSemaphoreGive(dataMutex);
    }

    vTaskDelay(2000 / portTICK_PERIOD_MS); // DHT11 needs 2s between reads
  }
}