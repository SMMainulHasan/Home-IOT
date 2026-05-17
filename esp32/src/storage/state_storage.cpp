#include "state_storage.h"
#include "globals.h"
#include "types.h"

#include <LittleFS.h>
#include <ArduinoJson.h>

#define CONFIG_FILE "/config.json"
#define TMP_FILE    "/config.tmp.json"
#define BACKUP_FILE "/config.bak.json"

static const uint32_t CONFIG_VERSION = 1;

void mountFileSystem() {
  if (!LittleFS.begin()) {
    Serial.println("⚠️ Mount failed, formatting...");

    if (!LittleFS.format()) {
      Serial.println("❌ Format failed");
      while (true) delay(1000);
    }

    if (!LittleFS.begin()) {
      Serial.println("❌ Mount failed after format");
      while (true) delay(1000);
    }
  }

  Serial.println("✅ LittleFS mounted");
}

// -------------------- WRITE ATOMIC --------------------
bool writeConfigAtomic() {

  File file = LittleFS.open(TMP_FILE, "w");
  if (!file) return false;

  JsonDocument doc;

  xSemaphoreTake(dataMutex, portMAX_DELAY);

  doc["version"] = CONFIG_VERSION;
  doc["timestamp"] = millis();
  doc["paused"] = systemContext.paused;
  doc["lastWaterTime"] = systemContext.lastWaterTime;

  JsonArray arr = doc.createNestedArray("sessions");

  for (auto &s : systemContext.sessions) {
    JsonObject obj = arr.createNestedObject();
    obj["hour"] = s.hour;
    obj["minute"] = s.minute;
    obj["liters"] = s.liters;
    obj["waterDone"] = s.waterDone;
  }

  xSemaphoreGive(dataMutex);

  if (serializeJson(doc, file) == 0) {
    file.close();
    return false;
  }

  file.close();
  return true;
}

// -------------------- VALIDATE FILE --------------------
bool validateFile(const char* path) {

  File file = LittleFS.open(path, "r");
  if (!file) return false;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, file);

  file.close();

  if (err) return false;
  if (!doc["version"].is<uint32_t>()) return false;

  return true;
}

// -------------------- COMMIT --------------------
bool commitConfig() {

  if (!writeConfigAtomic()) {
    Serial.println("❌ temp write failed");
    return false;
  }

  if (!validateFile(TMP_FILE)) {
    Serial.println("❌ temp invalid");
    return false;
  }

  LittleFS.remove(BACKUP_FILE);
  LittleFS.rename(CONFIG_FILE, BACKUP_FILE);
  LittleFS.rename(TMP_FILE, CONFIG_FILE);

  Serial.println("✅ Config committed safely");

  return true;
}

// -------------------- LOAD --------------------
void loadConfig() {

  if (!LittleFS.exists(CONFIG_FILE)) {
    Serial.println("⚠️ No config found → creating default");

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    systemContext.paused = false;
    systemContext.lastWaterTime = 0;
    systemContext.sessions.clear();
    xSemaphoreGive(dataMutex);

    commitConfig();
    return;
  }

  File file = LittleFS.open(CONFIG_FILE, "r");
  if (!file) return;

  JsonDocument doc;

  if (deserializeJson(doc, file)) {
    Serial.println("❌ Config corrupt → restoring backup");

    file.close();
    LittleFS.rename(BACKUP_FILE, CONFIG_FILE);
    return;
  }

  file.close();

  uint32_t version = doc["version"] | 0;

  if (version > CONFIG_VERSION) {
    Serial.println("⚠️ Config version too new");
    return;
  }

  xSemaphoreTake(dataMutex, portMAX_DELAY);

  systemContext.paused = doc["paused"] | false;
  systemContext.lastWaterTime = doc["lastWaterTime"] | 0;

  systemContext.sessions.clear();

  JsonArray arr = doc["sessions"].as<JsonArray>();
  for (JsonObject s : arr) {
    Session session;
    session.hour = s["hour"] | 0;
    
    session.minute = s["minute"] | 0;
    session.liters = s["liters"] | 0.0;
    session.waterDone = s["waterDone"] | false;

    Serial.printf("📥 Loaded session: %02d:%02d, %.1fL, done=%s\n", session.hour, session.minute, session.liters, session.waterDone ? "true" : "false");

    systemContext.sessions.push_back(session);
  }

  xSemaphoreGive(dataMutex);

  Serial.println("📥 Config loaded safely");
}

// -------------------- SAVE DEBOUNCED --------------------
void saveConfigIfNeeded() {

  if (!configDirty) return;

  static unsigned long lastSave = 0;

  if (millis() - lastSave < 10000) return;

  if (commitConfig()) {
    configDirty = false;
    lastSave = millis();
  }
}