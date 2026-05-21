#include "globals.h"
#include <RTClib.h>





Preferences preferences;
WebSocketsClient webSocket;
SemaphoreHandle_t dataMutex;
RCSwitch mySwitch = RCSwitch();

// SensorData sensorData;
SystemContext systemContext; 

RTC_DS3231 rtc;
bool rtcAvailable = false;
bool isWifiConnected = false;
bool configDirty = false;

QueueHandle_t rfQueue;

volatile uint32_t pulseCount = 0;