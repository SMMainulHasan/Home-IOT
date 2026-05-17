#pragma once


#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <time.h>
#include <RCSwitch.h>

#include "types.h"

// GLOBAL OBJECTS
extern Preferences preferences;
extern WebSocketsClient webSocket;
extern SemaphoreHandle_t dataMutex;
extern RCSwitch mySwitch;

// SHARED DATA
extern SystemContext systemContext;

// SYSTEM STATE
extern bool isWifiConnected;
extern bool configDirty;

extern QueueHandle_t rfQueue;

extern volatile uint32_t pulseCount;
