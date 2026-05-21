#include "time_manager.h"

void initRTC() {
  setenv("TZ", "BDT-6", 1);
  tzset();

  Wire.begin();
  if (!rtc.begin()) {
    Serial.println("❌ RTC not found");
    rtcAvailable = false;
    return;
  }

  if (rtc.lostPower()) {
    Serial.println("⚠️ RTC lost power — waiting for server time");
  }

  rtcAvailable = true;

  // ✅ load RTC time into system on boot
  DateTime now = rtc.now();
  if (now.year() >= 2024) {
    struct timeval tv;
    tv.tv_sec  = now.unixtime();
    tv.tv_usec = 0;
    settimeofday(&tv, NULL);
    Serial.printf("[Time] ✅ RTC loaded: %02d:%02d:%02d\n",
      now.hour(), now.minute(), now.second());
  } else {
    Serial.println("[Time] ⚠️ RTC invalid — waiting for server time");
  }
}