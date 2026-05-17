#include "shared_data.h"
#include "globals.h"



void initSharedData() {
  dataMutex = xSemaphoreCreateMutex();

  if (dataMutex == NULL) {
    Serial.println("Failed to create mutex");
    while (true);
  }
}