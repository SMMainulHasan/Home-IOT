#include "flow_sensor.h"
#include "globals.h"
#include "pins.h"

void IRAM_ATTR flowISR() {
  pulseCount++;
};

void initFlowSensor() {
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(
    digitalPinToInterrupt(FLOW_SENSOR_PIN),
    flowISR,
    RISING
  );
};