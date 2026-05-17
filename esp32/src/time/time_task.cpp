#include "time_task.h"


void timeTask(void *pvParameters) {
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

    while (true) {
        if (time(nullptr) > 100000) {
            Serial.println("[Time} synced (task)");
            vTaskDelete(NULL); // kill task after success
        }
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}