#include "schedules_storage.h"
#include "globals.h"
#include <LittleFS.h>
#include <ArduinoJson.h>

#define SCHEDULES_FILE     "/schedules.json"
#define SCHEDULES_TMP      "/schedules.tmp.json"
#define SCHEDULES_BACKUP   "/schedules.bak.json"

static const uint32_t SCHEDULES_VERSION = 1;

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


// Atomically write schedules to a temp file, then validate it before replacing the main file
static bool writeSchedulesAtomic() {
  File file = LittleFS.open(SCHEDULES_TMP, "w");
  if (!file) return false;

  JsonDocument doc;
  doc["version"] = SCHEDULES_VERSION;

  JsonArray arr = doc.createNestedArray("sessions");

  xSemaphoreTake(dataMutex, portMAX_DELAY);
  for (auto& s : systemContext.sessions) {
    JsonObject obj    = arr.createNestedObject();
    obj["scheduleId"] = s.id;
    obj["hour"]       = s.hour;
    obj["minute"]     = s.minute;
    obj["liters"]     = s.liters;
    obj["waterDone"]  = s.waterDone;
  }
  xSemaphoreGive(dataMutex);

  if (serializeJson(doc, file) == 0) {
    file.close();
    return false;
  }

  file.close();
  return true;
}


// Validate schedules file by checking if it can be deserialized and has correct version
static bool validateSchedulesFile(const char* path) {
  File file = LittleFS.open(path, "r");
  if (!file) return false;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, file);
  file.close();

  if (err) return false;
  if (!doc["version"].is<uint32_t>()) return false;
  return true;
}


// Save schedules to flash storage...
void saveSchedules() {
  if (!writeSchedulesAtomic()) {
    Serial.println("❌ Schedules temp write failed");
    return;
  }
  if (!validateSchedulesFile(SCHEDULES_TMP)) {
    Serial.println("❌ Schedules temp invalid");
    return;
  }

  LittleFS.remove(SCHEDULES_BACKUP);
  LittleFS.rename(SCHEDULES_FILE, SCHEDULES_BACKUP);
  LittleFS.rename(SCHEDULES_TMP, SCHEDULES_FILE);

  Serial.println("✅ Schedules saved");
}


// Load schedules from flash storage....
void loadSchedules() {
  if (!LittleFS.exists(SCHEDULES_FILE)) {
    Serial.println("⚠️ No schedules file found");
    return;
  }

  File file = LittleFS.open(SCHEDULES_FILE, "r");
  if (!file) return;

  JsonDocument doc;
  if (deserializeJson(doc, file)) {
    Serial.println("❌ Schedules corrupt → restoring backup");
    file.close();
    LittleFS.rename(SCHEDULES_BACKUP, SCHEDULES_FILE);
    return;
  }
  file.close();

  xSemaphoreTake(dataMutex, portMAX_DELAY);
  systemContext.sessions.clear();
  String hash = "";
  for (JsonObject s : doc["sessions"].as<JsonArray>()) {
    Session session;
    session.id        = s["scheduleId"] | "";
    session.hour      = s["hour"]       | 0;
    session.minute    = s["minute"]     | 0;
    session.liters    = s["liters"]     | 0.0f;
    session.waterDone = s["waterDone"]  | false;
    systemContext.sessions.push_back(session);

    hash += session.id + ","; //creating hash of scheduleIds

    Serial.printf("📥 Schedule: %02d:%02d %.1fL\n",
      session.hour, session.minute, session.liters);
  }
  lastSchedulesHash = hash;
  xSemaphoreGive(dataMutex);
  Serial.printf("📥 %d schedules loaded\n", systemContext.sessions.size());
}