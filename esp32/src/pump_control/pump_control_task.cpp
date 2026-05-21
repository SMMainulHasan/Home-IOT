#include "pump_control_task.h"
#include "storage/state_storage.h"
#include "storage/schedules_storage.h"
#include "pump_control/pump_manager.h"
#include "globals.h"
#include "config.h"
#include "pins.h"

// ---- HELPER: handle paused/manual interrupts ----
// returns true if state was changed (caller should break)
bool handleInterrupts(PumpState& state, bool paused, bool manual) {
  if (paused) {
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    systemContext.state = STATE_BLOCKED;
    xSemaphoreGive(dataMutex);
    state = STATE_BLOCKED;
    return true;
  }

  if (manual) {
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    systemContext.sessionLiters = 0;
    systemContext.state         = STATE_MANUAL;
    xSemaphoreGive(dataMutex);
    state = STATE_MANUAL;
    return true;
  }

  return false;
}

void pumpControlTask(void *pvParameters) {
  pinMode(RELAY_PIN, OUTPUT);

  unsigned long lastFlowTime = millis();

  while (true) {

    // ---- LOCAL COPY (primitives only) ----
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    PumpState state         = systemContext.state;
    bool paused             = systemContext.paused;
    bool manual             = systemContext.manualPump;
    float flow              = systemContext.flowRatePerMin;
    float target            = systemContext.targetLiters;
    time_t lastWater        = systemContext.lastWaterTime;
    float sessionLiters     = systemContext.sessionLiters;
    float lastSessionLiters = systemContext.lastSessionLiters;
    xSemaphoreGive(dataMutex);

    // ---- TIME ----
    time_t now = time(nullptr);
    struct tm nowTm;
    localtime_r(&now, &nowTm);

    bool isTimeSynced = time(nullptr) > 1700000000;
    

    int hour   = nowTm.tm_hour;
    int minute = nowTm.tm_min;

    struct tm lastTm;
    localtime_r(&lastWater, &lastTm);

    bool isNewDay =
      (nowTm.tm_year != lastTm.tm_year) ||
      (nowTm.tm_yday != lastTm.tm_yday);

    // ---- FLOW TRACK ----
    if (flow > 1) {
      lastFlowTime = millis();
    }

    // ---- FSM ----
    switch (state) {

      case STATE_IDLE:

        //ON/OFF solenoid if water flow without watering session
        if(sessionLiters > 0.500){
          shakeSolenoid(3, 500); // 3 times in 500ms intervals
        }

        if (isTimeSynced && isNewDay) {
          xSemaphoreTake(dataMutex, portMAX_DELAY);
          for (Session& s : systemContext.sessions) s.waterDone = false;
          systemContext.lastWaterTime = now;
          xSemaphoreGive(dataMutex);
          Serial.println("🌄 New day → Reset");
        }

        if (handleInterrupts(state, paused, manual)) break;

        {
          Session* matched = nullptr;

          xSemaphoreTake(dataMutex, portMAX_DELAY);
          for (Session& s : systemContext.sessions) {
            if (s.hour == hour && s.minute == minute && !s.waterDone) {
              matched = &s;
              break;
            }
          }
          xSemaphoreGive(dataMutex);

          if (matched) {
            lastFlowTime = millis();
            xSemaphoreTake(dataMutex, portMAX_DELAY);
            matched->waterDone          = true;
            systemContext.targetLiters  = matched->liters;
            systemContext.sessionLiters = 0;
            systemContext.state         = STATE_WATERING;
            xSemaphoreGive(dataMutex);
            state = STATE_WATERING;
            Serial.println("⏰ Scheduled watering started");
          }
        }

        break;

      case STATE_MANUAL:

        if (!manual || sessionLiters >= target) {
          turnOffPump();
          xSemaphoreTake(dataMutex, portMAX_DELAY);
          systemContext.manualPump        = false;
          systemContext.lastSessionLiters = sessionLiters;
          systemContext.lastWaterTime     = now;
          systemContext.state             = STATE_IDLE;
          systemContext.sessionLiters     = 0;
          xSemaphoreGive(dataMutex);
          state = STATE_IDLE;
          Serial.println("✅ Manual watering complete → IDLE");
        }

        break;

      case STATE_WATERING:

        if (handleInterrupts(state, paused, manual)) break;

        if (target <= sessionLiters) {
          xSemaphoreTake(dataMutex, portMAX_DELAY);
          systemContext.lastSessionLiters = sessionLiters;
          systemContext.lastWaterTime     = now;
          systemContext.state             = STATE_IDLE;
          systemContext.sessionLiters     = 0;
          xSemaphoreGive(dataMutex);
          saveState();// save after each watering in case of power loss during watering
          state = STATE_IDLE;
          Serial.println("✅ Watering complete");

        } else if (millis() - lastFlowTime > 30000) {
          xSemaphoreTake(dataMutex, portMAX_DELAY);
          systemContext.state = STATE_DELAYED;
          xSemaphoreGive(dataMutex);
          state        = STATE_DELAYED;
          lastFlowTime = millis();
          Serial.println("⚠️ No water flow → DELAYED");
        }

        break;

      case STATE_DELAYED:

        if (handleInterrupts(state, paused, manual)) break;

        if (millis() - lastFlowTime > RETRY_DELAY_MS) {
          xSemaphoreTake(dataMutex, portMAX_DELAY);
          systemContext.state = STATE_WATERING;
          xSemaphoreGive(dataMutex);
          state        = STATE_WATERING;
          lastFlowTime = millis();
          Serial.println("🔁 Retrying watering");
        }

        break;

      case STATE_BLOCKED:

        xSemaphoreTake(dataMutex, portMAX_DELAY);
        systemContext.pumpOn = false;

        if (!systemContext.paused) {
          systemContext.state = STATE_IDLE;
          state               = STATE_IDLE;
          Serial.println("▶️ Unblocked → IDLE");
        }

        if (systemContext.manualPump) {
          systemContext.state = STATE_MANUAL;
          state               = STATE_MANUAL;
        }

        xSemaphoreGive(dataMutex);
        break;
    }

    // ---- APPLY STATE ----
    if (state == STATE_WATERING || state == STATE_MANUAL) {
      turnOnPump();
    } else {
      turnOffPump();
    }

    vTaskDelay(500 / portTICK_PERIOD_MS);
  }
}