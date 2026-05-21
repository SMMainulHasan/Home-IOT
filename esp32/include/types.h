#pragma once

#include <vector>

enum PumpState {
  STATE_IDLE,
  STATE_WATERING,
  STATE_DELAYED,
  STATE_MANUAL,
  STATE_BLOCKED
};

struct Session {
  String id;
  int hour;
  int minute;
  float liters;
  bool waterDone;
};

struct SystemContext {
  bool paused;
  bool manualPump;
  float flowRatePerMin;
  float sessionLiters;
  float targetLiters;
  bool pumpOn;
  PumpState state = STATE_IDLE;
  std::vector<Session> sessions;
  unsigned long lastWaterTime;
  float lastSessionLiters;
  float temperature;
  float humidity;
  float soilMoisture;
};