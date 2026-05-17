#include "rf_control/rf_control.h"
#include "globals.h"
#include "pins.h"

void initRfQueue() {
  mySwitch.enableReceive(digitalPinToInterrupt(RF_RECEIVER_PIN));
  
  rfQueue = xQueueCreate(10, sizeof(long));

  if (rfQueue == NULL) {
    Serial.println("Queue creation failed!");
    while (true) {
      delay(1000);
    }
  }
};