#include "globals.h"


Preferences preferences;
WebSocketsClient webSocket;
SemaphoreHandle_t dataMutex;
RCSwitch mySwitch = RCSwitch();

// SensorData sensorData;
SystemContext systemContext; 

bool isWifiConnected = false;
bool configDirty = false;

QueueHandle_t rfQueue;

volatile uint32_t pulseCount = 0;