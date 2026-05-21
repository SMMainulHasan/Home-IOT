#include "state_storage.h"
#include "globals.h"
#include <LittleFS.h>
#include <ArduinoJson.h>

#define STATE_FILE   "/state.json"
#define STATE_TMP    "/state.tmp.json"
#define STATE_BACKUP "/state.bak.json"

static const uint32_t STATE_VERSION = 1;

static bool writeStateAtomic() {
  File file = LittleFS.open(STATE_TMP, "w");
  if (!file) return false;

  JsonDocument doc;
  doc["version"] = STATE_VERSION;

  xSemaphoreTake(dataMutex, portMAX_DELAY);
  doc["paused"]        = systemContext.paused;
  doc["lastWaterTime"] = systemContext.lastWaterTime;
  doc["lastLiters"]    = systemContext.lastSessionLiters;
  xSemaphoreGive(dataMutex);

  if (serializeJson(doc, file) == 0) {
    file.close();
    return false;
  }

  file.close();
  return true;
}

static bool validateStateFile(const char* path) {
  File file = LittleFS.open(path, "r");
  if (!file) return false;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, file);
  file.close();

  if (err) return false;
  if (!doc["version"].is<uint32_t>()) return false;
  return true;
}

void saveState() {
  if (!writeStateAtomic()) {
    Serial.println("❌ State temp write failed");
    return;
  }
  if (!validateStateFile(STATE_TMP)) {
    Serial.println("❌ State temp invalid");
    return;
  }

  LittleFS.remove(STATE_BACKUP);
  LittleFS.rename(STATE_FILE, STATE_BACKUP);
  LittleFS.rename(STATE_TMP, STATE_FILE);

  Serial.println("✅ State saved");
}

void loadState() {
  if (!LittleFS.exists(STATE_FILE)) {
    Serial.println("⚠️ No state file — using defaults");

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    systemContext.paused            = false;
    systemContext.lastWaterTime     = 0;
    systemContext.lastSessionLiters = 0.0f;
    xSemaphoreGive(dataMutex);

    saveState();
    return;
  }

  File file = LittleFS.open(STATE_FILE, "r");
  if (!file) return;

  JsonDocument doc;
  if (deserializeJson(doc, file)) {
    Serial.println("❌ State corrupt → restoring backup");
    file.close();
    LittleFS.rename(STATE_BACKUP, STATE_FILE);
    return;
  }
  file.close();

  xSemaphoreTake(dataMutex, portMAX_DELAY);
  systemContext.paused            = doc["paused"]        | false;
  systemContext.lastWaterTime     = doc["lastWaterTime"] | 0;
  systemContext.lastSessionLiters = doc["lastLiters"]    | 0.0f;
  xSemaphoreGive(dataMutex);

  Serial.println("📥 State loaded");
}