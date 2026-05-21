#include "time_manager.h"

void initRTC() {
  // set timezone FIRST
  setenv("TZ", "BDT-6", 1);
  tzset();

  Wire.begin();
  if (!rtc.begin()) {
    Serial.println("❌ RTC not found");
    rtcAvailable = false;
    return;
  }

  rtcAvailable = true;

  DateTime now = rtc.now();
  if (now.year() >= 2024) {
    struct timeval tv;
    tv.tv_sec  = now.unixtime(); // UTC unix time
    tv.tv_usec = 0;
    settimeofday(&tv, NULL); // system stores UTC

    //localtime_r will convert it to local time based on timezone set above
    time_t now = time(nullptr);
    struct tm nowTm;
    localtime_r(&now, &nowTm);

    Serial.printf("[RTC] Local time: %02d:%02d\n", nowTm.tm_hour, nowTm.tm_min);

  }
}